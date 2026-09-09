<script setup lang="ts">
import { ref } from 'vue'
import { Search as VSearch, Cell, Tabs, Tab } from 'vant'
import { useRouter } from 'vue-router'
import { api } from '@/api/hono'

const tab = ref<'verse' | 'person'>('verse')
const keyword = ref('')
const results = ref<any[]>([])
const searching = ref(false)
const router = useRouter()

async function doSearch() {
  const q = keyword.value.trim()
  if (!q) return
  searching.value = true
  try {
    if (tab.value === 'verse') {
      const { items } = await api.searchVerses(q)
      results.value = items
    } else {
      const { items } = await api.searchPersons(q)
      results.value = items
    }
  } finally {
    searching.value = false
  }
}

function openVerse(v: any) {
  router.push(`/read/${v.book_code}/${v.chapter}`)
}
function openPerson(p: any) {
  router.push(`/person/${p.id}`)
}
</script>

<template>
  <div class="page pinch">
    <Tabs v-model:active="tab" sticky>
      <Tab title="经文" name="verse" />
      <Tab title="人物" name="person" />
    </Tabs>
    <VSearch v-model="keyword" :placeholder="tab === 'verse' ? '搜索经文关键词' : '搜索人物名'" @search="doSearch" show-action>
      <template #action><span class="link" @click="doSearch">搜</span></template>
    </VSearch>
    <div v-if="searching" class="center muted py-6">查找中…</div>
    <div v-else-if="results.length" class="hint muted">共 {{ results.length }} 条</div>
    <template v-if="tab === 'verse'">
      <Cell
        v-for="r in results"
        :key="r.id"
        :title="r.text_zh"
        :label="`${r.book_name_zh} ${r.chapter}:${r.verse}`"
        is-link
        @click="openVerse(r)"
      />
    </template>
    <template v-else>
      <Cell
        v-for="p in results"
        :key="p.id"
        :title="p.name_zh"
        :label="p.summary"
        is-link
        @click="openPerson(p)"
      />
    </template>
  </div>
</template>

<style scoped>
.hint { padding: 8px 16px; font-size: 12px; }
.link { color: var(--grape); }
</style>
