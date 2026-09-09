import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NavBar, showToast } from 'vant';
import { useBibleStore } from '@/stores/bible';
import VerseCard from '@/components/VerseCard.vue';
const store = useBibleStore();
const route = useRoute();
const router = useRouter();
const showBookPicker = ref(false);
const book = route.params.book || 'GEN';
const chapter = parseInt(route.params.chapter || '1', 10);
onMounted(async () => {
    await store.loadBooks();
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
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
    rightText: "下一章",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    ...{ 'onClickRight': {} },
    title: (`${__VLS_ctx.store.currentChapter[0]?.book_name_zh || ''} ${__VLS_ctx.store.activeChapterNum} 章`),
    leftText: "书卷",
    rightText: "下一章",
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
    onClickRight: (...[$event]) => {
        __VLS_ctx.jump('next');
    }
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
            key: (v.id),
            verse: (v),
            book: (__VLS_ctx.store.activeBook),
            chapter: (__VLS_ctx.store.activeChapterNum),
        }));
        const __VLS_10 = __VLS_9({
            key: (v.id),
            verse: (v),
            book: (__VLS_ctx.store.activeBook),
            chapter: (__VLS_ctx.store.activeChapterNum),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
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
            __VLS_ctx.jump('next');
        } },
    ...{ class: "btn" },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['nav']} */ ;
/** @type {__VLS_StyleScopedClasses['row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NavBar: NavBar,
            VerseCard: VerseCard,
            store: store,
            showBookPicker: showBookPicker,
            jump: jump,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
