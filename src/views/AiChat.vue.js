import { ref, onMounted, nextTick } from 'vue';
import { Field, Button, Tag, showToast, showConfirmDialog, NavBar } from 'vant';
import { api } from '@/api/hono';
import { useBibleStore } from '@/stores/bible';
const WELCOME = { role: 'ai', text: '愿主赐福给你。我是智能问答助手,会先从知识库(注释书、人物字典)检索相关内容,再结合经文回答。可问经文含义、人物事迹、生活指引等。' };
const input = ref('');
const msgs = ref([WELCOME]);
const busy = ref(false);
const list = ref();
const store = useBibleStore();
const currentVerse = () => {
    if (!store.currentChapter.length)
        return '';
    return `${store.activeBook} ${store.activeChapterNum}:1`;
};
onMounted(async () => {
    try {
        const { items } = await api.aiHistory();
        if (items.length) {
            const historyMsgs = [];
            for (const h of items) {
                historyMsgs.push({ role: 'user', text: h.question });
                historyMsgs.push({ role: 'ai', text: h.answer });
            }
            msgs.value = [WELCOME, ...historyMsgs];
            await scroll();
        }
    }
    catch { }
});
async function clearHistory() {
    try {
        await showConfirmDialog({ title: '清空对话', message: '确认清空所有AI对话记录?' });
    }
    catch {
        return;
    }
    await api.clearAiHistory();
    msgs.value = [WELCOME];
    showToast('已清空');
}
async function send() {
    const q = input.value.trim();
    if (!q || busy.value)
        return;
    msgs.value.push({ role: 'user', text: q });
    input.value = '';
    busy.value = true;
    await scroll();
    try {
        // 智能体 RAG(失败自动降级普通问答)
        const { answer, chunks, fallback } = await api.ragAsk(q);
        msgs.value.push({ role: 'ai', text: answer, chunks, fallback });
    }
    catch (e) {
        // RAG 路由不可用,降级到普通问答
        try {
            const ctx = currentVerse();
            const { answer, refs } = await api.askGlm(q, ctx);
            msgs.value.push({ role: 'ai', text: answer, refs });
        }
        catch {
            msgs.value.push({ role: 'ai', text: '暂时无法回答,稍后再试。' });
        }
    }
    finally {
        busy.value = false;
        await scroll();
    }
}
async function explainCurrent() {
    const ref = currentVerse();
    if (!ref) {
        showToast('请先在读经页打开一章');
        return;
    }
    busy.value = true;
    msgs.value.push({ role: 'user', text: `解读 ${ref}` });
    await scroll();
    try {
        const { answer } = await api.explainVerse(ref);
        msgs.value.push({ role: 'ai', text: answer });
    }
    finally {
        busy.value = false;
        await scroll();
    }
}
async function scroll() {
    await nextTick();
    const el = list.value;
    if (el)
        el.scrollTop = el.scrollHeight;
}
const sourceLabel = {
    commentary: '注释',
    devotional: '灵修',
    dictionary: '字典',
    user_upload: '上传'
};
const suggestions = ['什么是爱？', '如何祷告？', '信心是什么？', '彼得是谁？'];
function pick(s) {
    input.value = s;
    send();
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['user']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page chat-page" },
});
const __VLS_0 = {}.NavBar;
/** @type {[typeof __VLS_components.NavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickRight': {} },
    title: "智能问答",
    rightText: "清空",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickRight': {} },
    title: "智能问答",
    rightText: "清空",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickRight: (__VLS_ctx.clearHistory)
};
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ref: "list",
    ...{ class: "msgs" },
});
/** @type {typeof __VLS_ctx.list} */ ;
for (const [m, i] of __VLS_getVForSourceType((__VLS_ctx.msgs))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (i),
        ...{ class: (['msg', m.role]) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bubble" },
    });
    (m.text);
    if (m.fallback) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "note muted" },
        });
    }
    if (m.refs && (m.refs.verses.length || m.refs.persons.length)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "refs" },
        });
        for (const [v] of __VLS_getVForSourceType((m.refs.verses))) {
            const __VLS_8 = {}.Tag;
            /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
            // @ts-ignore
            const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
                key: (v),
                plain: true,
                size: "medium",
            }));
            const __VLS_10 = __VLS_9({
                key: (v),
                plain: true,
                size: "medium",
            }, ...__VLS_functionalComponentArgsRest(__VLS_9));
            __VLS_11.slots.default;
            (v);
            var __VLS_11;
        }
        for (const [p] of __VLS_getVForSourceType((m.refs.persons))) {
            const __VLS_12 = {}.Tag;
            /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
            // @ts-ignore
            const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
                key: (p),
                type: "primary",
                plain: true,
                size: "medium",
            }));
            const __VLS_14 = __VLS_13({
                key: (p),
                type: "primary",
                plain: true,
                size: "medium",
            }, ...__VLS_functionalComponentArgsRest(__VLS_13));
            __VLS_15.slots.default;
            (p);
            var __VLS_15;
        }
    }
    if (m.chunks && m.chunks.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chunks" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chunks-title muted" },
        });
        for (const [c, j] of __VLS_getVForSourceType((m.chunks))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (j),
                ...{ class: "chunk" },
            });
            const __VLS_16 = {}.Tag;
            /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
            // @ts-ignore
            const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
                plain: true,
                size: "medium",
            }));
            const __VLS_18 = __VLS_17({
                plain: true,
                size: "medium",
            }, ...__VLS_functionalComponentArgsRest(__VLS_17));
            __VLS_19.slots.default;
            (__VLS_ctx.sourceLabel[c.source] || c.source);
            var __VLS_19;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "chunk-title" },
            });
            (c.title);
        }
    }
}
if (__VLS_ctx.busy) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "msg ai" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bubble" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "suggestions" },
});
for (const [s] of __VLS_getVForSourceType((__VLS_ctx.suggestions))) {
    const __VLS_20 = {}.Tag;
    /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onClick': {} },
        key: (s),
        plain: true,
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onClick': {} },
        key: (s),
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onClick: (...[$event]) => {
            __VLS_ctx.pick(s);
        }
    };
    __VLS_23.slots.default;
    (s);
    var __VLS_23;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-bar" },
});
if (__VLS_ctx.store.currentChapter.length) {
    const __VLS_28 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        plain: true,
        size: "small",
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        plain: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (__VLS_ctx.explainCurrent)
    };
    __VLS_31.slots.default;
    var __VLS_31;
}
const __VLS_36 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.input),
    placeholder: "提问…",
}));
const __VLS_38 = __VLS_37({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.input),
    placeholder: "提问…",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
let __VLS_40;
let __VLS_41;
let __VLS_42;
const __VLS_43 = {
    onKeyup: (__VLS_ctx.send)
};
var __VLS_39;
const __VLS_44 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    loading: (__VLS_ctx.busy),
}));
const __VLS_46 = __VLS_45({
    ...{ 'onClick': {} },
    type: "primary",
    size: "small",
    loading: (__VLS_ctx.busy),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
let __VLS_48;
let __VLS_49;
let __VLS_50;
const __VLS_51 = {
    onClick: (__VLS_ctx.send)
};
__VLS_47.slots.default;
var __VLS_47;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-page']} */ ;
/** @type {__VLS_StyleScopedClasses['msgs']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['note']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['refs']} */ ;
/** @type {__VLS_StyleScopedClasses['chunks']} */ ;
/** @type {__VLS_StyleScopedClasses['chunks-title']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['chunk']} */ ;
/** @type {__VLS_StyleScopedClasses['chunk-title']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['ai']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestions']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Field: Field,
            Button: Button,
            Tag: Tag,
            NavBar: NavBar,
            input: input,
            msgs: msgs,
            busy: busy,
            list: list,
            store: store,
            clearHistory: clearHistory,
            send: send,
            explainCurrent: explainCurrent,
            sourceLabel: sourceLabel,
            suggestions: suggestions,
            pick: pick,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
