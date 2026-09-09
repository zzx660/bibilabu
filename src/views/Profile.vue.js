import { ref, onMounted } from 'vue';
import { Cell, Button, showConfirmDialog, showToast } from 'vant';
import { useRouter } from 'vue-router';
import { supabase, currentProfile } from '@/api/supabase';
import { wipeKeys, clearRoomKeyCache } from '@/api/crypto';
import { api } from '@/api/hono';
import PrivacyNotice from '@/components/PrivacyNotice.vue';
const router = useRouter();
const profile = ref(null);
onMounted(async () => {
    profile.value = await currentProfile();
});
async function signOut() {
    await supabase.auth.signOut();
    clearRoomKeyCache();
    profile.value = null;
}
async function deleteAccount() {
    try {
        await showConfirmDialog({
            title: '删除账号',
            message: '此操作不可撤销,你的所有数据(含聊天密钥)将被清除,其他人的历史消息不受影响。'
        });
    }
    catch {
        return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session)
        return;
    try {
        await api.deleteAccount(session.access_token);
        await wipeKeys();
        clearRoomKeyCache();
        await supabase.auth.signOut();
        profile.value = null;
        showToast('账号已删除');
        router.replace('/login');
    }
    catch (e) {
        showToast(e.message || '删除失败');
    }
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
if (__VLS_ctx.profile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "name" },
    });
    (__VLS_ctx.profile.display_name || __VLS_ctx.profile.email);
    if (__VLS_ctx.profile.role === 'admin') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "muted" },
        });
    }
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "muted" },
    });
    const __VLS_0 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.profile))
                return;
            __VLS_ctx.router.push('/login');
        }
    };
    __VLS_3.slots.default;
    var __VLS_3;
}
const __VLS_8 = {}.Cell;
/** @type {[typeof __VLS_components.Cell, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    title: "我的反馈",
    isLink: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    title: "我的反馈",
    isLink: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/feedback');
    }
};
var __VLS_11;
if (__VLS_ctx.profile?.role === 'admin') {
    const __VLS_16 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onClick': {} },
        title: "管理后台",
        isLink: true,
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onClick': {} },
        title: "管理后台",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.profile?.role === 'admin'))
                return;
            __VLS_ctx.router.push('/admin');
        }
    };
    var __VLS_19;
}
const __VLS_24 = {}.Cell;
/** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    title: "隐私说明",
}));
const __VLS_26 = __VLS_25({
    title: "隐私说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { value: __VLS_thisSlot } = __VLS_27.slots;
    /** @type {[typeof PrivacyNotice, ]} */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(PrivacyNotice, new PrivacyNotice({}));
    const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
}
var __VLS_27;
if (__VLS_ctx.profile) {
    const __VLS_31 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
        ...{ 'onClick': {} },
        title: "退出登录",
        isLink: true,
    }));
    const __VLS_33 = __VLS_32({
        ...{ 'onClick': {} },
        title: "退出登录",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    let __VLS_35;
    let __VLS_36;
    let __VLS_37;
    const __VLS_38 = {
        onClick: (__VLS_ctx.signOut)
    };
    var __VLS_34;
}
if (__VLS_ctx.profile) {
    const __VLS_39 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        ...{ 'onClick': {} },
        title: "删除账号",
        isLink: true,
    }));
    const __VLS_41 = __VLS_40({
        ...{ 'onClick': {} },
        title: "删除账号",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    let __VLS_43;
    let __VLS_44;
    let __VLS_45;
    const __VLS_46 = {
        onClick: (__VLS_ctx.deleteAccount)
    };
    var __VLS_42;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Cell: Cell,
            Button: Button,
            PrivacyNotice: PrivacyNotice,
            router: router,
            profile: profile,
            signOut: signOut,
            deleteAccount: deleteAccount,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
