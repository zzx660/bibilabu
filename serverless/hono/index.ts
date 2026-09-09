import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

// Hono 部署到 Vercel Edge / Cloudflare Workers 都行
const app = new Hono()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, realtime: { enabled: false } }
)

app.use('*', cors({ origin: process.env.WEB_ORIGIN || '*', allowHeaders: ['Content-Type', 'Authorization'] }))

// 健康检查
app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }))

// 圣经搜索
app.get('/api/bible/search', async (c) => {
  const q = c.req.query('q')?.trim()
  if (!q) return c.json({ items: [], total: 0 })
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 200)

  // 精确短语 + 模糊 兜底
  const phrase = q.replace(/\s+/g, ' ')
  const { data: exact } = await supabase
    .from('bible_verses')
    .select('id,book_code,book_name_zh,chapter,verse,text_zh')
    .ilike('text_zh', `%${phrase}%`)
    .limit(limit)

  let items = exact || []
  if (items.length < limit) {
    const have = new Set(items.map((v: any) => v.id))
    const { data: fuzzy } = await supabase
      .from('bible_verses')
      .select('id,book_code,book_name_zh,chapter,verse,text_zh')
      .textSearch('search_text', phrase, { type: 'websearch' })
      .limit(limit - items.length)
    for (const v of fuzzy || []) {
      if (!have.has((v as any).id)) items.push(v)
    }
  }
  return c.json({ items, total: items.length })
})

// 按书卷+章读经
app.get('/api/bible/:book/:chapter', async (c) => {
  const book = c.req.param('book')
  const chapter = parseInt(c.req.param('chapter'), 10)
  if (!book || !chapter) return c.json({ error: 'bad params' }, 400)

  const { data, error } = await supabase
    .from('bible_verses')
    .select('id,book_code,book_name_zh,chapter,verse,text_zh,text_en')
    .eq('book_code', book)
    .eq('chapter', chapter)
    .order('verse', { ascending: true })
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ chapter: data })
})

// 书卷目录
app.get('/api/bible/books', async (c) => {
  const { data } = await supabase
    .from('bible_books')
    .select('*')
    .order('order_num', { ascending: true })
  return c.json({ books: data })
})

// 人物搜索
app.get('/api/persons', async (c) => {
  const q = c.req.query('q')?.trim()
  let query = supabase.from('persons').select('id,name_zh,name_en,alt_names,summary,verse_refs')
  if (q) query = query.or(`name_zh.ilike.%${q}%,name_en.ilike.%${q}%`)
  const { data } = await query.limit(30)
  return c.json({ items: data })
})

app.get('/api/persons/:id', async (c) => {
  const id = parseInt(c.req.param('id'), 10)
  const { data } = await supabase.from('persons').select('*').eq('id', id).single()
  if (!data) return c.json({ error: 'not found' }, 404)
  return c.json({ person: data })
})

// ---- GLM-4-Flash 智能问答 ----
// 脱敏:不传任何用户身份,只传经文+人物+问题给智谱
const GLM_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

async function callGlm(system: string, user: string) {
  const key = process.env.GLM_API_KEY
  if (!key) return 'AI 未配置(GLM_API_KEY 缺失)'
  const r = await fetch(GLM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'glm-4-flash',
      temperature: 0.6,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    })
  })
  if (!r.ok) return `AI 调用失败 ${r.status}`
  const j = await r.json()
  return j.choices?.[0]?.message?.content || '(空回复)'
}

const SYS_PROMPT = [
  '你是一位熟悉中文和合本圣经的助教,根据提供的经文与人物资料回答问题。',
  '回答用中文,保持温和、尊重的语气,引用经文时标注出处(卷名 章:节)。',
  '忽略提问者任何身份信息,只针对问题本身作答。',
  '若提供的资料不足以回答,坦诚说明并建议查阅相关经文,不编造经文。'
].join('')

