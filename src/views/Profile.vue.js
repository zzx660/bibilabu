import { ref, onMounted } from 'vue';
import { Cell, Button, showConfirmDialog, showToast, Popup, Field } from 'vant';
import { useRouter } from 'vue-router';
import { supabase, currentProfile } from '@/api/supabase';
import { wipeKeys, clearRoomKeyCache } from '@/api/crypto';
import { api } from '@/api/hono';
import { useAuthStore } from '@/stores/auth';
import PrivacyNotice from '@/components/PrivacyNotice.vue';
const router = useRouter();
const authStore = useAuthStore();
const profile = ref(null);
const showEdit = ref(false);
const nickname = ref('');
const title = ref('');
const avatarColor = ref('#7c3aed');
const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2'];
onMounted(async () => {
    profile.value = await currentProfile();
});
function openEdit() {
    nickname.value = profile.value?.nickname || profile.value?.display_name || '';
    title.value = profile.value?.title || '';
    avatarColor.value = profile.value?.avatar_color || '#7c3aed';
    showEdit.value = true;
}
async function saveProfile() {
    try {
        const { profile: p } = await api.updateProfile({
            nickname: nickname.value,
            title: title.value,
            avatar_color: avatarColor.value
        });
        profile.value = { ...profile.value, ...p };
        await authStore.loadProfile();
        showToast('已保存');
        showEdit.value = false;
    }
    catch (e) {
        showToast(e.message || '保存失败');
    }
}
async function signOut() {
    await supabase.auth.signOut();
    clearRoomKeyCache();
    profile.value = null;
    router.replace('/login');
}
async function deleteAccount() {
    try {
        await showConfirmDialog({
            title: '删除账号',
            message: '此操作不可撤销,你的所有数据(含聊天密钥)将被清除。'
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
/** @type {__VLS_StyleScopedClasses['sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['color-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
if (__VLS_ctx.profile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "avatar" },
        ...{ style: ({ background: __VLS_ctx.profile.avatar_color || '#7c3aed' }) },
    });
    ((__VLS_ctx.profile.nickname || __VLS_ctx.profile.username || '?').slice(0, 1));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    (__VLS_ctx.profile.nickname || __VLS_ctx.profile.username);
    if (__VLS_ctx.profile.title) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "title" },
        });
        (__VLS_ctx.profile.title);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "code" },
    });
    (__VLS_ctx.profile.friend_code);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.openEdit) },
        ...{ class: "edit-btn" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero" },
    });
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
    title: "读经进度",
    value: (__VLS_ctx.profile?.last_book ? `${__VLS_ctx.profile.last_book} ${__VLS_ctx.profile.last_chapter}章` : '暂无'),
}));
const __VLS_10 = __VLS_9({
    title: "读经进度",
    value: (__VLS_ctx.profile?.last_book ? `${__VLS_ctx.profile.last_book} ${__VLS_ctx.profile.last_chapter}章` : '暂无'),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const __VLS_12 = {}.Cell;
/** @type {[typeof __VLS_components.Cell, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    title: "我的书签",
    isLink: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    title: "我的书签",
    isLink: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/bookmarks');
    }
};
var __VLS_15;
const __VLS_20 = {}.Cell;
/** @type {[typeof __VLS_components.Cell, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    title: "我的反馈",
    isLink: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    title: "我的反馈",
    isLink: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/feedback');
    }
};
var __VLS_23;
if (__VLS_ctx.profile?.role === 'admin') {
    const __VLS_28 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
        title: "管理后台",
        isLink: true,
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
        title: "管理后台",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.profile?.role === 'admin'))
                return;
            __VLS_ctx.router.push('/admin');
        }
    };
    var __VLS_31;
}
const __VLS_36 = {}.Cell;
/** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    title: "隐私说明",
}));
const __VLS_38 = __VLS_37({
    title: "隐私说明",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { value: __VLS_thisSlot } = __VLS_39.slots;
    /** @type {[typeof PrivacyNotice, ]} */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(PrivacyNotice, new PrivacyNotice({}));
    const __VLS_41 = __VLS_40({}, ...__VLS_functionalComponentArgsRest(__VLS_40));
}
var __VLS_39;
if (__VLS_ctx.profile) {
    const __VLS_43 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent(__VLS_43, new __VLS_43({
        ...{ 'onClick': {} },
        title: "退出登录",
        isLink: true,
    }));
    const __VLS_45 = __VLS_44({
        ...{ 'onClick': {} },
        title: "退出登录",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_47;
    let __VLS_48;
    let __VLS_49;
    const __VLS_50 = {
        onClick: (__VLS_ctx.signOut)
    };
    var __VLS_46;
}
if (__VLS_ctx.profile) {
    const __VLS_51 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({
        ...{ 'onClick': {} },
        title: "删除账号",
        isLink: true,
    }));
    const __VLS_53 = __VLS_52({
        ...{ 'onClick': {} },
        title: "删除账号",
        isLink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_52));
    let __VLS_55;
    let __VLS_56;
    let __VLS_57;
    const __VLS_58 = {
        onClick: (__VLS_ctx.deleteAccount)
    };
    var __VLS_54;
}
const __VLS_59 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent(__VLS_59, new __VLS_59({
    show: (__VLS_ctx.showEdit),
    position: "bottom",
    round: true,
}));
const __VLS_61 = __VLS_60({
    show: (__VLS_ctx.showEdit),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
__VLS_62.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_63 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
    modelValue: (__VLS_ctx.nickname),
    label: "昵称",
    placeholder: "你的昵称",
}));
const __VLS_65 = __VLS_64({
    modelValue: (__VLS_ctx.nickname),
    label: "昵称",
    placeholder: "你的昵称",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
const __VLS_67 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent(__VLS_67, new __VLS_67({
    modelValue: (__VLS_ctx.title),
    label: "头衔",
    placeholder: "如:敬拜组",
}));
const __VLS_69 = __VLS_68({
    modelValue: (__VLS_ctx.title),
    label: "头衔",
    placeholder: "如:敬拜组",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "color-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "colors" },
});
for (const [c] of __VLS_getVForSourceType((__VLS_ctx.colors))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.avatarColor = c;
            } },
        key: (c),
        ...{ class: "color-dot" },
        ...{ class: ({ active: __VLS_ctx.avatarColor === c }) },
        ...{ style: ({ background: c }) },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "btns" },
});
const __VLS_71 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent(__VLS_71, new __VLS_71({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_73 = __VLS_72({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_75;
let __VLS_76;
let __VLS_77;
const __VLS_78 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showEdit = false;
    }
};
__VLS_74.slots.default;
var __VLS_74;
const __VLS_79 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent(__VLS_79, new __VLS_79({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_81 = __VLS_80({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_83;
let __VLS_84;
let __VLS_85;
const __VLS_86 = {
    onClick: (__VLS_ctx.saveProfile)
};
__VLS_82.slots.default;
var __VLS_82;
var __VLS_62;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['code']} */ ;
/** @type {__VLS_StyleScopedClasses['edit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['color-row']} */ ;
/** @type {__VLS_StyleScopedClasses['colors']} */ ;
/** @type {__VLS_StyleScopedClasses['color-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['btns']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Cell: Cell,
            Button: Button,
            Popup: Popup,
            Field: Field,
            PrivacyNotice: PrivacyNotice,
            router: router,
            profile: profile,
            showEdit: showEdit,
            nickname: nickname,
            title: title,
            avatarColor: avatarColor,
            colors: colors,
            openEdit: openEdit,
            saveProfile: saveProfile,
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
