import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@supabase/supabase-js';
// Hono 部署到 Vercel Edge / Cloudflare Workers 都行
const app = new Hono();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
app.use('*', cors({ origin: process.env.WEB_ORIGIN || '*', allowHeaders: ['Content-Type', 'Authorization'] }));
// 健康检查
app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }));
// 圣经搜索(分页 + 多关键词 AND + total)
app.get('/api/bible/search', async (c) => {
    const q = c.req.query('q')?.trim();
    if (!q)
        return c.json({ items: [], total: 0, page: 1, total_pages: 0 });
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
    const offset = (page - 1) * limit;
    // 多关键词:空格分隔 → AND 匹配
    const keywords = q.split(/\s+/).filter(Boolean);
    const andConditions = keywords.map((k) => `text_zh.ilike.%${k}%`);
    const andFilter = andConditions.join(',');
    // 总数
    const { count } = await supabase
        .from('bible_verses')
        .select('id', { count: 'exact', head: true })
        .or(andFilter);
    const total = count || 0;
    const total_pages = Math.ceil(total / limit);
    // 分页数据
    const { data } = await supabase
        .from('bible_verses')
        .select('id,book_code,book_name_zh,chapter,verse,text_zh')
        .or(andFilter)
        .order('id', { ascending: true })
        .range(offset, offset + limit - 1);
    return c.json({ items: data || [], total, page, total_pages });
});
// 按书卷+章读经
app.get('/api/bible/:book/:chapter', async (c) => {
    const book = c.req.param('book');
    const chapter = parseInt(c.req.param('chapter'), 10);
    if (!book || !chapter)
        return c.json({ error: 'bad params' }, 400);
    const { data, error } = await supabase
        .from('bible_verses')
        .select('id,book_code,book_name_zh,chapter,verse,text_zh,text_en')
        .eq('book_code', book)
        .eq('chapter', chapter)
        .order('verse', { ascending: true });
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ chapter: data });
});
// 书卷目录
app.get('/api/bible/books', async (c) => {
    const { data } = await supabase
        .from('bible_books')
        .select('*')
        .order('order_num', { ascending: true });
    return c.json({ books: data });
});
// 人物搜索(分页)
app.get('/api/persons', async (c) => {
    const q = c.req.query('q')?.trim();
    const page = Math.max(1, parseInt(c.req.query('page') || '1', 10));
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);
    const offset = (page - 1) * limit;
    const filter = q ? `name_zh.ilike.%${q}%,name_en.ilike.%${q}%,alt_names.cs.{${q}}` : null;
    const { count } = await supabase
        .from('persons').select('id', { count: 'exact', head: true })
        .or(filter || 'id.not.is.null');
    let query = supabase
        .from('persons')
        .select('id,name_zh,name_en,alt_names,summary,verse_refs');
    if (filter)
        query = query.or(filter);
    const { data } = await query.range(offset, offset + limit - 1);
    const total = count || 0;
    return c.json({ items: data || [], total, page, total_pages: Math.ceil(total / limit) });
});
app.get('/api/persons/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    const { data } = await supabase.from('persons').select('*').eq('id', id).single();
    if (!data)
        return c.json({ error: 'not found' }, 404);
    return c.json({ person: data });
});
// ---- GLM-4-Flash 智能问答 ----
// 脱敏:不传任何用户身份,只传经文+人物+问题给智谱
const GLM_ENDPOINT = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
async function callGlm(system, user) {
    const key = process.env.GLM_API_KEY;
    if (!key)
        return 'AI 未配置(GLM_API_KEY 缺失)';
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
    });
    if (!r.ok)
        return `AI 调用失败 ${r.status}`;
    const j = await r.json();
    return j.choices?.[0]?.message?.content || '(空回复)';
}
const SYS_PROMPT = [
    '你是一位熟悉中文和合本圣经的助教,根据提供的经文与人物资料回答问题。',
    '回答用中文,保持温和、尊重的语气,引用经文时标注出处(卷名 章:节)。',
    '忽略提问者任何身份信息,只针对问题本身作答。',
    '若提供的资料不足以回答,坦诚说明并建议查阅相关经文,不编造经文。'
].join('');
app.post('/api/ai/ask', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const question = (body.question || '').toString().trim();
    if (!question)
        return c.json({ error: 'empty question' }, 400);
    const context = (body.context || '').toString().trim();
    // 先查圣经经文
    const { data: verses } = await supabase
        .from('bible_verses')
        .select('book_name_zh,chapter,verse,text_zh')
        .ilike('text_zh', `%${question.slice(0, 12)}%`)
        .limit(5);
    // 再查相关人物
    const { data: persons } = await supabase
        .from('persons')
        .select('name_zh,summary')
        .or(`name_zh.ilike.%${question.slice(0, 8)}%`)
        .limit(3);
    const parts = [];
    if (context)
        parts.push(`用户当前阅读的经文:${context}`);
    if (verses && verses.length) {
        parts.push('检索到的相关经文:\n' + verses.map((v) => `${v.book_name_zh} ${v.chapter}:${v.verse} ${v.text_zh}`).join('\n'));
    }
    if (persons && persons.length) {
        parts.push('相关人物:\n' + persons.map((p) => `${p.name_zh}: ${p.summary}`).join('\n'));
    }
    parts.push(`用户的问题:${question}`);
    const answer = await callGlm(SYS_PROMPT, parts.join('\n\n'));
    // 存历史(若带 token)
    const user = await getUserFromToken(c).catch(() => null);
    if (user) {
        await supabase.from('ai_chat_history').insert([
            { user_id: user.id, role: 'user', content: question },
            { user_id: user.id, role: 'assistant', content: answer, refs: { verses: (verses || []).map((v) => `${v.book_name_zh} ${v.chapter}:${v.verse}`), persons: (persons || []).map((p) => p.name_zh) } }
        ]);
    }
    return c.json({
        answer,
        refs: {
            verses: (verses || []).map((v) => `${v.book_name_zh} ${v.chapter}:${v.verse}`),
            persons: (persons || []).map((p) => p.name_zh)
        }
    });
});
// AI 对话历史
app.get('/api/ai/history', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { data } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
    return c.json({ items: data || [] });
});
// 清空 AI 历史
app.delete('/api/ai/history', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    await supabase.from('ai_chat_history').delete().eq('user_id', user.id);
    return c.json({ ok: true });
});
// 解读单节经文
app.post('/api/ai/explain', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const verseRef = (body.verse || '').toString().trim();
    if (!verseRef)
        return c.json({ error: 'empty verse' }, 400);
    // verse 形如 "GEN 1:1" 或 "创世记 1:1"
    const match = verseRef.match(/^(\S+)\s+(\d+):(\d+)$/);
    let verseText = '';
    if (match) {
        const [, code, ch, vs] = match;
        const { data } = await supabase
            .from('bible_verses')
            .select('book_name_zh,chapter,verse,text_zh')
            .eq('book_code', code.toUpperCase())
            .eq('chapter', parseInt(ch, 10))
            .eq('verse', parseInt(vs, 10))
            .single();
        if (data)
            verseText = `${data.book_name_zh} ${data.chapter}:${data.verse} ${data.text_zh}`;
    }
    if (!verseText)
        verseText = verseRef;
    const answer = await callGlm(SYS_PROMPT, `请解读这节经文:${verseText}`);
    return c.json({ answer, verse: verseText });
});
// ---- 知识库 RAG ----
// 智谱 embedding-2(1024 维,匹配 schema vector(1024))
async function embed(text) {
    const key = process.env.GLM_API_KEY;
    if (!key)
        return [];
    const r = await fetch('https://open.bigmodel.cn/api/paas/v4/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'embedding-2', input: text.slice(0, 1800) })
    });
    if (!r.ok)
        return [];
    const j = await r.json();
    return j.embeddings?.[0]?.embedding || [];
}
// RAG 问答:问题 → embedding → pgvector 检索 → 拼 prompt → GLM
app.post('/api/ai/rag', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const question = (body.question || '').toString().trim();
    if (!question)
        return c.json({ error: 'empty question' }, 400);
    const qVec = await embed(question);
    if (!qVec.length) {
        // embedding 失败,降级走普通问答
        const { data: verses } = await supabase
            .from('bible_verses')
            .select('book_name_zh,chapter,verse,text_zh')
            .ilike('text_zh', `%${question.slice(0, 12)}%`)
            .limit(5);
        const ctx = verses?.map((v) => `${v.book_name_zh} ${v.chapter}:${v.verse} ${v.text_zh}`).join('\n') || '';
        const answer = await callGlm(SYS_PROMPT, `参考经文:\n${ctx}\n\n问题:${question}`);
        return c.json({ answer, chunks: [], fallback: true });
    }
    // 向量检索(pgvector cosine)
    const { data: chunks, error } = await supabase.rpc('match_knowledge_base', {
        query_embedding: qVec,
        match_count: 5
    });
    if (error)
        console.warn('[rag] match failed:', error.message);
    const retrieved = (chunks || []).map((k) => `[${k.title}] ${k.content}`).join('\n---\n');
    const userMsg = retrieved
        ? `以下是从知识库检索到的相关内容:\n${retrieved}\n\n用户问题:${question}`
        : `知识库暂无相关内容,请基于圣经一般知识回答。问题:${question}`;
    const answer = await callGlm(SYS_PROMPT, userMsg);
    return c.json({
        answer,
        chunks: (chunks || []).map((k) => ({ title: k.title, source: k.source_type, snippet: k.content?.slice(0, 80) }))
    });
});
// 知识库检索(前端可调,用于展示引用来源)
app.post('/api/kb/search', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const q = (body.query || '').toString().trim();
    if (!q)
        return c.json({ items: [] });
    const qVec = await embed(q);
    if (!qVec.length)
        return c.json({ items: [] });
    const { data } = await supabase.rpc('match_knowledge_base', { query_embedding: qVec, match_count: 10 });
    return c.json({ items: data || [] });
});
// ============ 账号系统 ============
// 虚拟邮箱后缀:用户名 + @bibilabu.local 绕过邮箱验证
const FAKE_EMAIL_DOMAIN = 'bibilabu.local';
function fakeEmail(username) {
    return `${username}@${FAKE_EMAIL_DOMAIN}`;
}
// 从 Authorization 头解析 JWT,返回 Supabase user(无则 401)
async function getUserFromToken(c) {
    const auth = c.req.header('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token)
        return null;
    const anon = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: { user } } = await anon.auth.getUser();
    return user;
}
// 1) 注册:账号 + 密码 + 邀请码(可选)
app.post('/api/auth/register', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = (body.username || '').toString().trim();
    const password = (body.password || '').toString();
    const inviteCode = (body.invite_code || '').toString().trim();
    if (!username || !password)
        return c.json({ error: '账号和密码不能为空' }, 400);
    if (username.length < 2 || username.length > 32)
        return c.json({ error: '账号长度 2-32 位' }, 400);
    if (!/^[A-Za-z0-9_\u4e00-\u9fa5]+$/.test(username))
        return c.json({ error: '账号只能含字母/数字/下划线/中文' }, 400);
    if (password.length < 6)
        return c.json({ error: '密码至少 6 位' }, 400);
    // 校验邀请码(可选,但如果填了必须有效)
    if (inviteCode) {
        const { data: valid } = await supabase.rpc('validate_invite_code', { code: inviteCode });
        if (!valid)
            return c.json({ error: '邀请码无效' }, 400);
    }
    // 检查 username 是否已被占用(查 profiles.username)
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
    if (existing)
        return c.json({ error: '账号已存在' }, 409);
    // 关闭邮箱验证的判断:尝试直接用 admin API 创建用户并设置 email_confirm=false
    // 这样即使用户输入的是虚拟邮箱,也不需要点确认链接
    const email = fakeEmail(username);
    const { data: adminUser, error: adminErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // 直接确认!绕过邮件验证
        user_metadata: { username, display_name: username, invite_code: inviteCode || null }
    });
    if (adminErr) {
        // 如果 admin 权限不够,降级尝试 signUp(需邮箱验证关闭)
        if (adminErr.message.includes('email_confirm')) {
            const { data: signup, error: signupErr } = await supabase.auth.signUp({
                email, password,
                options: { data: { username, display_name: username, invite_code: inviteCode || null } }
            });
            if (signupErr)
                return c.json({ error: signupErr.message }, 400);
            // 手动确认邮箱(用 admin API)
            if (signup.user) {
                await supabase.auth.admin.updateUserById(signup.user.id, { email_confirm: true });
            }
            return c.json({ ok: true, user: signup.user, session: signup.session });
        }
        return c.json({ error: adminErr.message }, 500);
    }
    // 返回 token 让前端直接登录(admin createUser 不返回 session,需要 signIn)
    const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr)
        return c.json({ ok: true, user: adminUser.user, note: '请重新登录' });
    return c.json({ ok: true, user: signIn.user, session: signIn.session });
});
// 2) 登录:账号 + 密码
app.post('/api/auth/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const username = (body.username || '').toString().trim();
    const password = (body.password || '').toString();
    if (!username || !password)
        return c.json({ error: '账号和密码不能为空' }, 400);
    // 先查 profiles 拿真正的 email(兼容用户用真实邮箱注册的情况)
    const { data: profile } = await supabase
        .from('profiles').select('email').eq('username', username).maybeSingle();
    const email = profile?.email || fakeEmail(username);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error)
        return c.json({ error: '账号或密码错误' }, 401);
    return c.json({ ok: true, user: data.user, session: data.session });
});
// 3) 当前用户信息(含 friend_code / invite_code / role)
app.get('/api/auth/me', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { data: profile } = await supabase
        .from('profiles')
        .select('id,username,email,friend_code,invite_code,role,display_name,avatar_url,created_at')
        .eq('id', user.id)
        .maybeSingle();
    if (!profile)
        return c.json({ error: 'profile 不存在' }, 404);
    return c.json({ profile });
});
// 4) 改邀请码(自己改自己的,或 admin 改别人的)
app.put('/api/auth/invite-code', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const newCode = (body.invite_code || '').toString().trim().toUpperCase();
    if (!newCode)
        return c.json({ error: '邀请码不能为空' }, 400);
    if (newCode.length < 4 || newCode.length > 16)
        return c.json({ error: '邀请码 4-16 位' }, 400);
    // 判断权限:自己改自己 OR admin 改别人
    const targetId = body.target_id ? body.target_id : user.id;
    const { data: actor } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (targetId !== user.id && actor?.role !== 'admin') {
        return c.json({ error: '无权限' }, 403);
    }
    const { data, error } = await supabase
        .from('profiles').update({ invite_code: newCode }).eq('id', targetId).select('id,invite_code').maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true, profile: data });
});
// 5) admin 提升/取消他人 admin
app.put('/api/auth/role', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { data: actor } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (actor?.role !== 'admin')
        return c.json({ error: '仅 admin 可操作' }, 403);
    const body = await c.req.json().catch(() => ({}));
    const targetId = body.target_id;
    const role = body.role; // 'admin' | 'user'
    if (!targetId || !['admin', 'user'].includes(role))
        return c.json({ error: '参数错误' }, 400);
    const { data, error } = await supabase
        .from('profiles').update({ role }).eq('id', targetId).select('id,username,role,friend_code,invite_code').maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true, profile: data });
});
// 6) 用 friend_code / username 查找用户(加好友用)
app.get('/api/auth/search', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const q = (c.req.query('q') || '').toString().trim();
    if (!q)
        return c.json({ items: [] });
    const { data } = await supabase
        .from('profiles')
        .select('id,username,friend_code,display_name,role')
        .or(`friend_code.ilike.%${q}%,username.ilike.%${q}%`)
        .neq('id', user.id)
        .limit(20);
    return c.json({ items: data || [] });
});
// ============ 好友系统 ============
// 列出好友 + 收到的请求 + 发出的请求
app.get('/api/friends', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { data } = await supabase
        .from('friends')
        .select('user_id, friend_id, status, message, remark, created_at, accepted_at')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    const friendIds = new Set();
    const received = [];
    const sent = [];
    for (const row of data || []) {
        const otherId = row.user_id === user.id ? row.friend_id : row.user_id;
        if (row.status === 'accepted')
            friendIds.add(otherId);
        else if (row.status === 'pending') {
            if (row.friend_id === user.id)
                received.push({ from: row.user_id, message: row.message, created_at: row.created_at });
            else
                sent.push({ to: row.friend_id, message: row.message, created_at: row.created_at });
        }
    }
    let friends = [];
    if (friendIds.size) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id,username,friend_code,display_name,avatar_url,title')
            .in('id', Array.from(friendIds));
        // 附带 remark
        friends = (profiles || []).map((p) => {
            const rel = (data || []).find((r) => (r.user_id === user.id && r.friend_id === p.id) || (r.friend_id === user.id && r.user_id === p.id));
            return { ...p, remark: rel?.remark || null };
        });
    }
    const fillProfiles = async (list, idKey) => {
        if (!list.length)
            return [];
        const ids = list.map((x) => x[idKey]);
        const { data: ps } = await supabase
            .from('profiles').select('id,username,friend_code,display_name,avatar_url').in('id', ids);
        return (ps || []).map((p) => {
            const r = list.find((x) => x[idKey] === p.id);
            return { ...p, message: r?.message || null, created_at: r?.created_at };
        });
    };
    const receivedList = await fillProfiles(received, 'from');
    const sentList = await fillProfiles(sent, 'to');
    return c.json({ friends, requests: receivedList, sent: sentList });
});
// 发好友请求
app.post('/api/friends/request', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const friendCode = (body.friend_code || '').toString().trim();
    const message = (body.message || '').toString().trim().slice(0, 200);
    if (!friendCode)
        return c.json({ error: '请输入对方好友码' }, 400);
    const { data: target } = await supabase
        .from('profiles').select('id').eq('friend_code', friendCode).maybeSingle();
    if (!target)
        return c.json({ error: '用户不存在' }, 404);
    if (target.id === user.id)
        return c.json({ error: '不能加自己' }, 400);
    // 检查是否已是好友或已请求
    const { data: exists } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${target.id}),and(user_id.eq.${target.id},friend_id.eq.${user.id})`)
        .maybeSingle();
    if (exists) {
        if (exists.status === 'accepted')
            return c.json({ error: '已经是好友了' }, 400);
        if (exists.user_id === target.id && exists.status === 'pending') {
            // 对方之前加过我,我直接接受
            await supabase.from('friends').update({ status: 'accepted', accepted_at: new Date().toISOString() })
                .eq('user_id', target.id).eq('friend_id', user.id);
            return c.json({ ok: true, accepted: true });
        }
        return c.json({ error: '已发送过请求,等待对方同意' }, 400);
    }
    const { error } = await supabase.from('friends').insert({
        user_id: user.id, friend_id: target.id, status: 'pending', message
    });
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
// 改好友备注
app.put('/api/friends/:id/remark', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const friendId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const remark = (body.remark || '').toString().slice(0, 50);
    const { error } = await supabase.from('friends')
        .update({ remark })
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
// 查看好友详细信息
app.get('/api/friends/:id/profile', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const friendId = c.req.param('id');
    // 必须是好友才能看
    const { data: rel } = await supabase.from('friends')
        .select('remark,status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
        .maybeSingle();
    if (!rel || rel.status !== 'accepted')
        return c.json({ error: '不是好友' }, 403);
    const { data: profile } = await supabase.from('profiles')
        .select('id,username,friend_code,display_name,avatar_url,title,bio,created_at')
        .eq('id', friendId).maybeSingle();
    if (!profile)
        return c.json({ error: '用户不存在' }, 404);
    return c.json({ profile: { ...profile, remark: rel.remark } });
});
// 接受好友请求
app.post('/api/friends/accept', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const fromId = body.from_id;
    if (!fromId)
        return c.json({ error: '参数错误' }, 400);
    const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('user_id', fromId).eq('friend_id', user.id).eq('status', 'pending')
        .select()
        .maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    if (!data)
        return c.json({ error: '请求不存在' }, 404);
    return c.json({ ok: true });
});
// 删除好友/拒绝请求
app.delete('/api/friends/:id', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const friendId = c.req.param('id');
    if (!friendId)
        return c.json({ error: '参数错误' }, 400);
    const { error } = await supabase.from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
// ============ 书签 ============
app.get('/api/bookmarks', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { data } = await supabase
        .from('bookmarks').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false });
    return c.json({ items: data || [] });
});
app.post('/api/bookmarks', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const { book_code, book_name_zh, chapter, verse_start, verse_end, note, color } = body;
    if (!book_code || !chapter || !verse_start)
        return c.json({ error: '参数不全' }, 400);
    const { data, error } = await supabase.from('bookmarks').insert({
        user_id: user.id, book_code, book_name_zh: book_name_zh || '',
        chapter, verse_start, verse_end: verse_end || 0,
        note: note || '', color: color || '#b89b5e'
    }).select().maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ bookmark: data });
});
app.put('/api/bookmarks/:id', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const id = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const { data, error } = await supabase.from('bookmarks')
        .update({ note: body.note, color: body.color })
        .eq('id', id).eq('user_id', user.id).select().maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ bookmark: data });
});
app.delete('/api/bookmarks/:id', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    await supabase.from('bookmarks').delete().eq('id', c.req.param('id')).eq('user_id', user.id);
    return c.json({ ok: true });
});
// ============ 代祷 ============
app.post('/api/prayers', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const name = (body.name || '').toString().trim();
    const content = (body.content || '').toString().trim();
    const visibility = body.visibility || 'friends';
    if (!name || !content)
        return c.json({ error: '姓名和代祷需求必填' }, 400);
    const { data, error } = await supabase.from('prayers')
        .insert({ user_id: user.id, name, content, visibility }).select().maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ prayer: data });
});
app.get('/api/prayers/mine', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { data } = await supabase.from('prayers')
        .select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    return c.json({ items: data || [] });
});
// 好友 + 同群成员可见的代祷
app.get('/api/prayers/friends', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    // 我的好友 ID
    const { data: friendRows } = await supabase.from('friends')
        .select('user_id,friend_id').eq('status', 'accepted')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    const friendIds = new Set();
    for (const r of friendRows || []) {
        friendIds.add(r.user_id === user.id ? r.friend_id : r.user_id);
    }
    // 我所在的群 → 群成员 ID
    const { data: myRooms } = await supabase.from('chat_room_members')
        .select('room_id').eq('user_id', user.id);
    const groupMemberIds = new Set();
    if (myRooms && myRooms.length) {
        const roomIds = myRooms.map((r) => r.room_id);
        const { data: members } = await supabase.from('chat_room_members')
            .select('user_id').in('room_id', roomIds);
        for (const m of members || [])
            groupMemberIds.add(m.user_id);
    }
    const visibleUserIds = Array.from(new Set([...friendIds, ...groupMemberIds, user.id]));
    if (!visibleUserIds.length)
        return c.json({ items: [] });
    const { data } = await supabase.from('prayers')
        .select('*').in('user_id', visibleUserIds)
        .order('created_at', { ascending: false })
        .limit(100);
    // 附带打卡数
    const ids = (data || []).map((p) => p.id);
    let checkinMap = {};
    let myCheckins = new Set();
    if (ids.length) {
        const { data: cis } = await supabase.from('prayer_checkins')
            .select('prayer_id,user_id').in('prayer_id', ids);
        for (const ci of cis || []) {
            checkinMap[ci.prayer_id] = (checkinMap[ci.prayer_id] || 0) + 1;
            if (ci.user_id === user.id)
                myCheckins.add(ci.prayer_id);
        }
    }
    const items = (data || []).map((p) => ({
        ...p, checkin_count: checkinMap[p.id] || 0, checked: myCheckins.has(p.id)
    }));
    return c.json({ items });
});
app.delete('/api/prayers/:id', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const { error } = await supabase.from('prayers')
        .delete().eq('id', c.req.param('id')).eq('user_id', user.id);
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
app.post('/api/prayers/:id/checkin', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const prayerId = c.req.param('id');
    // upsert
    const { error } = await supabase.from('prayer_checkins')
        .insert({ prayer_id: prayerId, user_id: user.id });
    if (error) {
        if (error.code === '23505')
            return c.json({ ok: true, already: true });
        return c.json({ error: error.message }, 500);
    }
    return c.json({ ok: true });
});
// ============ 群组 ============
// 建群
app.post('/api/groups', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const title = (body.title || '').toString().trim() || '新群聊';
    const memberIds = Array.isArray(body.member_ids) ? body.member_ids : [];
    const { data: room, error: rErr } = await supabase.from('chat_rooms')
        .insert({ type: 'group', title, created_by: user.id, owner_id: user.id }).select().maybeSingle();
    if (rErr)
        return c.json({ error: rErr.message }, 500);
    // 群主 + 成员
    const members = [{ room_id: room.id, user_id: user.id, role: 'owner' },
        ...memberIds.filter((id) => id !== user.id).map((id) => ({ room_id: room.id, user_id: id, role: 'member' }))];
    await supabase.from('chat_room_members').insert(members);
    return c.json({ group: room });
});
// 改群资料
app.put('/api/groups/:id', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    // 权限:owner 或 admin
    const { data: role } = await supabase.from('chat_room_members')
        .select('role').eq('room_id', gid).eq('user_id', user.id).maybeSingle();
    if (!role || !['owner', 'admin'].includes(role.role))
        return c.json({ error: '无权限' }, 403);
    const update = {};
    if (body.title !== undefined)
        update.title = body.title;
    if (body.avatar_url !== undefined)
        update.avatar_url = body.avatar_url;
    const { data, error } = await supabase.from('chat_rooms')
        .update(update).eq('id', gid).select().maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ group: data });
});
// 改公告
app.put('/api/groups/:id/announcement', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const { data: role } = await supabase.from('chat_room_members')
        .select('role').eq('room_id', gid).eq('user_id', user.id).maybeSingle();
    if (!role || !['owner', 'admin'].includes(role.role))
        return c.json({ error: '无权限' }, 403);
    const { data, error } = await supabase.from('chat_rooms')
        .update({ announcement: body.announcement || '' }).eq('id', gid).select().maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ group: data });
});
// 设/取消管理员(仅 owner)
app.put('/api/groups/:id/role', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const { data: room } = await supabase.from('chat_rooms')
        .select('owner_id').eq('id', gid).maybeSingle();
    if (!room || room.owner_id !== user.id)
        return c.json({ error: '仅群主可操作' }, 403);
    const { error } = await supabase.from('chat_room_members')
        .update({ role: body.role }).eq('room_id', gid).eq('user_id', body.user_id);
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
// 拉人入群(owner/admin)
app.post('/api/groups/:id/invite', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));
    const { data: role } = await supabase.from('chat_room_members')
        .select('role').eq('room_id', gid).eq('user_id', user.id).maybeSingle();
    if (!role || !['owner', 'admin'].includes(role.role))
        return c.json({ error: '无权限' }, 403);
    const memberIds = Array.isArray(body.member_ids) ? body.member_ids : [];
    const rows = memberIds.map((id) => ({ room_id: gid, user_id: id, role: 'member' }));
    const { error } = await supabase.from('chat_room_members').insert(rows);
    if (error && error.code !== '23505')
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
// 踢人(owner/admin)
app.delete('/api/groups/:id/members/:uid', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    const { data: role } = await supabase.from('chat_room_members')
        .select('role').eq('room_id', gid).eq('user_id', user.id).maybeSingle();
    if (!role || !['owner', 'admin'].includes(role.role))
        return c.json({ error: '无权限' }, 403);
    await supabase.from('chat_room_members').delete().eq('room_id', gid).eq('user_id', c.req.param('uid'));
    return c.json({ ok: true });
});
// 群成员列表
app.get('/api/groups/:id/members', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    // 必须在群里
    const { data: me } = await supabase.from('chat_room_members')
        .select('room_id').eq('room_id', gid).eq('user_id', user.id).maybeSingle();
    if (!me)
        return c.json({ error: '不在群内' }, 403);
    const { data } = await supabase.from('chat_room_members')
        .select('user_id,role,joined_at, profiles(id,username,display_name,avatar_url,title)')
        .eq('room_id', gid);
    const { data: room } = await supabase.from('chat_rooms')
        .select('id,title,announcement,avatar_url,owner_id').eq('id', gid).maybeSingle();
    return c.json({ members: data || [], group: room });
});
// 退群
app.delete('/api/groups/:id/leave', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const gid = c.req.param('id');
    await supabase.from('chat_room_members').delete().eq('room_id', gid).eq('user_id', user.id);
    return c.json({ ok: true });
});
// ============ 个人资料 ============
app.put('/api/me/profile', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const update = {};
    for (const k of ['display_name', 'avatar_url', 'title', 'bio', 'show_en']) {
        if (body[k] !== undefined)
            update[k] = body[k];
    }
    const { data, error } = await supabase.from('profiles')
        .update(update).eq('id', user.id).select('id,username,email,friend_code,invite_code,role,display_name,avatar_url,title,bio,show_en,last_book,last_chapter,created_at').maybeSingle();
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ profile: data });
});
// 更新读经位置
app.put('/api/me/reading', async (c) => {
    const user = await getUserFromToken(c);
    if (!user)
        return c.json({ error: '未登录' }, 401);
    const body = await c.req.json().catch(() => ({}));
    const { book, chapter } = body;
    if (!book || !chapter)
        return c.json({ error: '参数不全' }, 400);
    await supabase.from('profiles').update({ last_book: book, last_chapter: chapter }).eq('id', user.id);
    return c.json({ ok: true });
});
// 删除账号:验证用户 JWT 后用 service role 删 auth.users(cascade 删 profile + 数据)
app.post('/api/account/delete', async (c) => {
    const auth = c.req.header('Authorization') || '';
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!token)
        return c.json({ error: 'no token' }, 401);
    const userClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } }
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user)
        return c.json({ error: 'invalid token' }, 401);
    // service role 删用户,触发 cascade 删 profile/chat_room_members 等
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error)
        return c.json({ error: error.message }, 500);
    return c.json({ ok: true });
});
export default app;
// Node.js 独立服务器启动(Vercel Edge 不需要这段)
if (process.env.PORT || process.env.NODE_ENV === 'production') {
    const http = await import('http');
    const port = Number(process.env.PORT) || 8787;
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const request = new Request(url, {
            method: req.method,
            headers: req.headers,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? req : undefined,
            duplex: 'half'
        });
        const response = await app.fetch(request);
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        const body = await response.arrayBuffer();
        res.end(Buffer.from(body));
    });
    server.listen(port, '0.0.0.0', () => {
        console.log(`API running on http://0.0.0.0:${port}`);
    });
}