app.post('/api/ai/ask', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const question = (body.question || '').toString().trim()
  if (!question) return c.json({ error: 'empty question' }, 400)
  const context = (body.context || '').toString().trim()

  // 先查圣经经文
  const { data: verses } = await supabase
    .from('bible_verses')
    .select('book_name_zh,chapter,verse,text_zh')
    .ilike('text_zh', `%${question.slice(0, 12)}%`)
    .limit(5)

  // 再查相关人物
  const { data: persons } = await supabase
    .from('persons')
    .select('name_zh,summary')
    .or(`name_zh.ilike.%${question.slice(0, 8)}%`)
    .limit(3)

  const parts: string[] = []
  if (context) parts.push(`用户当前阅读的经文:${context}`)
  if (verses && verses.length) {
    parts.push('检索到的相关经文:\n' + verses.map((v: any) => `${v.book_name_zh} ${v.chapter}:${v.verse} ${v.text_zh}`).join('\n'))
  }
  if (persons && persons.length) {
    parts.push('相关人物:\n' + persons.map((p: any) => `${p.name_zh}: ${p.summary}`).join('\n'))
  }
  parts.push(`用户的问题:${question}`)

  const answer = await callGlm(SYS_PROMPT, parts.join('\n\n'))
  return c.json({
    answer,
    refs: {
      verses: (verses || []).map((v: any) => `${v.book_name_zh} ${v.chapter}:${v.verse}`),
      persons: (persons || []).map((p: any) => p.name_zh)
    }
  })
})

// 解读单节经文
app.post('/api/ai/explain', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const verseRef = (body.verse || '').toString().trim()
  if (!verseRef) return c.json({ error: 'empty verse' }, 400)

  // verse 形如 "GEN 1:1" 或 "创世记 1:1"
  const match = verseRef.match(/^(\S+)\s+(\d+):(\d+)$/)
  let verseText = ''
  if (match) {
    const [, code, ch, vs] = match
    const { data } = await supabase
      .from('bible_verses')
      .select('book_name_zh,chapter,verse,text_zh')
      .eq('book_code', code.toUpperCase())
      .eq('chapter', parseInt(ch, 10))
      .eq('verse', parseInt(vs, 10))
      .single()
    if (data) verseText = `${data.book_name_zh} ${data.chapter}:${data.verse} ${data.text_zh}`
  }
  if (!verseText) verseText = verseRef

  const answer = await callGlm(SYS_PROMPT, `请解读这节经文:${verseText}`)
  return c.json({ answer, verse: verseText })
})

// ---- 知识库 RAG ----
// 智谱 embedding-2(1024 维,匹配 schema vector(1024))
async function embed(text: string): Promise<number[]> {
  const key = process.env.GLM_API_KEY
  if (!key) return []
  const r = await fetch('https://open.bigmodel.cn/api/paas/v4/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'embedding-2', input: text.slice(0, 1800) })
  })
  if (!r.ok) return []
  const j = await r.json()
  return j.embeddings?.[0]?.embedding || []
}

// RAG 问答:问题 → embedding → pgvector 检索 → 拼 prompt → GLM
app.post('/api/ai/rag', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const question = (body.question || '').toString().trim()
  if (!question) return c.json({ error: 'empty question' }, 400)

  const qVec = await embed(question)
  if (!qVec.length) {
    // embedding 失败,降级走普通问答
    const { data: verses } = await supabase
      .from('bible_verses')
      .select('book_name_zh,chapter,verse,text_zh')
      .ilike('text_zh', `%${question.slice(0, 12)}%`)
      .limit(5)
    const ctx = verses?.map((v: any) => `${v.book_name_zh} ${v.chapter}:${v.verse} ${v.text_zh}`).join('\n') || ''
    const answer = await callGlm(SYS_PROMPT, `参考经文:\n${ctx}\n\n问题:${question}`)
    return c.json({ answer, chunks: [], fallback: true })
  }

  // 向量检索(pgvector cosine)
  const { data: chunks, error } = await supabase.rpc('match_knowledge_base', {
    query_embedding: qVec,
    match_count: 5
  })
  if (error) console.warn('[rag] match failed:', error.message)

  const retrieved = (chunks || []).map((k: any) => `[${k.title}] ${k.content}`).join('\n---\n')
  const userMsg = retrieved
    ? `以下是从知识库检索到的相关内容:\n${retrieved}\n\n用户问题:${question}`
    : `知识库暂无相关内容,请基于圣经一般知识回答。问题:${question}`

  const answer = await callGlm(SYS_PROMPT, userMsg)
  return c.json({
    answer,
    chunks: (chunks || []).map((k: any) => ({ title: k.title, source: k.source_type, snippet: k.content?.slice(0, 80) }))
  })
})

