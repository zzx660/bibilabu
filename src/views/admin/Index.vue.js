import { Cell } from 'vant';
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { currentProfile } from '@/api/supabase';
const router = useRouter();
const allowed = ref(null);
onMounted(async () => {
    const p = await currentProfile();
    allowed.value = p?.role === 'admin';
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pad" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "title" },
});
if (__VLS_ctx.allowed) {
    const __VLS_0 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        title: "圣经文本",
        isLink: true,
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        title: "圣经文本",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.allowed))
                return;
            __VLS_ctx.router.push('/admin/bible');
        }
    };
    var __VLS_3;
    const __VLS_8 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        title: "人物字典",
        isLink: true,
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        title: "人物字典",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.allowed))
                return;
            __VLS_ctx.router.push('/admin/persons');
        }
    };
    var __VLS_11;
    const __VLS_16 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        title: "知识库上传",
        isLink: true,
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        title: "知识库上传",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.allowed))
                return;
            __VLS_ctx.router.push('/admin/kb');
        }
    };
    var __VLS_19;
    const __VLS_24 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        title: "用户管理",
        isLink: true,
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        title: "用户管理",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.allowed))
                return;
            __VLS_ctx.router.push('/admin/users');
        }
    };
    var __VLS_27;
    const __VLS_32 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        title: "反馈处理",
        isLink: true,
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        title: "反馈处理",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.allowed))
                return;
            __VLS_ctx.router.push('/admin/feedback');
        }
    };
    var __VLS_35;
}
else if (__VLS_ctx.allowed === false) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pad center muted" },
    });
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['center']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Cell: Cell,
            router: router,
            allowed: allowed,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
