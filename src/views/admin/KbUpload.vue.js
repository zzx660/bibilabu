import { ref, onMounted } from 'vue';
import { Field, Button, Tag, Cell, showToast } from 'vant';
import { supabase } from '@/api/supabase';
const title = ref('');
const content = ref('');
const sourceType = ref('commentary');
const list = ref([]);
const sourceLabel = { commentary: '注释', devotional: '灵修', user_upload: '上传' };
onMounted(load);
async function load() {
    const { data } = await supabase
        .from('knowledge_base')
        .select('id,title,source_type,content,created_at')
        .order('created_at', { ascending: false })
        .limit(30);
    list.value = data || [];
}
async function upload() {
    if (!title.value || !content.value) {
        showToast('请填写标题和内容');
        return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    // 注意:embedding 需后端生成,这里先插入无 embedding 的文本,后续用 kb-loader 补
    const { error } = await supabase.from('knowledge_base').insert({
        source_type: sourceType.value,
        title: title.value,
        content: content.value,
        owner_id: user?.id || null
    });
    if (error) {
        showToast(error.message);
        return;
    }
    showToast('已上传(向量需后端补全)');
    title.value = '';
    content.value = '';
    await load();
}
async function remove(id) {
    const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
    if (!error)
        await load();
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['form']} */ ;
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
    ...{ class: "form pad" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "cats" },
});
for (const [k] of __VLS_getVForSourceType(['commentary', 'devotional', 'user_upload'])) {
    const __VLS_0 = {}.Tag;
    /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        key: (k),
        plain: (__VLS_ctx.sourceType !== k),
        type: (__VLS_ctx.sourceType === k ? 'primary' : 'default'),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        key: (k),
        plain: (__VLS_ctx.sourceType !== k),
        type: (__VLS_ctx.sourceType === k ? 'primary' : 'default'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            __VLS_ctx.sourceType = k;
        }
    };
    __VLS_3.slots.default;
    (__VLS_ctx.sourceLabel[k]);
    var __VLS_3;
}
const __VLS_8 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.title),
    label: "标题",
    placeholder: "如:创世记注释",
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.title),
    label: "标题",
    placeholder: "如:创世记注释",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.content),
    type: "textarea",
    label: "内容",
    rows: "5",
    placeholder: "粘贴注释/灵修文本",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.content),
    type: "textarea",
    label: "内容",
    rows: "5",
    placeholder: "粘贴注释/灵修文本",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.upload)
};
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pad" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sub" },
});
for (const [k] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_24 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        key: (k.id),
        title: (k.title),
        label: (k.content?.slice(0, 60)),
    }));
    const __VLS_26 = __VLS_25({
        key: (k.id),
        title: (k.title),
        label: (k.content?.slice(0, 60)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    __VLS_27.slots.default;
    {
        const { value: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_28 = {}.Tag;
        /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
        // @ts-ignore
        const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
            plain: true,
        }));
        const __VLS_30 = __VLS_29({
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_29));
        __VLS_31.slots.default;
        (__VLS_ctx.sourceLabel[k.source_type] || k.source_type);
        var __VLS_31;
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_27.slots;
        const __VLS_32 = {}.Button;
        /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            ...{ 'onClick': {} },
            plain: true,
            size: "mini",
        }));
        const __VLS_34 = __VLS_33({
            ...{ 'onClick': {} },
            plain: true,
            size: "mini",
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        let __VLS_36;
        let __VLS_37;
        let __VLS_38;
        const __VLS_39 = {
            onClick: (...[$event]) => {
                __VLS_ctx.remove(k.id);
            }
        };
        __VLS_35.slots.default;
        var __VLS_35;
    }
    var __VLS_27;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['cats']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Field: Field,
            Button: Button,
            Tag: Tag,
            Cell: Cell,
            title: title,
            content: content,
            sourceType: sourceType,
            list: list,
            sourceLabel: sourceLabel,
            upload: upload,
            remove: remove,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
