<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NavBar, Popup, Picker, showToast } from 'vant'
import { useBibleStore } from '@/stores/bible'
import { api } from '@/api/hono'
import VerseCard from '@/components/VerseCard.vue'

const store = useBibleStore()
const route = useRoute()
const router = useRouter()

const showBookPicker = ref(false)
const showChapterPicker = ref(false)
const testament = ref<'OT' | 'NT'>('OT')
const selectedBook = ref('')

const book = (route.params.book as string) || 'GEN'
const chapter = parseInt((route.params.chapter as string) || '1', 10)

const otBooks = computed(() => store.books.filter((b) => b.testament === 'OT'))
const ntBooks = computed(() => store.books.filter((b) => b.testament === 'NT'))
const currentBook = computed(() => store.books.find((b) => b.code === store.activeBook))
const chapterOptions = computed(() => {
  const b = currentBook.value
  if (!b) return []
  return Array.from({ length: b.chapter_count }, (_, i) => ({ text: `${i + 1} 章`, value: i + 1 }))
})

onMounted(async () => {
  store.initShowEn()
  await store.loadBooks()
  // 若路由无参数,恢复上次读经位置
  if (!route.params.book) {
    const saved = localStorage.getItem('bible_last')
    if (saved) {
      const [b, c] = saved.split(':')
      router.replace(`/read/${b}/${c}`)
      return
    }
  }
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

function openBook(b: any) {
  selectedBook.value = b.code
  showBookPicker.value = false
  showChapterPicker.value = true
}

function onChapterConfirm({ selectedValues }: any) {
  const ch = selectedValues[0]
  showChapterPicker.value = false
  router.push(`/read/${selectedBook.value}/${ch}`)
}

function toggleEn() {
  store.setShowEn(!store.showEn)
}

async function addBookmark(verse: number) {
  try {
    await api.addBookmark({
      book_code: store.activeBook,
      book_name_zh: store.bookName(store.activeBook),
      chapter: store.activeChapterNum,
      verse_start: verse,
      verse_end: 0,
      note: ''
    })
    showToast('书签已保存')
  } catch (e: any) {
    showToast(e.message || '保存失败')
  }
}
</script>

<template>
  <div class="page pinch">
    <NavBar
      :title="`${store.currentChapter[0]?.book_name_zh || ''} ${store.activeChapterNum} 章`"
      left-text="书卷"
      :right-text="store.showEn ? '中英' : '中文'"
      @click-left="showBookPicker = true"
      @click-right="toggleEn"
    />

    <div v-if="store.loading" class="center muted py-10">读取中…</div>
    <div v-else>
      <VerseCard
        v-for="v in store.currentChapter"
        :key="v.id"
        :verse="v"
        :book="store.activeBook"
        :chapter="store.activeChapterNum"
        :show-en="store.showEn"
        @bookmark="addBookmark(v.verse)"
      />
    </div>

    <div class="nav row">
      <button class="btn" @click="jump('prev')">上一章</button>
      <button class="btn primary" @click="router.push('/bookmarks')">书签</button>
      <button class="btn" @click="jump('next')">下一章</button>
    </div>

    <!-- 书卷选择 -->
    <Popup v-model:show="showBookPicker" position="bottom" :style="{ height: '60%' }" round>
      <div class="picker-header">
        <span :class="{ active: testament === 'OT' }" @click="testament = 'OT'">旧约</span>
        <span :class="{ active: testament === 'NT' }" @click="testament = 'NT'">新约</span>
      </div>
      <div class="book-grid">
        <div
          v-for="b in (testament === 'OT' ? otBooks : ntBooks)"
          :key="b.code"
          class="book-cell"
          :class="{ active: b.code === store.activeBook }"
          @click="openBook(b)"
        >{{ b.name_zh }}</div>
      </div>
    </Popup>

    <!-- 章节选择 -->
    <Popup v-model:show="showChapterPicker" position="bottom" round>
      <Picker
        :columns="[chapterOptions]"
        @confirm="onChapterConfirm"
        @cancel="showChapterPicker = false"
      />
    </Popup>
  </div>
</template>

<style scoped>
.nav {
  max-width: 720px;
  margin: 16px auto;
  gap: 10px;
  justify-content: center;
  padding: 0 12px;
}
.btn {
  flex: 1;
  max-width: 180px;
  padding: 10px;
  border: 1px solid var(--line);
  background: var(--paper);
  border-radius: 8px;
  color: var(--ink);
  font-size: 14px;
}
.btn.primary {
  background: var(--scroll);
  color: #fff;
  border-color: var(--scroll);
}
.picker-header {
  display: flex;
  gap: 24px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
  font-size: 16px;
}
.picker-header span {
  color: var(--muted);
  cursor: pointer;
}
.picker-header span.active {
  color: var(--grape);
  font-weight: 600;
}
.book-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 16px;
  overflow-y: auto;
  max-height: calc(60vh - 60px);
}
.book-cell {
  padding: 12px 4px;
  text-align: center;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.book-cell.active {
  background: var(--scroll);
  color: #fff;
  border-color: var(--scroll);
}
</style>
