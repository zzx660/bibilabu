import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/api/hono';
export const useBibleStore = defineStore('bible', () => {
    const books = ref([]);
    const currentChapter = ref([]);
    const activeBook = ref('GEN');
    const activeChapterNum = ref(1);
    const loading = ref(false);
    const showEn = ref(true);
    function setShowEn(v) {
        showEn.value = v;
        localStorage.setItem('bible_show_en', v ? '1' : '0');
    }
    function initShowEn() {
        showEn.value = localStorage.getItem('bible_show_en') !== '0';
    }
    async function loadBooks() {
        if (books.value.length)
            return;
        const { books: list } = await api.listBooks();
        books.value = list;
    }
    async function loadChapter(book, chapter) {
        loading.value = true;
        activeBook.value = book;
        activeChapterNum.value = chapter;
        try {
            const { chapter: verses } = await api.readChapter(book, chapter);
            currentChapter.value = verses;
            // 存读经位置(后台静默,失败不影响)
            api.saveReading(book, chapter).catch(() => { });
        }
        finally {
            loading.value = false;
        }
    }
    function nextChapter() {
        const b = books.value.find((x) => x.code === activeBook.value);
        if (!b)
            return null;
        if (activeChapterNum.value < b.chapter_count) {
            return [activeBook.value, activeChapterNum.value + 1];
        }
        const idx = books.value.findIndex((x) => x.code === activeBook.value);
        const next = books.value[idx + 1];
        return next ? [next.code, 1] : null;
    }
    function prevChapter() {
        if (activeChapterNum.value > 1) {
            return [activeBook.value, activeChapterNum.value - 1];
        }
        const idx = books.value.findIndex((x) => x.code === activeBook.value);
        const prev = books.value[idx - 1];
        return prev ? [prev.code, prev.chapter_count] : null;
    }
    function bookName(code) {
        return books.value.find((b) => b.code === code)?.name_zh || code;
    }
    return {
        books, currentChapter, activeBook, activeChapterNum, loading, showEn,
        setShowEn, initShowEn, loadBooks, loadChapter, nextChapter, prevChapter, bookName
    };
});
