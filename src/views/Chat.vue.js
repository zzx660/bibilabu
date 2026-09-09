import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Cell, Button, Field, NavBar, showToast } from 'vant';
import { useRouter } from 'vue-router';
import { useChatStore } from '@/stores/chat';
import { currentProfile, supabase } from '@/api/supabase';
const router = useRouter();
const store = useChatStore();
const view = ref('list');
const input = ref('');
const list = ref();
const profile = ref(null);
// 建群
const showCreate = ref(false);
const groupTitle = ref('');
const memberEmail = ref('');
onMounted(async () => {
    profile.value = await currentProfile();
    if (!profile.value)
        return;
    await store.init();
});
onUnmounted(() => store.leaveRoom());
async function enterRoom(roomId) {
    view.value = 'chat';
    await store.openRoom(roomId);
    await scrollBottom();
}
async function back() {
    store.leaveRoom();
    view.value = 'list';
}
async function send() {
    const t = input.value.trim();
    if (!t)
        return;
    input.value = '';
    await store.send(t);
    await scrollBottom();
}
async function scrollBottom() {
    await nextTick();
    const el = list.value;
    if (el)
        el.scrollTop = el.scrollHeight;
}
async function createGroup() {
    if (!groupTitle.value || !memberEmail.value) {
        showToast('请填写群名和成员邮箱');
        return;
    }
    // 按邮箱查用户
    const { data: member } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', memberEmail.value)
        .single();
    if (!member) {
        showToast('未找到该用户');
        return;
    }
    const roomId = await store.createGroup(groupTitle.value, [member.id]);
    if (roomId) {
        showCreate.value = false;
        groupTitle.value = '';
        memberEmail.value = '';
        showToast('群已创建');
        await enterRoom(roomId);
    }
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['mine']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-btns']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page chat-page" },
});
if (!__VLS_ctx.profile) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty" },
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
            if (!(!__VLS_ctx.profile))
                return;
            __VLS_ctx.router.push('/login');
        }
    };
    __VLS_3.slots.default;
    var __VLS_3;
}
else if (__VLS_ctx.view === 'list') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: "title" },
    });
    const __VLS_8 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClick': {} },
        plain: true,
        size: "small",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClick': {} },
        plain: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClick: (...[$event]) => {
            if (!!(!__VLS_ctx.profile))
                return;
            if (!(__VLS_ctx.view === 'list'))
                return;
            __VLS_ctx.showCreate = true;
        }
    };
    __VLS_11.slots.default;
    var __VLS_11;
    for (const [r] of __VLS_getVForSourceType((__VLS_ctx.store.rooms))) {
        const __VLS_16 = {}.Cell;
        /** @type {[typeof __VLS_components.Cell, ]} */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
            ...{ 'onClick': {} },
            key: (r.id),
            title: (r.title || (r.type === 'dm' ? '私信' : '群聊')),
            isLink: true,
        }));
        const __VLS_18 = __VLS_17({
            ...{ 'onClick': {} },
            key: (r.id),
            title: (r.title || (r.type === 'dm' ? '私信' : '群聊')),
            isLink: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
        let __VLS_20;
        let __VLS_21;
        let __VLS_22;
        const __VLS_23 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.profile))
                    return;
                if (!(__VLS_ctx.view === 'list'))
                    return;
                __VLS_ctx.enterRoom(r.id);
            }
        };
        var __VLS_19;
    }
    if (!__VLS_ctx.store.rooms.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
            ...{ class: "muted" },
        });
    }
}
else {
    const __VLS_24 = {}.NavBar;
    /** @type {[typeof __VLS_components.NavBar, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClickLeft': {} },
        title: "聊天",
        leftText: "返回",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClickLeft': {} },
        title: "聊天",
        leftText: "返回",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClickLeft: (__VLS_ctx.back)
    };
    var __VLS_27;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ref: "list",
        ...{ class: "msgs" },
    });
    /** @type {typeof __VLS_ctx.list} */ ;
    for (const [m] of __VLS_getVForSourceType((__VLS_ctx.store.messages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (m.id),
            ...{ class: (['msg', m.mine ? 'mine' : 'other']) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bubble" },
        });
        (m.text);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "input-bar" },
    });
    const __VLS_32 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.input),
        placeholder: "说点什么…",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.input),
        placeholder: "说点什么…",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onKeyup: (__VLS_ctx.send)
    };
    var __VLS_35;
    const __VLS_40 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_42 = __VLS_41({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    let __VLS_44;
    let __VLS_45;
    let __VLS_46;
    const __VLS_47 = {
        onClick: (__VLS_ctx.send)
    };
    __VLS_43.slots.default;
    var __VLS_43;
}
if (__VLS_ctx.showCreate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.showCreate))
                    return;
                __VLS_ctx.showCreate = false;
            } },
        ...{ class: "sheet" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sheet-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    const __VLS_48 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        modelValue: (__VLS_ctx.groupTitle),
        label: "群名",
        placeholder: "如:周间查经",
    }));
    const __VLS_50 = __VLS_49({
        modelValue: (__VLS_ctx.groupTitle),
        label: "群名",
        placeholder: "如:周间查经",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    const __VLS_52 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        modelValue: (__VLS_ctx.memberEmail),
        label: "成员邮箱",
        placeholder: "对方的注册邮箱",
    }));
    const __VLS_54 = __VLS_53({
        modelValue: (__VLS_ctx.memberEmail),
        label: "成员邮箱",
        placeholder: "对方的注册邮箱",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "sheet-btns" },
    });
    const __VLS_56 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        ...{ 'onClick': {} },
        plain: true,
    }));
    const __VLS_58 = __VLS_57({
        ...{ 'onClick': {} },
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    let __VLS_60;
    let __VLS_61;
    let __VLS_62;
    const __VLS_63 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.showCreate))
                return;
            __VLS_ctx.showCreate = false;
        }
    };
    __VLS_59.slots.default;
    var __VLS_59;
    const __VLS_64 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_66 = __VLS_65({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    let __VLS_68;
    let __VLS_69;
    let __VLS_70;
    const __VLS_71 = {
        onClick: (__VLS_ctx.createGroup)
    };
    __VLS_67.slots.default;
    var __VLS_67;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-page']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['bar']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['msgs']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-btns']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Cell: Cell,
            Button: Button,
            Field: Field,
            NavBar: NavBar,
            router: router,
            store: store,
            view: view,
            input: input,
            list: list,
            profile: profile,
            showCreate: showCreate,
            groupTitle: groupTitle,
            memberEmail: memberEmail,
            enterRoom: enterRoom,
            back: back,
            send: send,
            createGroup: createGroup,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
