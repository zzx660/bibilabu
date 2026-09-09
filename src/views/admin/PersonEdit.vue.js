import { ref, onMounted } from 'vue';
import { Field, Button, Cell, showToast } from 'vant';
import { supabase } from '@/api/supabase';
const keyword = ref('');
const list = ref([]);
const editing = ref(null);
const draft = ref({ name_zh: '', summary: '', biography: '' });
onMounted(async () => {
    await search();
});
async function search() {
    let q = supabase.from('persons').select('id,name_zh,name_en,summary');
    if (keyword.value)
        q = q.ilike('name_zh', `%${keyword.value}%`);
    const { data } = await q.limit(20);
    list.value = data || [];
}
function startEdit(p) {
    editing.value = p;
    draft.value = { name_zh: p.name_zh, summary: p.summary || '', biography: p.biography || '' };
}
async function save() {
    if (!editing.value)
        return;
    const { error } = await supabase.from('persons').update({
        name_zh: draft.value.name_zh,
        summary: draft.value.summary,
        biography: draft.value.biography
    }).eq('id', editing.value.id);
    if (error) {
        showToast(error.message);
        return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user)
        await supabase.from('admin_audit_log').insert({ admin_id: user.id, action: 'edit_person', target: `person:${editing.value.id}` });
    showToast('已保存');
    editing.value = null;
    await search();
}
function cancel() { editing.value = null; }
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['edit-form']} */ ;
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
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
const __VLS_0 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索人物名",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.keyword),
    placeholder: "搜索人物名",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onKeyup: (__VLS_ctx.search)
};
var __VLS_3;
const __VLS_8 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.search)
};
__VLS_11.slots.default;
var __VLS_11;
if (__VLS_ctx.editing) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "edit-form pad" },
    });
    const __VLS_16 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        modelValue: (__VLS_ctx.draft.name_zh),
        label: "中文名",
    }));
    const __VLS_18 = __VLS_17({
        modelValue: (__VLS_ctx.draft.name_zh),
        label: "中文名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    const __VLS_20 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.draft.summary),
        type: "textarea",
        label: "简介",
        rows: "2",
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.draft.summary),
        type: "textarea",
        label: "简介",
        rows: "2",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        modelValue: (__VLS_ctx.draft.biography),
        type: "textarea",
        label: "生平",
        rows: "5",
    }));
    const __VLS_26 = __VLS_25({
        modelValue: (__VLS_ctx.draft.biography),
        type: "textarea",
        label: "生平",
        rows: "5",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "btns" },
    });
    const __VLS_28 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        plain: true,
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (__VLS_ctx.cancel)
    };
    __VLS_31.slots.default;
    var __VLS_31;
    const __VLS_36 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_38 = __VLS_37({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    let __VLS_40;
    let __VLS_41;
    let __VLS_42;
    const __VLS_43 = {
        onClick: (__VLS_ctx.save)
    };
    __VLS_39.slots.default;
    var __VLS_39;
}
else {
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.list))) {
        const __VLS_44 = {}.Cell;
        /** @type {[typeof __VLS_components.Cell, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            ...{ 'onClick': {} },
            key: (p.id),
            title: (p.name_zh),
            label: (p.summary),
            isLink: true,
        }));
        const __VLS_46 = __VLS_45({
            ...{ 'onClick': {} },
            key: (p.id),
            title: (p.name_zh),
            label: (p.summary),
            isLink: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        let __VLS_48;
        let __VLS_49;
        let __VLS_50;
        const __VLS_51 = {
            onClick: (...[$event]) => {
                if (!!(__VLS_ctx.editing))
                    return;
                __VLS_ctx.startEdit(p);
            }
        };
        var __VLS_47;
    }
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-form']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Field: Field,
            Button: Button,
            Cell: Cell,
            keyword: keyword,
            list: list,
            editing: editing,
            draft: draft,
            search: search,
            startEdit: startEdit,
            save: save,
            cancel: cancel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
