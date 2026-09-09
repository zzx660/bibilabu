import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

// Hono 部署到 Vercel Edge / Cloudflare Workers 都行
const app = new Hono()

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
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
