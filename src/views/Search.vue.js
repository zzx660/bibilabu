import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Search as VanSearch, Pagination } from 'vant';
import { api } from '@/api/hono';
const router = useRouter();
const tab = ref('verse');
const kw = ref('');
const verses = ref([]);
const persons = ref([]);
const page = ref(1);
const total = ref(0);
const pageSize = 20;
const loading = ref(false);
async function search(p = 1) {
    const q = kw.value.trim();
    if (!q)
        return;
    page.value = p;
    loading.value = true;
    try {
        if (tab.value === 'verse') {
            const { items, total: t } = await api.searchVerses(q, p, pageSize);
            verses.value = items;
            total.value = t;
        }
        else {
            const { items, total: t } = await api.searchPersons(q, p, pageSize);
            persons.value = items;
            total.value = t;
        }
    }
    finally {
        loading.value = false;
    }
}
function highlight(text) {
    const parts = kw.value.trim().split(/\s+/);
    if (!parts.length || !text)
        return text;
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${parts.map(esc).join('|')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
}
function onSearch() { search(1); }
function gotoVerse(v) {
    router.push(`/read/${v.book_code}/${v.chapter}`);
}
function gotoPerson(p) {
    router.push(`/person/${p.id}`);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.NavBar;
/** @type {[typeof __VLS_components.NavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    title: "搜索",
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: "搜索",
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (...[$event]) => {
        __VLS_ctx.router.back();
    }
};
var __VLS_3;
const __VLS_8 = {}.VanSearch;
/** @type {[typeof __VLS_components.VanSearch, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.kw),
    placeholder: "输入关键词(多词空格分隔)",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onSearch': {} },
    modelValue: (__VLS_ctx.kw),
    placeholder: "输入关键词(多词空格分隔)",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onSearch: (__VLS_ctx.onSearch)
};
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tabs" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'verse';
            __VLS_ctx.search(1);
        } },
    ...{ class: ({ active: __VLS_ctx.tab === 'verse' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.tab = 'person';
            __VLS_ctx.search(1);
        } },
    ...{ class: ({ active: __VLS_ctx.tab === 'person' }) },
});
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "center muted py-10" },
    });
}
else if (__VLS_ctx.tab === 'verse') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list" },
    });
    for (const [v] of __VLS_getVForSourceType((__VLS_ctx.verses))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.tab === 'verse'))
                        return;
                    __VLS_ctx.gotoVerse(v);
                } },
            key: (v.id),
            ...{ class: "item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "ref" },
        });
        (v.book_name_zh);
        (v.chapter);
        (v.verse);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "txt" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.highlight(v.text_zh)) }, null, null);
    }
    if (!__VLS_ctx.verses.length && __VLS_ctx.kw) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "center muted" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "list" },
    });
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.persons))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!!(__VLS_ctx.tab === 'verse'))
                        return;
                    __VLS_ctx.gotoPerson(p);
                } },
            key: (p.id),
            ...{ class: "item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "ref" },
        });
        (p.name_zh);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted" },
        });
        (p.name_en);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "txt" },
        });
        (p.summary?.slice(0, 120));
    }
    if (!__VLS_ctx.persons.length && __VLS_ctx.kw) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "center muted" },
        });
    }
}
if (__VLS_ctx.total > __VLS_ctx.pageSize) {
    const __VLS_16 = {}.Pagination;
    /** @type {[typeof __VLS_components.Pagination, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.page),
        totalItems: (__VLS_ctx.total),
        itemsPerPage: (__VLS_ctx.pageSize),
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onUpdate:modelValue': {} },
        modelValue: (__VLS_ctx.page),
        totalItems: (__VLS_ctx.total),
        itemsPerPage: (__VLS_ctx.pageSize),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        'onUpdate:modelValue': (__VLS_ctx.search)
    };
    var __VLS_19;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
/** @type {__VLS_StyleScopedClasses['list']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['ref']} */ ;
/** @type {__VLS_StyleScopedClasses['txt']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['list']} */ ;
/** @type {__VLS_StyleScopedClasses['item']} */ ;
/** @type {__VLS_StyleScopedClasses['ref']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['txt']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NavBar: NavBar,
            VanSearch: VanSearch,
            Pagination: Pagination,
            router: router,
            tab: tab,
            kw: kw,
            verses: verses,
            persons: persons,
            page: page,
            total: total,
            pageSize: pageSize,
            loading: loading,
            search: search,
            highlight: highlight,
            onSearch: onSearch,
            gotoVerse: gotoVerse,
            gotoPerson: gotoPerson,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