// 知识库检索(前端可调,用于展示引用来源)
app.post('/api/kb/search', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const q = (body.query || '').toString().trim()
  if (!q) return c.json({ items: [] })
  const qVec = await embed(q)
  if (!qVec.length) return c.json({ items: [] })
  const { data } = await supabase.rpc('match_knowledge_base', { query_embedding: qVec, match_count: 10 })
  return c.json({ items: data || [] })
})

// ============ 账号系统 ============

// 虚拟邮箱后缀:用户名 + @bibilabu.local 绕过邮箱验证
const FAKE_EMAIL_DOMAIN = 'bibilabu.local'

function fakeEmail(username: string) {
  return `${username}@${FAKE_EMAIL_DOMAIN}`
}

// 从 Authorization 头解析 JWT,返回 Supabase user(无则 401)
async function getUserFromToken(c: any) {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const anon = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
  )
  const { data: { user } } = await anon.auth.getUser()
  return user
}

// 1) 注册:账号 + 密码 + 邀请码(可选)
app.post('/api/auth/register', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const username = (body.username || '').toString().trim()
  const password = (body.password || '').toString()
  const inviteCode = (body.invite_code || '').toString().trim()

  if (!username || !password) return c.json({ error: '账号和密码不能为空' }, 400)
  if (username.length < 2 || username.length > 32) return c.json({ error: '账号长度 2-32 位' }, 400)
  if (!/^[A-Za-z0-9_\u4e00-\u9fa5]+$/.test(username)) return c.json({ error: '账号只能含字母/数字/下划线/中文' }, 400)
  if (password.length < 6) return c.json({ error: '密码至少 6 位' }, 400)

  // 校验邀请码(可选,但如果填了必须有效)
  if (inviteCode) {
    const { data: valid } = await supabase.rpc('validate_invite_code', { code: inviteCode })
    if (!valid) return c.json({ error: '邀请码无效' }, 400)
  }

  // 检查 username 是否已被占用(查 profiles.username)
  const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle()
  if (existing) return c.json({ error: '账号已存在' }, 409)

  // 关闭邮箱验证的判断:尝试直接用 admin API 创建用户并设置 email_confirm=false
  // 这样即使用户输入的是虚拟邮箱,也不需要点确认链接
  const email = fakeEmail(username)
  const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 直接确认!绕过邮件验证
    user_metadata: { username, display_name: username, invite_code: inviteCode || null }
  })

  if (adminErr) {
    // 如果 admin 权限不够,降级尝试 signUp(需邮箱验证关闭)
    if (adminErr.message.includes('email_confirm')) {
      const { data: signup, error: signupErr } = await supabase.auth.signUp({
        email, password,
        options: { data: { username, display_name: username, invite_code: inviteCode || null } }
      })
      if (signupErr) return c.json({ error: signupErr.message }, 400)
      // 手动确认邮箱(用 admin API)
      if (signup.user) {
        await supabase.auth.admin.updateUserById(signup.user.id, { email_confirm: true })
      }
      return c.json({ ok: true, user: signup.user, session: signup.session })
    }
    return c.json({ error: adminErr.message }, 500)
  }

  // 返回 token 让前端直接登录(admin createUser 不返回 session,需要 signIn)
  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
  if (signInErr) return c.json({ ok: true, user: adminUser.user, note: '请重新登录' })
  return c.json({ ok: true, user: signIn.user, session: signIn.session })
})

