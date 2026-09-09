import { ref, onMounted } from 'vue';
import { Cell, Button, Field, Tag } from 'vant';
import { supabase } from '@/api/supabase';
const list = ref([]);
const replyMap = ref({});
const statusLabel = { open: '待处理', in_progress: '处理中', resolved: '已回复', closed: '已关闭' };
onMounted(load);
async function load() {
    const { data } = await supabase
        .from('feedback')
        .select('*')
        .order('updated_at', { ascending: false });
    list.value = data || [];
}
async function take(id) {
    await supabase.from('feedback').update({ status: 'in_progress' }).eq('id', id);
    await load();
}
async function reply(id) {
    const text = replyMap.value[id]?.trim();
    if (!text)
        return;
    const { error } = await supabase.from('feedback').update({
        admin_reply: text, status: 'resolved'
    }).eq('id', id);
    if (error)
        return;
    replyMap.value[id] = '';
    await load();
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pad" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "title" },
});
for (const [f] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_0 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        key: (f.id),
        title: (f.category),
        label: (f.content),
    }));
    const __VLS_2 = __VLS_1({
        key: (f.id),
        title: (f.category),
        label: (f.content),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    {
        const { value: __VLS_thisSlot } = __VLS_3.slots;
        const __VLS_4 = {}.Tag;
        /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            plain: true,
        }));
        const __VLS_6 = __VLS_5({
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        __VLS_7.slots.default;
        (__VLS_ctx.statusLabel[f.status]);
        var __VLS_7;
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_3.slots;
        if (f.status === 'open') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            const __VLS_8 = {}.Button;
            /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
                ...{ 'onClick': {} },
                plain: true,
                size: "mini",
            }));
            const __VLS_10 = __VLS_9({
                ...{ 'onClick': {} },
                plain: true,
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            let __VLS_12;
            let __VLS_13;
            let __VLS_14;
            const __VLS_15 = {
                onClick: (...[$event]) => {
                    if (!(f.status === 'open'))
                        return;
                    __VLS_ctx.take(f.id);
                }
            };
            __VLS_11.slots.default;
            var __VLS_11;
        }
        else if (f.status !== 'closed') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "reply-box" },
            });
            const __VLS_16 = {}.Field;
            /** @type {[typeof __VLS_components.Field, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                modelValue: (__VLS_ctx.replyMap[f.id]),
                placeholder: "回复内容…",
                rows: "2",
            }));
            const __VLS_18 = __VLS_17({
                modelValue: (__VLS_ctx.replyMap[f.id]),
                placeholder: "回复内容…",
                rows: "2",
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            const __VLS_20 = {}.Button;
            /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                ...{ 'onClick': {} },
                type: "primary",
                size: "mini",
            }));
            const __VLS_22 = __VLS_21({
                ...{ 'onClick': {} },
                type: "primary",
                size: "mini",
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
            let __VLS_24;
            let __VLS_25;
            let __VLS_26;
            const __VLS_27 = {
                onClick: (...[$event]) => {
                    if (!!(f.status === 'open'))
                        return;
                    if (!(f.status !== 'closed'))
                        return;
                    __VLS_ctx.reply(f.id);
                }
            };
            __VLS_23.slots.default;
            var __VLS_23;
        }
        if (f.admin_reply) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "reply" },
            });
            (f.admin_reply);
        }
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['reply-box']} */ ;
/** @type {__VLS_StyleScopedClasses['reply']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Cell: Cell,
            Button: Button,
            Field: Field,
            Tag: Tag,
            list: list,
            replyMap: replyMap,
            statusLabel: statusLabel,
            take: take,
            reply: reply,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
