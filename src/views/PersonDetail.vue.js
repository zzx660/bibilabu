import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NavBar, Cell } from 'vant';
import { api } from '@/api/hono';
const route = useRoute();
const person = ref(null);
onMounted(async () => {
    const id = parseInt(route.params.id, 10);
    if (id) {
        const { person: p } = await api.personDetail(id);
        person.value = p;
    }
});
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
    title: (__VLS_ctx.person?.name_zh || '人物'),
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.person?.name_zh || '人物'),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
if (__VLS_ctx.person) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pad" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "name" },
    });
    (__VLS_ctx.person.name_zh);
    if (__VLS_ctx.person.name_en) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "en muted" },
        });
        (__VLS_ctx.person.name_en);
    }
    if (__VLS_ctx.person.summary) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "summary" },
        });
        (__VLS_ctx.person.summary);
    }
    if (__VLS_ctx.person.biography) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "bio" },
        });
        (__VLS_ctx.person.biography);
    }
    for (const [ref, i] of __VLS_getVForSourceType((__VLS_ctx.person.verse_refs || []))) {
        const __VLS_4 = {}.Cell;
        /** @type {[typeof __VLS_components.Cell, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            key: (i),
            title: (ref),
        }));
        const __VLS_6 = __VLS_5({
            key: (i),
            title: (ref),
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "center muted py-10" },
    });
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['en']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['summary']} */ ;
/** @type {__VLS_StyleScopedClasses['bio']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['py-10']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NavBar: NavBar,
            Cell: Cell,
            person: person,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
