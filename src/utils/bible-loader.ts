// 圣经数据导入:从 midvash/bible-data 拉取 cuvs + kjv,写入 Supabase
// 运行: pnpm seed:bible
// 依赖: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 环境变量

import { createClient } from '@supabase/supabase-js'

const CUVS_URL = 'https://raw.githubusercontent.com/midvash/bible-data/main/versions/zh/cuvs/cuvs.json'
const KJV_URL = 'https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/kjv/kjv.json'

// book 英文名 → OSIS 三字母代码 + 中英文名 + 章节
// 旧约 39 卷 + 新约 27 卷
const BOOKS = [
  // OT
  ['Genesis', 'GEN', '创世记', 'Genesis', 'OT', 50],
  ['Exodus', 'EXO', '出埃及记', 'Exodus', 'OT', 40],
  ['Leviticus', 'LEV', '利未记', 'Leviticus', 'OT', 27],
  ['Numbers', 'NUM', '民数记', 'Numbers', 'OT', 36],
  ['Deuteronomy', 'DEU', '申命记', 'Deuteronomy', 'OT', 34],
  ['Joshua', 'JOS', '约书亚记', 'Joshua', 'OT', 24],
  ['Judges', 'JDG', '士师记', 'Judges', 'OT', 21],
  ['Ruth', 'RUT', '路得记', 'Ruth', 'OT', 4],
  ['1 Samuel', '1SA', '撒母耳记上', '1 Samuel', 'OT', 31],
  ['2 Samuel', '2SA', '撒母耳记下', '2 Samuel', 'OT', 24],
  ['1 Kings', '1KI', '列王纪上', '1 Kings', 'OT', 22],
  ['2 Kings', '2KI', '列王纪下', '2 Kings', 'OT', 25],
  ['1 Chronicles', '1CH', '历代志上', '1 Chronicles', 'OT', 29],
  ['2 Chronicles', '2CH', '历代志下', '2 Chronicles', 'OT', 36],
  ['Ezra', 'EZR', '以斯拉记', 'Ezra', 'OT', 10],
  ['Nehemiah', 'NEH', '尼希米记', 'Nehemiah', 'OT', 13],
  ['Esther', 'EST', '以斯帖记', 'Esther', 'OT', 10],
  ['Job', 'JOB', '约伯记', 'Job', 'OT', 42],
  ['Psalms', 'PSA', '诗篇', 'Psalms', 'OT', 150],
  ['Proverbs', 'PRO', '箴言', 'Proverbs', 'OT', 31],
  ['Ecclesiastes', 'ECC', '传道书', 'Ecclesiastes', 'OT', 12],
  ['Song of Solomon', 'SNG', '雅歌', 'Song of Solomon', 'OT', 8],
  ['Isaiah', 'ISA', '以赛亚书', 'Isaiah', 'OT', 66],
  ['Jeremiah', 'JER', '耶利米书', 'Jeremiah', 'OT', 52],
  ['Lamentations', 'LAM', '耶利米哀歌', 'Lamentations', 'OT', 5],
  ['Ezekiel', 'EZK', '以西结书', 'Ezekiel', 'OT', 48],
  ['Daniel', 'DAN', '但以理书', 'Daniel', 'OT', 12],
  ['Hosea', 'HOS', '何西阿书', 'Hosea', 'OT', 14],
  ['Joel', 'JOL', '约珥书', 'Joel', 'OT', 3],
  ['Amos', 'AMO', '阿摩司书', 'Amos', 'OT', 9],
  ['Obadiah', 'OBA', '俄巴底亚书', 'Obadiah', 'OT', 1],
  ['Jonah', 'JON', '约拿书', 'Jonah', 'OT', 4],
  ['Micah', 'MIC', '弥迦书', 'Micah', 'OT', 7],
  ['Nahum', 'NAM', '那鸿书', 'Nahum', 'OT', 3],
  ['Habakkuk', 'HAB', '哈巴谷书', 'Habakkuk', 'OT', 3],
  ['Zephaniah', 'ZEP', '西番雅书', 'Zephaniah', 'OT', 3],
  ['Haggai', 'HAG', '哈该书', 'Haggai', 'OT', 2],
  ['Zechariah', 'ZEC', '撒迦利亚书', 'Zechariah', 'OT', 14],
  ['Malachi', 'MAL', '玛拉基书', 'Malachi', 'OT', 4],
  // NT
  ['Matthew', 'MAT', '马太福音', 'Matthew', 'NT', 28],
  ['Mark', 'MRK', '马可福音', 'Mark', 'NT', 16],
  ['Luke', 'LUK', '路加福音', 'Luke', 'NT', 24],
  ['John', 'JHN', '约翰福音', 'John', 'NT', 21],
  ['Acts', 'ACT', '使徒行传', 'Acts', 'NT', 28],
  ['Romans', 'ROM', '罗马书', 'Romans', 'NT', 16],
  ['1 Corinthians', '1CO', '哥林多前书', '1 Corinthians', 'NT', 16],
  ['2 Corinthians', '2CO', '哥林多后书', '2 Corinthians', 'NT', 13],
  ['Galatians', 'GAL', '加拉太书', 'Galatians', 'NT', 6],
  ['Ephesians', 'EPH', '以弗所书', 'Ephesians', 'NT', 6],
  ['Philippians', 'PHP', '腓立比书', 'Philippians', 'NT', 4],
  ['Colossians', 'COL', '歌罗西书', 'Colossians', 'NT', 4],
  ['1 Thessalonians', '1TH', '帖撒罗尼迦前书', '1 Thessalonians', 'NT', 5],
  ['2 Thessalonians', '2TH', '帖撒罗尼迦后书', '2 Thessalonians', 'NT', 3],
  ['1 Timothy', '1TI', '提摩太前书', '1 Timothy', 'NT', 6],
  ['2 Timothy', '2TI', '提摩太后书', '2 Timothy', 'NT', 4],
  ['Titus', 'TIT', '提多书', 'Titus', 'NT', 3],
  ['Philemon', 'PHM', '腓利门书', 'Philemon', 'NT', 1],
  ['Hebrews', 'HEB', '希伯来书', 'Hebrews', 'NT', 13],
  ['James', 'JAS', '雅各书', 'James', 'NT', 5],
  ['1 Peter', '1PE', '彼得前书', '1 Peter', 'NT', 5],
  ['2 Peter', '2PE', '彼得后书', '2 Peter', 'NT', 3],
  ['1 John', '1JN', '约翰一书', '1 John', 'NT', 5],
  ['2 John', '2JN', '约翰二书', '2 John', 'NT', 1],
  ['3 John', '3JN', '约翰三书', '3 John', 'NT', 1],
  ['Jude', 'JUD', '犹大书', 'Jude', 'NT', 1],
  ['Revelation', 'REV', '启示录', 'Revelation', 'NT', 22]
] as const

