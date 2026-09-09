import { ref, onMounted } from 'vue';
import { Field, Button, Cell, Tag, showToast } from 'vant';
import { supabase, currentProfile } from '@/api/supabase';
const profile = ref(null);
const list = ref([]);
const category = ref('');
const content = ref('');
const submitting = ref(false);
const statusLabel = {
    open: '待处理', in_progress: '处理中', resolved: '已回复', closed: '已关闭'
};
const statusType = {
    open: 'warning', in_progress: 'primary', resolved: 'success', closed: 'default'
};
onMounted(async () => {
    profile.value = await currentProfile();
    if (profile.value)
        await load();
});
async function load() {
    if (!profile.value)
        return;
    const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', profile.value.id)
        .order('updated_at', { ascending: false });
    list.value = data || [];
}
async function submit() {
    if (!profile.value) {
        showToast('请先登录');
        return;
    }
    if (!category.value || !content.value) {
        showToast('请填写分类和内容');
        return;
    }
    submitting.value = true;
    try {
        const { error } = await supabase.from('feedback').insert({
            user_id: profile.value.id,
            category: category.value,
            content: content.value
        });
        if (error) {
            showToast(error.message);
            return;
        }
        category.value = '';
        content.value = '';
        showToast('已提交,感谢反馈');
        await load();
    }
    finally {
        submitting.value = false;
    }
}
async function confirmClose(id) {
    const { error } = await supabase.from('feedback').update({ status: 'closed' }).eq('id', id);
    if (error) {
        showToast(error.message);
        return;
    }
    await load();
}
const cats = ['经文错误', '功能建议', '内容补充', '其他'];
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
if (__VLS_ctx.profile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "cats" },
    });
    for (const [c] of __VLS_getVForSourceType((__VLS_ctx.cats))) {
        const __VLS_0 = {}.Tag;
        /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            ...{ 'onClick': {} },
            key: (c),
            plain: (__VLS_ctx.category !== c),
            type: (__VLS_ctx.category === c ? 'primary' : 'default'),
        }));
        const __VLS_2 = __VLS_1({
            ...{ 'onClick': {} },
            key: (c),
            plain: (__VLS_ctx.category !== c),
            type: (__VLS_ctx.category === c ? 'primary' : 'default'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
        let __VLS_4;
        let __VLS_5;
        let __VLS_6;
        const __VLS_7 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.profile))
                    return;
                __VLS_ctx.category = c;
            }
        };
        __VLS_3.slots.default;
        (c);
        var __VLS_3;
    }
    const __VLS_8 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        modelValue: (__VLS_ctx.content),
        type: "textarea",
        placeholder: "描述你的反馈…",
        rows: "3",
    }));
    const __VLS_10 = __VLS_9({
        modelValue: (__VLS_ctx.content),
        type: "textarea",
        placeholder: "描述你的反馈…",
        rows: "3",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    const __VLS_12 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.submitting),
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        loading: (__VLS_ctx.submitting),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onClick: (__VLS_ctx.submit)
    };
    __VLS_15.slots.default;
    var __VLS_15;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pad center muted" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pad" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "sub" },
});
for (const [f] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_20 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        key: (f.id),
        title: (f.category),
        label: (f.content),
    }));
    const __VLS_22 = __VLS_21({
        key: (f.id),
        title: (f.category),
        label: (f.content),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    {
        const { value: __VLS_thisSlot } = __VLS_23.slots;
        const __VLS_24 = {}.Tag;
        /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            type: __VLS_ctx.statusType[f.status],
            plain: true,
        }));
        const __VLS_26 = __VLS_25({
            type: __VLS_ctx.statusType[f.status],
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        __VLS_27.slots.default;
        (__VLS_ctx.statusLabel[f.status]);
        var __VLS_27;
    }
    if (f.admin_reply) {
        {
            const { extra: __VLS_thisSlot } = __VLS_23.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "reply" },
            });
            (f.admin_reply);
            if (f.status === 'resolved') {
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
                        if (!(f.admin_reply))
                            return;
                        if (!(f.status === 'resolved'))
                            return;
                        __VLS_ctx.confirmClose(f.id);
                    }
                };
                __VLS_31.slots.default;
                var __VLS_31;
            }
        }
    }
    var __VLS_23;
}
if (!__VLS_ctx.list.length && __VLS_ctx.profile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "center muted py-6" },
    });
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['form']} */ ;
/** @type {__VLS_StyleScopedClasses['cats']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['reply']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['py-6']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Field: Field,
            Button: Button,
            Cell: Cell,
            Tag: Tag,
            profile: profile,
            list: list,
            category: category,
            content: content,
            submitting: submitting,
            statusLabel: statusLabel,
            statusType: statusType,
            submit: submit,
            confirmClose: confirmClose,
            cats: cats,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
