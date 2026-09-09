// 知识库导入:把 persons 表的人物传记分块 + 生成 embedding 写入 knowledge_base
// 后续可改为读取本地注释书文本文件
// 运行: npx tsx src/utils/kb-loader.ts
import { createClient } from '@supabase/supabase-js';
const GLM_EMBED = 'https://open.bigmodel.cn/api/paas/v4/embeddings';
async function embed(text, key) {
    const r = await fetch(GLM_EMBED, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: 'embedding-2', input: text.slice(0, 1800) })
    });
    if (!r.ok)
        throw new Error(`embed ${r.status}`);
    const j = await r.json();
    return j.embeddings?.[0]?.embedding || [];
}
// 简单分块:按段落切,每块 ~600 字,重叠 80
function chunk(text, size = 600, overlap = 80) {
    const out = [];
    let i = 0;
    while (i < text.length) {
        const end = Math.min(i + size, text.length);
        out.push(text.slice(i, end));
        if (end >= text.length)
            break;
        i = end - overlap;
    }
    return out.filter((c) => c.trim().length > 20);
}
async function main() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const glmKey = process.env.GLM_API_KEY;
    if (!url || !key || !glmKey) {
        console.error('需要 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / GLM_API_KEY');
        process.exit(1);
    }
    const sb = createClient(url, key, { auth: { persistSession: false } });
    // 清空旧的 dictionary 类型知识库(重新导入)
    await sb.from('knowledge_base').delete().eq('source_type', 'dictionary');
    // 拉取所有人物
    const { data: persons, error } = await sb
        .from('persons')
        .select('id,name_zh,name_en,summary,biography,verse_refs')
        .limit(500);
    if (error)
        throw error;
    console.log(`人物 ${persons.length} 条,开始分块 + embedding`);
    let done = 0;
    for (const p of persons) {
        const bio = (p.biography || p.summary || '').trim();
        if (bio.length < 30)
            continue;
        const chunks = chunk(bio);
        for (let idx = 0; idx < chunks.length; idx++) {
            const text = chunks[idx];
            try {
                const vec = await embed(text, glmKey);
                if (!vec.length)
                    continue;
                const { error: insErr } = await sb.from('knowledge_base').insert({
                    source_type: 'dictionary',
                    title: `${p.name_zh}${idx > 0 ? ` (续${idx})` : ''}`,
                    content: text,
                    chunk_index: idx,
                    embedding: vec,
                    meta: { person_id: p.id, verse_refs: p.verse_refs },
                    owner_id: null
                });
                if (insErr)
                    console.warn(`写入失败 ${p.name_zh}:`, insErr.message);
            }
            catch (e) {
                console.warn(`embed 失败 ${p.name_zh}:`, e.message);
            }
        }
        done++;
        if (done % 20 === 0)
            console.log(`  ${done}/${persons.length}`);
    }
    console.log(`知识库导入完成,处理 ${done} 个人物`);
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