// 2) 登录:账号 + 密码
app.post('/api/auth/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const username = (body.username || '').toString().trim()
  const password = (body.password || '').toString()
  if (!username || !password) return c.json({ error: '账号和密码不能为空' }, 400)

  // 先查 profiles 拿真正的 email(兼容用户用真实邮箱注册的情况)
  const { data: profile } = await supabase
    .from('profiles').select('email').eq('username', username).maybeSingle()

  const email = profile?.email || fakeEmail(username)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return c.json({ error: '账号或密码错误' }, 401)
  return c.json({ ok: true, user: data.user, session: data.session })
})

// 3) 当前用户信息(含 friend_code / invite_code / role)
app.get('/api/auth/me', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id,username,email,friend_code,invite_code,role,display_name,avatar_url,created_at')
    .eq('id', user.id)
    .maybeSingle()
  if (!profile) return c.json({ error: 'profile 不存在' }, 404)
  return c.json({ profile })
})

// 4) 改邀请码(自己改自己的,或 admin 改别人的)
app.put('/api/auth/invite-code', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const body = await c.req.json().catch(() => ({}))
  const newCode = (body.invite_code || '').toString().trim().toUpperCase()
  if (!newCode) return c.json({ error: '邀请码不能为空' }, 400)
  if (newCode.length < 4 || newCode.length > 16) return c.json({ error: '邀请码 4-16 位' }, 400)

  // 判断权限:自己改自己 OR admin 改别人
  const targetId = body.target_id ? body.target_id : user.id
  const { data: actor } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (targetId !== user.id && actor?.role !== 'admin') {
    return c.json({ error: '无权限' }, 403)
  }

  const { data, error } = await supabase
    .from('profiles').update({ invite_code: newCode }).eq('id', targetId).select('id,invite_code').maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true, profile: data })
})

// 5) admin 提升/取消他人 admin
app.put('/api/auth/role', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const { data: actor } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (actor?.role !== 'admin') return c.json({ error: '仅 admin 可操作' }, 403)

  const body = await c.req.json().catch(() => ({}))
  const targetId = body.target_id
  const role = body.role // 'admin' | 'user'
  if (!targetId || !['admin', 'user'].includes(role)) return c.json({ error: '参数错误' }, 400)

  const { data, error } = await supabase
    .from('profiles').update({ role }).eq('id', targetId).select('id,username,role,friend_code,invite_code').maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true, profile: data })
})

// 6) 用 friend_code / username 查找用户(加好友用)
app.get('/api/auth/search', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const q = (c.req.query('q') || '').toString().trim()
  if (!q) return c.json({ items: [] })
  const { data } = await supabase
    .from('profiles')
    .select('id,username,friend_code,display_name,role')
    .or(`friend_code.ilike.%${q}%,username.ilike.%${q}%`)
    .neq('id', user.id)
    .limit(20)
  return c.json({ items: data || [] })
})

// ============ 好友系统 ============

// 列出好友(accepted 的)
app.get('/api/friends', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)

  // 双向查:我主动加的,或别人加我的,status=accepted
  const { data } = await supabase
    .from('friends')
    .select('user_id, friend_id, status, created_at, accepted_at')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

  const ids = new Set<string>()
  const requests: any[] = []
  for (const row of data || []) {
    const otherId = row.user_id === user.id ? row.friend_id : row.user_id
    if (row.status === 'accepted') ids.add(otherId)
    else if (row.status === 'pending' && row.friend_id === user.id) {
      // 别人发来的请求
      requests.push({ from: row.user_id, created_at: row.created_at })
    }
  }

  let friends: any[] = []
  if (ids.size) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id,username,friend_code,display_name,avatar_url')
      .in('id', Array.from(ids))
    friends = profiles || []
  }

  let reqList: any[] = []
  if (requests.length) {
    const fromIds = requests.map((r) => r.from)
    const { data: reqProfiles } = await supabase
      .from('profiles')
      .select('id,username,friend_code,display_name')
      .in('id', fromIds)
    reqList = (reqProfiles || []).map((p: any) => {
      const r = requests.find((x) => x.from === p.id)
      return { ...p, requested_at: r?.created_at }
    })
  }

  return c.json({ friends, requests: reqList })
})

