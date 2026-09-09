// 人物字典导入:从 neuu-org/bible-dictionary-dataset 拉取,写入 persons 表
// 运行: pnpm seed:persons

import { createClient } from '@supabase/supabase-js'

// 用 Easton 字典做主源(英文,公共领域),后续可补中文人名映射
const SOURCES = [
  'https://raw.githubusercontent.com/neuu-org/bible-dictionary-dataset/main/data/02_sources/easton/easton.json'
]

type DictEntry = {
  name: string
  slug?: string
  definition: string
  scripture_refs?: string[]
}

async function main() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) {
    console.error('需要 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const sb = createClient(url, key, { auth: { persistSession: false } })

  let entries: DictEntry[] = []
  for (const src of SOURCES) {
    console.log(`拉取 ${src}`)
    const r = await fetch(src)
    if (!r.ok) {
      console.warn(`跳过 ${src}: ${r.status}`)
      continue
    }
    const data = await r.json()
    const list = Array.isArray(data) ? data : data.entries || data.items || []
    entries = entries.concat(list)
  }

  console.log(`共 ${entries.length} 条`)
  const rows = entries
    .filter((e) => e.name && e.definition)
    .map((e) => ({
      name_zh: e.name, // 后续接中文映射
      name_en: e.name,
      summary: e.definition.slice(0, 200),
      biography: e.definition,
      dictionary_refs: [{ source: 'easton', slug: e.slug }],
      verse_refs: e.scripture_refs || []
    }))

  const BATCH = 500
  let done = 0
  while (done < rows.length) {
    const slice = rows.slice(done, done + BATCH)
    const { error } = await sb.from('persons').upsert(slice, { onConflict: 'name_en' })
    if (error) throw error
    done += BATCH
    console.log(`  ${done}/${rows.length}`)
  }
  console.log(`人物字典导入完成,共 ${rows.length} 条`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
