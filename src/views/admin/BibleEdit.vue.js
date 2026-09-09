import { ref, onMounted } from 'vue';
import { Field, Button, Cell, showToast } from 'vant';
import { supabase } from '@/api/supabase';
const book = ref('');
const chapter = ref(null);
const verses = ref([]);
const edits = ref({});
onMounted(async () => {
    // 默认加载创世记第 1 章
    book.value = 'GEN';
    chapter.value = 1;
    await load();
});
async function load() {
    if (!book.value || !chapter.value)
        return;
    const { data } = await supabase
        .from('bible_verses')
        .select('id,book_name_zh,chapter,verse,text_zh')
        .eq('book_code', book.value)
        .eq('chapter', chapter.value)
        .order('verse', { ascending: true });
    verses.value = data || [];
    edits.value = {};
}
async function save(id) {
    const text = edits.value[id];
    if (!text)
        return;
    const { error } = await supabase.from('bible_verses').update({ text_zh: text }).eq('id', id);
    if (error) {
        showToast(error.message);
        return;
    }
    const v = verses.value.find((x) => x.id === id);
    if (v)
        v.text_zh = text;
    delete edits.value[id];
    await logAudit(`verse:${id}`, 'edit_verse');
    showToast('已保存');
}
async function logAudit(target, action) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return;
    await supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target });
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page pinch" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pad" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "search-bar" },
});
const __VLS_0 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.book),
    label: "书卷代码",
    placeholder: "如 GEN",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.book),
    label: "书卷代码",
    placeholder: "如 GEN",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.chapter === null ? '' : String(__VLS_ctx.chapter)),
    type: "digit",
    label: "章",
    placeholder: "如 1",
}));
const __VLS_6 = __VLS_5({
    ...{ 'onUpdate:modelValue': {} },
    modelValue: (__VLS_ctx.chapter === null ? '' : String(__VLS_ctx.chapter)),
    type: "digit",
    label: "章",
    placeholder: "如 1",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    'onUpdate:modelValue': (v => __VLS_ctx.chapter = v ? parseInt(v, 10) : null)
};
var __VLS_7;
const __VLS_12 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.load)
};
__VLS_15.slots.default;
var __VLS_15;
for (const [v] of __VLS_getVForSourceType((__VLS_ctx.verses))) {
    const __VLS_20 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        key: (v.id),
        title: (`${v.verse}节`),
        label: (v.text_zh),
    }));
    const __VLS_22 = __VLS_21({
        key: (v.id),
        title: (`${v.verse}节`),
        label: (v.text_zh),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { extra: __VLS_thisSlot } = __VLS_23.slots;
        const __VLS_24 = {}.Field;
        /** @type {[typeof __VLS_components.Field, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            modelValue: (__VLS_ctx.edits[v.id]),
            placeholder: (v.text_zh),
            rows: "2",
        }));
        const __VLS_26 = __VLS_25({
            modelValue: (__VLS_ctx.edits[v.id]),
            placeholder: (v.text_zh),
            rows: "2",
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        if (__VLS_ctx.edits[v.id]) {
            const __VLS_28 = {}.Button;
            /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                ...{ 'onClick': {} },
                plain: true,
                size: "mini",
            }));
            const __VLS_30 = __VLS_29({
                ...{ 'onClick': {} },
                plain: true,
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            let __VLS_32;
            let __VLS_33;
            let __VLS_34;
            const __VLS_35 = {
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.edits[v.id]))
                        return;
                    __VLS_ctx.save(v.id);
                }
            };
            __VLS_31.slots.default;
            var __VLS_31;
        }
    }
    var __VLS_23;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['search-bar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Field: Field,
            Button: Button,
            Cell: Cell,
            book: book,
            chapter: chapter,
            verses: verses,
            edits: edits,
            load: load,
            save: save,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
