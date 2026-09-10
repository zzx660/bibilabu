<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar, Search as VanSearch, Pagination } from 'vant'
import { api } from '@/api/hono'

const router = useRouter()
const tab = ref<'verse' | 'person'>('verse')
const kw = ref('')
const verses = ref<any[]>([])
const persons = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const pageSize = 20
const loading = ref(false)

async function search(p = 1) {
  const q = kw.value.trim()
  if (!q) return
  page.value = p
  loading.value = true
  try {
    if (tab.value === 'verse') {
      const { items, total: t } = await api.searchVerses(q, p, pageSize)
      verses.value = items
      total.value = t
    } else {
      const { items, total: t } = await api.searchPersons(q, p, pageSize)
      persons.value = items
      total.value = t
    }
  } finally {
    loading.value = false
  }
}

function highlight(text: string) {
  const parts = kw.value.trim().split(/\s+/)
  if (!parts.length || !text) return text
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${parts.map(esc).join('|')})`, 'gi')
  return text.replace(re, '<mark>$1</mark>')
}

function onSearch() { search(1) }

function gotoVerse(v: any) {
  router.push(`/read/${v.book_code}/${v.chapter}`)
}

function gotoPerson(p: any) {
  router.push(`/person/${p.id}`)
}
</script>

<template>
  <div class="page">
    <NavBar title="搜索" left-arrow @click-left="router.back()" />
    <VanSearch v-model="kw" placeholder="输入关键词(多词空格分隔)" @search="onSearch" />

    <div class="tabs">
      <span :class="{ active: tab === 'verse' }" @click="tab = 'verse'; search(1)">经文</span>
      <span :class="{ active: tab === 'person' }" @click="tab = 'person'; search(1)">人物</span>
    </div>

    <div v-if="loading" class="center muted py-10">搜索中…</div>

    <div v-else-if="tab === 'verse'" class="list">
      <div v-for="v in verses" :key="v.id" class="item" @click="gotoVerse(v)">
        <div class="ref">{{ v.book_name_zh }} {{ v.chapter }}:{{ v.verse }}</div>
        <div class="txt" v-html="highlight(v.text_zh)"></div>
      </div>
      <div v-if="!verses.length && kw" class="center muted">无结果</div>
    </div>

    <div v-else class="list">
      <div v-for="p in persons" :key="p.id" class="item" @click="gotoPerson(p)">
        <div class="ref">{{ p.name_zh }} <span class="muted">{{ p.name_en }}</span></div>
        <div class="txt">{{ p.summary?.slice(0, 120) }}</div>
      </div>
      <div v-if="!persons.length && kw" class="center muted">无结果</div>
    </div>

    <Pagination
      v-if="total > pageSize"
      v-model="page"
      :total-items="total"
      :items-per-page="pageSize"
      @update:model-value="search"
    />
  </div>
</template>

<style scoped>
.tabs { display: flex; gap: 20px; padding: 10px 16px; border-bottom: 1px solid var(--line); }
.tabs span { color: var(--muted); cursor: pointer; font-size: 15px; }
.tabs span.active { color: var(--grape); font-weight: 600; }
.list { max-width: 720px; margin: 0 auto; padding: 12px; }
.item { padding: 12px 0; border-bottom: 1px solid var(--line); cursor: pointer; }
.ref { color: var(--grape); font-weight: 600; margin-bottom: 4px; }
.txt { font-size: 15px; line-height: 1.6; }
:deep(mark) { background: #fde68a; color: inherit; padding: 0 2px; border-radius: 2px; }
</style>