type BookJson = { book: string; chapters: { chapter: number; verses: { number: number; text: string }[] }[] }

async function fetchJson(url: string): Promise<{ books: BookJson[] }> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`拉取失败 ${url}: ${r.status}`)
  return r.json()
}

async function main() {
  const url = process.env.SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!url || !key) {
    console.error('需要 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const sb = createClient(url, key, { auth: { persistSession: false } })

  console.log('拉取 cuvs + kjv …')
  const [cuvs, kjv] = await Promise.all([fetchJson(CUVS_URL), fetchJson(KJV_URL)])

  const cuvMap = new Map(cuvs.books.map((b) => [b.book, b]))
  const kjvMap = new Map(kjv.books.map((b) => [b.book, b]))

  // 写书卷目录
  const bookRows = BOOKS.map((b, i) => ({
    code: b[1],
    name_zh: b[2],
    name_en: b[3],
    testament: b[4],
    order_num: i + 1,
    chapter_count: b[5]
  }))
  const { error: bookErr } = await sb.from('bible_books').upsert(bookRows, { onConflict: 'code' })
  if (bookErr) throw bookErr
  console.log(`书卷目录 ${bookRows.length} 卷已写入`)

  // 写经文
  let total = 0
  for (const [enName, code, zhName, , ,] of BOOKS) {
    const zh = cuvMap.get(enName)
    const en = kjvMap.get(enName)
    if (!zh) {
      console.warn(`缺少中文 ${enName},跳过`)
      continue
    }
    const rows: any[] = []
    for (const ch of zh.chapters) {
      const enCh = en?.chapters.find((c) => c.chapter === ch.chapter)
      for (const v of ch.verses) {
        const enText = enCh?.verses.find((x) => x.number === v.number)?.text || null
        rows.push({
          book_code: code,
          book_name_zh: zhName,
          book_name_en: enName,
          chapter: ch.chapter,
          verse: v.number,
          text_zh: v.text.replace(/^\d+\s*/, ''),
          text_en: enText
        })
      }
    }
    const { error } = await sb.from('bible_verses').upsert(rows, { onConflict: 'book_code,chapter,verse' })
    if (error) throw error
    total += rows.length
    console.log(`  ${zhName} ${rows.length} 节`)
  }
  console.log(`完成,共 ${total} 节`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