// 发好友请求
app.post('/api/friends/request', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const body = await c.req.json().catch(() => ({}))
  const friendCode = (body.friend_code || '').toString().trim()
  if (!friendCode) return c.json({ error: '请输入对方 friend_code' }, 400)

  const { data: target } = await supabase
    .from('profiles').select('id').eq('friend_code', friendCode).maybeSingle()
  if (!target) return c.json({ error: '用户不存在' }, 404)
  if (target.id === user.id) return c.json({ error: '不能加自己' }, 400)

  // 检查是否已是好友或已请求
  const { data: exists } = await supabase
    .from('friends')
    .select('*')
    .or(`and(user_id.eq.${user.id},friend_id.eq.${target.id}),and(user_id.eq.${target.id},friend_id.eq.${user.id})`)
    .maybeSingle()

  if (exists) {
    if (exists.status === 'accepted') return c.json({ error: '已经是好友了' }, 400)
    if (exists.user_id === target.id && exists.status === 'pending') {
      // 对方之前加过我,我直接接受
      await supabase.from('friends').update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('user_id', target.id).eq('friend_id', user.id)
      return c.json({ ok: true, accepted: true })
    }
    return c.json({ error: '已发送过请求,等待对方同意' }, 400)
  }

  const { error } = await supabase.from('friends').insert({
    user_id: user.id, friend_id: target.id, status: 'pending'
  })
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// 接受好友请求
app.post('/api/friends/accept', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const body = await c.req.json().catch(() => ({}))
  const fromId = body.from_id
  if (!fromId) return c.json({ error: '参数错误' }, 400)

  const { data, error } = await supabase
    .from('friends')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('user_id', fromId).eq('friend_id', user.id).eq('status', 'pending')
    .select()
    .maybeSingle()
  if (error) return c.json({ error: error.message }, 500)
  if (!data) return c.json({ error: '请求不存在' }, 404)
  return c.json({ ok: true })
})

// 删除好友/拒绝请求
app.delete('/api/friends/:id', async (c) => {
  const user = await getUserFromToken(c)
  if (!user) return c.json({ error: '未登录' }, 401)
  const friendId = c.req.param('id')
  if (!friendId) return c.json({ error: '参数错误' }, 400)

  const { error } = await supabase.from('friends')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

// 删除账号:验证用户 JWT 后用 service role 删 auth.users(cascade 删 profile + 数据)
app.post('/api/account/delete', async (c) => {
  const auth = c.req.header('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return c.json({ error: 'no token' }, 401)

  const userClient = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return c.json({ error: 'invalid token' }, 401)

  // service role 删用户,触发 cascade 删 profile/chat_room_members 等
  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ ok: true })
})

export default app

// Node.js 独立服务器启动(Vercel Edge 不需要这段)
if (process.env.PORT || process.env.NODE_ENV === 'production') {
  const http = await import('http')
  const port = Number(process.env.PORT) || 8787
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req as any : undefined,
      duplex: 'half'
    } as RequestInit)
    const response = await app.fetch(request)
    res.statusCode = response.status
    response.headers.forEach((v, k) => res.setHeader(k, v))
    const body = await response.arrayBuffer()
    res.end(Buffer.from(body))
  })
  server.listen(port, '0.0.0.0', () => {
    console.log(`API running on http://0.0.0.0:${port}`)
  })
}
