import { ref, onMounted } from 'vue';
import { Field, Button, showToast, Tabs, Tab } from 'vant';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
const auth = useAuthStore();
const router = useRouter();
const mode = ref('login');
const username = ref('');
const password = ref('');
const inviteCode = ref('');
const showPwd = ref(false);
const submitting = ref(false);
onMounted(async () => {
    await auth.init();
    if (auth.profile)
        router.replace('/read');
});
async function submit() {
    if (!username.value || !password.value) {
        showToast('请输入账号和密码');
        return;
    }
    if (password.value.length < 6) {
        showToast('密码至少 6 位');
        return;
    }
    submitting.value = true;
    try {
        if (mode.value === 'login') {
            await auth.login(username.value.trim(), password.value);
            showToast('登录成功');
        }
        else {
            const p = await auth.register(username.value.trim(), password.value, inviteCode.value.trim() || undefined);
            if (p)
                showToast(`注册成功,你的好友码是 ${p.friend_code}`);
        }
        router.replace('/read');
    }
    catch (e) {
        showToast(e?.response?.data?.error || e?.message || '操作失败');
    }
    finally {
        submitting.value = false;
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page auth-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "auth-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "logo" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "title" },
});
(__VLS_ctx.mode === 'login' ? '登录' : '注册');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "subtitle" },
});
const __VLS_0 = {}.Tabs;
/** @type {[typeof __VLS_components.Tabs, typeof __VLS_components.Tabs, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    active: (__VLS_ctx.mode),
    ...{ class: "mode-tabs" },
    shrink: true,
}));
const __VLS_2 = __VLS_1({
    active: (__VLS_ctx.mode),
    ...{ class: "mode-tabs" },
    shrink: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
const __VLS_4 = {}.Tab;
/** @type {[typeof __VLS_components.Tab, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    title: "登录",
    name: "login",
}));
const __VLS_6 = __VLS_5({
    title: "登录",
    name: "login",
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
const __VLS_8 = {}.Tab;
/** @type {[typeof __VLS_components.Tab, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    title: "注册",
    name: "signup",
}));
const __VLS_10 = __VLS_9({
    title: "注册",
    name: "signup",
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form" },
});
const __VLS_12 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.username),
    label: "账号",
    placeholder: "字母/数字/中文,2-32位",
    maxlength: "32",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.username),
    label: "账号",
    placeholder: "字母/数字/中文,2-32位",
    maxlength: "32",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const __VLS_16 = {}.Field;
/** @type {[typeof __VLS_components.Field, typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    modelValue: (__VLS_ctx.password),
    type: (__VLS_ctx.showPwd ? 'text' : 'password'),
    label: "密码",
    placeholder: "至少 6 位",
    maxlength: "64",
}));
const __VLS_18 = __VLS_17({
    modelValue: (__VLS_ctx.password),
    type: (__VLS_ctx.showPwd ? 'text' : 'password'),
    label: "密码",
    placeholder: "至少 6 位",
    maxlength: "64",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { button: __VLS_thisSlot } = __VLS_19.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showPwd = !__VLS_ctx.showPwd;
            } },
        ...{ class: "eye" },
    });
    (__VLS_ctx.showPwd ? '🙈' : '👁');
}
var __VLS_19;
if (__VLS_ctx.mode === 'signup') {
    const __VLS_20 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        modelValue: (__VLS_ctx.inviteCode),
        label: "邀请码",
        placeholder: "选填,邀请码由管理员提供",
        maxlength: "16",
    }));
    const __VLS_22 = __VLS_21({
        modelValue: (__VLS_ctx.inviteCode),
        label: "邀请码",
        placeholder: "选填,邀请码由管理员提供",
        maxlength: "16",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
const __VLS_24 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
    loading: (__VLS_ctx.submitting),
    ...{ class: "submit-btn" },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
    block: true,
    loading: (__VLS_ctx.submitting),
    ...{ class: "submit-btn" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.submit)
};
__VLS_27.slots.default;
(__VLS_ctx.mode === 'login' ? '登 录' : '注 册');
var __VLS_27;
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "tip" },
});
(__VLS_ctx.mode === 'login' ? '没有账号?切到注册 →' : '已有账号?切到登录 ←');
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-page']} */ ;
/** @type {__VLS_StyleScopedClasses['auth-card']} */ ;
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['mode-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['form']} */ ;
/** @type {__VLS_StyleScopedClasses['eye']} */ ;
/** @type {__VLS_StyleScopedClasses['submit-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tip']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Field: Field,
            Button: Button,
            Tabs: Tabs,
            Tab: Tab,
            mode: mode,
            username: username,
            password: password,
            inviteCode: inviteCode,
            showPwd: showPwd,
            submitting: submitting,
            submit: submit,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
