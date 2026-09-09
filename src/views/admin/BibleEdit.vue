<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Field, Button, Cell, showToast } from 'vant'
import { supabase } from '@/api/supabase'

type Verse = { id: number; book_name_zh: string; chapter: number; verse: number; text_zh: string }

const book = ref('')
const chapter = ref<number | null>(null)
const verses = ref<Verse[]>([])
const edits = ref<Record<number, string>>({})

onMounted(async () => {
  // 默认加载创世记第 1 章
  book.value = 'GEN'
  chapter.value = 1
  await load()
})

async function load() {
  if (!book.value || !chapter.value) return
  const { data } = await supabase
    .from('bible_verses')
    .select('id,book_name_zh,chapter,verse,text_zh')
    .eq('book_code', book.value)
    .eq('chapter', chapter.value)
    .order('verse', { ascending: true })
  verses.value = data || []
  edits.value = {}
}

async function save(id: number) {
  const text = edits.value[id]
  if (!text) return
  const { error } = await supabase.from('bible_verses').update({ text_zh: text }).eq('id', id)
  if (error) { showToast(error.message); return }
  const v = verses.value.find((x) => x.id === id)
  if (v) v.text_zh = text
  delete edits.value[id]
  await logAudit(`verse:${id}`, 'edit_verse')
  showToast('已保存')
}

async function logAudit(target: string, action: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target })
}
</script>

<template>
  <div class="page pinch">
    <div class="pad"><h2 class="title">圣经文本编辑</h2></div>
    <div class="search-bar">
      <Field v-model="book" label="书卷代码" placeholder="如 GEN" />
      <Field :model-value="chapter === null ? '' : String(chapter)" @update:model-value="v => chapter = v ? parseInt(v, 10) : null" type="digit" label="章" placeholder="如 1" />
      <Button type="primary" size="small" @click="load">加载</Button>
    </div>
    <Cell v-for="v in verses" :key="v.id" :title="`${v.verse}节`" :label="v.text_zh">
      <template #extra>
        <Field v-model="edits[v.id]" :placeholder="v.text_zh" rows="2" />
        <Button v-if="edits[v.id]" plain size="mini" @click="save(v.id)">保存</Button>
      </template>
    </Cell>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 18px; }
.search-bar { display: flex; gap: 8px; align-items: end; padding: 0 16px; flex-wrap: wrap; }
.search-bar :deep(.van-field) { flex: 1; min-width: 100px; }
</style>
