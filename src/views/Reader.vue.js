import { onMounted, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NavBar, Popup, Picker, showToast } from 'vant';
import { useBibleStore } from '@/stores/bible';
import { api } from '@/api/hono';
import VerseCard from '@/components/VerseCard.vue';
const store = useBibleStore();
const route = useRoute();
const router = useRouter();
const showBookPicker = ref(false);
const showChapterPicker = ref(false);
const testament = ref('OT');
const selectedBook = ref('');
const book = route.params.book || 'GEN';
const chapter = parseInt(route.params.chapter || '1', 10);
const otBooks = computed(() => store.books.filter((b) => b.testament === 'OT'));
const ntBooks = computed(() => store.books.filter((b) => b.testament === 'NT'));
const currentBook = computed(() => store.books.find((b) => b.code === store.activeBook));
const chapterOptions = computed(() => {
    const b = currentBook.value;
    if (!b)
        return [];
    return Array.from({ length: b.chapter_count }, (_, i) => ({ text: `${i + 1} 章`, value: i + 1 }));
});
onMounted(async () => {
    store.initShowEn();
    await store.loadBooks();
    // 若路由无参数,恢复上次读经位置
    if (!route.params.book) {
        const saved = localStorage.getItem('bible_last');
        if (saved) {
            const [b, c] = saved.split(':');
            router.replace(`/read/${b}/${c}`);
            return;
        }
    }
    await store.loadChapter(book, chapter);
});
watch(() => [route.params.book, route.params.chapter], async ([b, c]) => {
    if (b && c) {
        await store.loadChapter(b, parseInt(c, 10));
    }
});
function jump(n) {
    const target = n === 'prev' ? store.prevChapter() : store.nextChapter();
    if (!target) {
        showToast(n === 'prev' ? '已是开头' : '已是结尾');
        return;
    }
    router.push(`/read/${target[0]}/${target[1]}`);
}
function openBook(b) {
    selectedBook.value = b.code;
    showBookPicker.value = false;
    showChapterPicker.value = true;
}
function onChapterConfirm({ selectedValues }) {
    const ch = selectedValues[0];
    showChapterPicker.value = false;
    router.push(`/read/${selectedBook.value}/${ch}`);
}
function toggleEn() {
    store.setShowEn(!store.showEn);
}
async function addBookmark(verse) {
    try {
        await api.addBookmark({
            book_code: store.activeBook,
            book_name_zh: store.bookName(store.activeBook),
            chapter: store.activeChapterNum,
            verse_start: verse,
            verse_end: 0,
            note: ''
        });
        showToast('书签已保存');
    }
    catch (e) {
        showToast(e.message || '保存失败');
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['picker-header']} */ ;
/** @type {__VLS_StyleScopedClasses['picker-header']} */ ;
/** @type {__VLS_StyleScopedClasses['book-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page pinch" },
});
const __VLS_0 = {}.NavBar;
/** @type {[typeof __VLS_components.NavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    ...{ 'onClickRight': {} },
    title: (`${__VLS_ctx.store.currentChapter[0]?.book_name_zh || ''} ${__VLS_ctx.store.activeChapterNum} 章`),
    leftText: "书卷",
    rightText: (__VLS_ctx.store.showEn ? '中英' : '中文'),
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    ...{ 'onClickRight': {} },
    title: (`${__VLS_ctx.store.currentChapter[0]?.book_name_zh || ''} ${__VLS_ctx.store.activeChapterNum} 章`),
    leftText: "书卷",
    rightText: (__VLS_ctx.store.showEn ? '中英' : '中文'),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (...[$event]) => {
        __VLS_ctx.showBookPicker = true;
    }
};
const __VLS_8 = {
    onClickRight: (__VLS_ctx.toggleEn)
};
var __VLS_3;
if (__VLS_ctx.store.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "center muted py-10" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    for (const [v] of __VLS_getVForSourceType((__VLS_ctx.store.currentChapter))) {
        /** @type {[typeof VerseCard, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(VerseCard, new VerseCard({
            ...{ 'onBookmark': {} },
            key: (v.id),
            verse: (v),
            book: (__VLS_ctx.store.activeBook),
            chapter: (__VLS_ctx.store.activeChapterNum),
            showEn: (__VLS_ctx.store.showEn),
        }));
        const __VLS_10 = __VLS_9({
            ...{ 'onBookmark': {} },
            key: (v.id),
            verse: (v),
            book: (__VLS_ctx.store.activeBook),
            chapter: (__VLS_ctx.store.activeChapterNum),
            showEn: (__VLS_ctx.store.showEn),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
        let __VLS_12;
        let __VLS_13;
        let __VLS_14;
        const __VLS_15 = {
            onBookmark: (...[$event]) => {
                if (!!(__VLS_ctx.store.loading))
                    return;
                __VLS_ctx.addBookmark(v.verse);
            }
        };
        var __VLS_11;
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "nav row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.jump('prev');
        } },
    ...{ class: "btn" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.router.push('/bookmarks');
        } },
    ...{ class: "btn primary" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.jump('next');
        } },
    ...{ class: "btn" },
});
const __VLS_16 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    show: (__VLS_ctx.showBookPicker),
    position: "bottom",
    ...{ style: ({ height: '60%' }) },
    round: true,
}));
const __VLS_18 = __VLS_17({
    show: (__VLS_ctx.showBookPicker),
    position: "bottom",
    ...{ style: ({ height: '60%' }) },
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "picker-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.testament = 'OT';
        } },
    ...{ class: ({ active: __VLS_ctx.testament === 'OT' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.testament = 'NT';
        } },
    ...{ class: ({ active: __VLS_ctx.testament === 'NT' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "book-grid" },
});
for (const [b] of __VLS_getVForSourceType(((__VLS_ctx.testament === 'OT' ? __VLS_ctx.otBooks : __VLS_ctx.ntBooks)))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openBook(b);
            } },
        key: (b.code),
        ...{ class: "book-cell" },
        ...{ class: ({ active: b.code === __VLS_ctx.store.activeBook }) },
    });
    (b.name_zh);
}
var __VLS_19;
const __VLS_20 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    show: (__VLS_ctx.showChapterPicker),
    position: "bottom",
    round: true,
}));
const __VLS_22 = __VLS_21({
    show: (__VLS_ctx.showChapterPicker),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
const __VLS_24 = {}.Picker;
/** @type {[typeof __VLS_components.Picker, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    columns: ([__VLS_ctx.chapterOptions]),
}));
const __VLS_26 = __VLS_25({
    ...{ 'onConfirm': {} },
    ...{ 'onCancel': {} },
    columns: ([__VLS_ctx.chapterOptions]),
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onConfirm: (__VLS_ctx.onChapterConfirm)
};
const __VLS_32 = {
    onCancel: (...[$event]) => {
        __VLS_ctx.showChapterPicker = false;
    }
};
var __VLS_27;
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['nav']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['picker-header']} */ ;
/** @type {__VLS_StyleScopedClasses['book-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['book-cell']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NavBar: NavBar,
            Popup: Popup,
            Picker: Picker,
            VerseCard: VerseCard,
            store: store,
            router: router,
            showBookPicker: showBookPicker,
            showChapterPicker: showChapterPicker,
            testament: testament,
            otBooks: otBooks,
            ntBooks: ntBooks,
            chapterOptions: chapterOptions,
            jump: jump,
            openBook: openBook,
            onChapterConfirm: onChapterConfirm,
            toggleEn: toggleEn,
            addBookmark: addBookmark,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
