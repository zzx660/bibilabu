import { ref } from 'vue';
import { Search as VSearch, Cell, Tabs, Tab } from 'vant';
import { useRouter } from 'vue-router';
import { api } from '@/api/hono';
const tab = ref('verse');
const keyword = ref('');
const results = ref([]);
const searching = ref(false);
const router = useRouter();
async function doSearch() {
    const q = keyword.value.trim();
    if (!q)
        return;
    searching.value = true;
    try {
        if (tab.value === 'verse') {
            const { items } = await api.searchVerses(q);
            results.value = items;
        }
        else {
            const { items } = await api.searchPersons(q);
            results.value = items;
        }
    }
    finally {
        searching.value = false;
    }
}
function openVerse(v) {
    router.push(`/read/${v.book_code}/${v.chapter}`);
}
function openPerson(p) {
    router.push(`/person/${p.id}`);
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
const __VLS_0 = {}.Tabs;
/** @type {[typeof __VLS_components.Tabs, typeof __VLS_components.Tabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    active: (__VLS_ctx.tab),
    sticky: true,
}));
const __VLS_2 = __VLS_1({
    active: (__VLS_ctx.tab),
    sticky: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.Tab;
/** @type {[typeof __VLS_components.Tab, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    title: "经文",
    name: "verse",
}));
const __VLS_6 = __VLS_5({
    title: "经文",
    name: "verse",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
const __VLS_8 = {}.Tab;
/** @type {[typeof __VLS_components.Tab, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    title: "人物",
    name: "person",
}));
const __VLS_10 = __VLS_9({
    title: "人物",
    name: "person",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
var __VLS_3;
const __VLS_12 = {}.VSearch;
/** @type {[typeof __VLS_components.VSearch, typeof __VLS_components.VSearch, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: (__VLS_ctx.tab === 'verse' ? '搜索经文关键词' : '搜索人物名'),
    showAction: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: (__VLS_ctx.tab === 'verse' ? '搜索经文关键词' : '搜索人物名'),
    showAction: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onSearch: (__VLS_ctx.doSearch)
};
__VLS_15.slots.default;
{
    const { action: __VLS_thisSlot } = __VLS_15.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (__VLS_ctx.doSearch) },
        ...{ class: "link" },
    });
}
var __VLS_15;
if (__VLS_ctx.searching) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "center muted py-6" },
    });
}
else if (__VLS_ctx.results.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hint muted" },
    });
    (__VLS_ctx.results.length);
}
if (__VLS_ctx.tab === 'verse') {
    for (const [r] of __VLS_getVForSourceType((__VLS_ctx.results))) {
        const __VLS_20 = {}.Cell;
        /** @type {[typeof __VLS_components.Cell, ]} */ ;
        // @ts-ignore
        const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
            ...{ 'onClick': {} },
            key: (r.id),
            title: (r.text_zh),
            label: (`${r.book_name_zh} ${r.chapter}:${r.verse}`),
            isLink: true,
        }));
        const __VLS_22 = __VLS_21({
            ...{ 'onClick': {} },
            key: (r.id),
            title: (r.text_zh),
            label: (`${r.book_name_zh} ${r.chapter}:${r.verse}`),
            isLink: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        let __VLS_24;
        let __VLS_25;
        let __VLS_26;
        const __VLS_27 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.tab === 'verse'))
                    return;
                __VLS_ctx.openVerse(r);
            }
        };
        var __VLS_23;
    }
}
else {
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.results))) {
        const __VLS_28 = {}.Cell;
        /** @type {[typeof __VLS_components.Cell, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            ...{ 'onClick': {} },
            key: (p.id),
            title: (p.name_zh),
            label: (p.summary),
            isLink: true,
        }));
        const __VLS_30 = __VLS_29({
            ...{ 'onClick': {} },
            key: (p.id),
            title: (p.name_zh),
            label: (p.summary),
            isLink: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        let __VLS_32;
        let __VLS_33;
        let __VLS_34;
        const __VLS_35 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.tab === 'verse'))
                    return;
                __VLS_ctx.openPerson(p);
            }
        };
        var __VLS_31;
    }
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            VSearch: VSearch,
            Cell: Cell,
            Tabs: Tabs,
            Tab: Tab,
            tab: tab,
            keyword: keyword,
            results: results,
            searching: searching,
            doSearch: doSearch,
            openVerse: openVerse,
            openPerson: openPerson,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
