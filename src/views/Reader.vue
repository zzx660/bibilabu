<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NavBar, showToast } from 'vant'
import { useBibleStore } from '@/stores/bible'
import VerseCard from '@/components/VerseCard.vue'

const store = useBibleStore()
const route = useRoute()
const router = useRouter()
const showBookPicker = ref(false)

const book = (route.params.book as string) || 'GEN'
const chapter = parseInt((route.params.chapter as string) || '1', 10)

onMounted(async () => {
  await store.loadBooks()
  await store.loadChapter(book, chapter)
})

watch(() => [route.params.book, route.params.chapter], async ([b, c]) => {
  if (b && c) {
    await store.loadChapter(b as string, parseInt(c as string, 10))
  }
})

function jump(n: 'prev' | 'next') {
  const target = n === 'prev' ? store.prevChapter() : store.nextChapter()
  if (!target) {
    showToast(n === 'prev' ? '已是开头' : '已是结尾')
    return
  }
  router.push(`/read/${target[0]}/${target[1]}`)
}
</script>

<template>
  <div class="page pinch">
    <NavBar
      :title="`${store.currentChapter[0]?.book_name_zh || ''} ${store.activeChapterNum} 章`"
      left-text="书卷"
      right-text="下一章"
      @click-left="showBookPicker = true"
      @click-right="jump('next')"
    />
    <div v-if="store.loading" class="center muted py-10">读取中…</div>
    <div v-else>
      <VerseCard
        v-for="v in store.currentChapter"
        :key="v.id"
        :verse="v"
        :book="store.activeBook"
        :chapter="store.activeChapterNum"
      />
    </div>
    <div class="nav row">
      <button class="btn" @click="jump('prev')">上一章</button>
      <button class="btn" @click="jump('next')">下一章</button>
    </div>
  </div>
</template>

<style scoped>
.nav {
  max-width: 720px;
  margin: 16px auto;
  gap: 12px;
  justify-content: center;
}
.btn {
  flex: 1;
  max-width: 200px;
  padding: 10px;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 8px;
  color: var(--ink);
}
</style>
