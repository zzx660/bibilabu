import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { NavBar, Button, Field, showToast, showConfirmDialog, Popup, Tabs, Tab } from 'vant';
import { useChatStore } from '@/stores/chat';
import { currentProfile } from '@/api/supabase';
import { api } from '@/api/hono';
const router = useRouter();
const store = useChatStore();
const tab = ref('messages');
const profile = ref(null);
// 聊天视图
const view = ref('list');
const input = ref('');
const list = ref();
const activeTitle = ref('');
// 好友
const friends = ref([]);
const requests = ref([]);
const friendCode = ref('');
const showAddFriend = ref(false);
// 群组
const groups = ref([]);
const showCreate = ref(false);
const groupTitle = ref('');
const groupMemberIds = ref([]);
// 代祷
const myPrayers = ref([]);
const friendsPrayers = ref([]);
const showPrayer = ref(false);
const prayerName = ref('');
const prayerContent = ref('');
const prayerVisibility = ref('friends');
onMounted(async () => {
    profile.value = await currentProfile();
    if (!profile.value)
        return;
    await store.init();
    await loadAll();
});
onUnmounted(() => store.leaveRoom());
async function loadAll() {
    const { friends: f, requests: r } = await api.listFriends();
    friends.value = f;
    requests.value = r;
    // 群组
    groups.value = store.rooms.filter((r) => r.type === 'group');
    // 代祷
    try {
        const { items: m } = await api.myPrayers();
        myPrayers.value = m;
    }
    catch { }
    try {
        const { items: fp } = await api.friendsPrayers();
        friendsPrayers.value = fp;
    }
    catch { }
}
async function enterRoom(roomId, title) {
    const r = store.rooms.find((x) => x.id === roomId);
    if (r?.type === 'group') {
        router.push(`/group/${roomId}`);
        return;
    }
    view.value = 'chat';
    activeTitle.value = title || '私信';
    await store.openRoom(roomId);
    await scrollBottom();
}
function back() {
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
// 好友
async function addFriend() {
    if (!friendCode.value.trim())
        return;
    try {
        await api.requestFriend(friendCode.value.trim());
        showToast('好友申请已发送');
        showAddFriend.value = false;
        friendCode.value = '';
    }
    catch (e) {
        showToast(e.message || '失败');
    }
}
async function acceptFriend(uid) {
    await api.acceptFriend(uid);
    showToast('已同意');
    await loadAll();
}
async function removeFriend(id) {
    try {
        await showConfirmDialog({ title: '解除好友', message: '确认?' });
    }
    catch {
        return;
    }
    await api.removeFriend(id);
    await loadAll();
}
// 群组
async function createGroup() {
    if (!groupTitle.value.trim()) {
        showToast('请输入群名');
        return;
    }
    if (!groupMemberIds.value.length) {
        showToast('请选择成员');
        return;
    }
    const roomId = await store.createGroup(groupTitle.value, groupMemberIds.value);
    if (roomId) {
        showCreate.value = false;
        groupTitle.value = '';
        groupMemberIds.value = [];
        showToast('群已创建');
        router.push(`/group/${roomId}`);
    }
}
// 代祷
async function submitPrayer() {
    if (!prayerName.value.trim() || !prayerContent.value.trim()) {
        showToast('请填写完整');
        return;
    }
    await api.createPrayer(prayerName.value, prayerContent.value, prayerVisibility.value);
    showPrayer.value = false;
    prayerName.value = '';
    prayerContent.value = '';
    showToast('代祷已发布');
    await loadAll();
}
async function removePrayer(id) {
    try {
        await showConfirmDialog({ title: '删除代祷', message: '确认?' });
    }
    catch {
        return;
    }
    await api.removePrayer(id);
    await loadAll();
}
async function checkinPrayer(id) {
    try {
        await api.checkinPrayer(id);
        showToast('已打卡');
    }
    catch (e) {
        showToast(e.message || '失败');
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
else if (__VLS_ctx.view === 'chat') {
    const __VLS_8 = {}.NavBar;
    /** @type {[typeof __VLS_components.NavBar, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        ...{ 'onClickLeft': {} },
        title: (__VLS_ctx.activeTitle),
        leftText: "返回",
    }));
    const __VLS_10 = __VLS_9({
        ...{ 'onClickLeft': {} },
        title: (__VLS_ctx.activeTitle),
        leftText: "返回",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    let __VLS_12;
    let __VLS_13;
    let __VLS_14;
    const __VLS_15 = {
        onClickLeft: (__VLS_ctx.back)
    };
    var __VLS_11;
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
    const __VLS_16 = {}.Field;
    /** @type {[typeof __VLS_components.Field, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.input),
        placeholder: "说点什么…",
    }));
    const __VLS_18 = __VLS_17({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.input),
        placeholder: "说点什么…",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    let __VLS_20;
    let __VLS_21;
    let __VLS_22;
    const __VLS_23 = {
        onKeyup: (__VLS_ctx.send)
    };
    var __VLS_19;
    const __VLS_24 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.send)
    };
    __VLS_27.slots.default;
    var __VLS_27;
}
else {
    const __VLS_32 = {}.NavBar;
    /** @type {[typeof __VLS_components.NavBar, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        title: "团契",
    }));
    const __VLS_34 = __VLS_33({
        title: "团契",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const __VLS_36 = {}.Tabs;
    /** @type {[typeof __VLS_components.Tabs, typeof __VLS_components.Tabs, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        modelValue: (__VLS_ctx.tab),
        shrink: true,
    }));
    const __VLS_38 = __VLS_37({
        modelValue: (__VLS_ctx.tab),
        shrink: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    const __VLS_40 = {}.Tab;
    /** @type {[typeof __VLS_components.Tab, typeof __VLS_components.Tab, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        title: "消息",
        name: "messages",
    }));
    const __VLS_42 = __VLS_41({
        title: "消息",
        name: "messages",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    for (const [r] of __VLS_getVForSourceType((__VLS_ctx.store.rooms))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.profile))
                        return;
                    if (!!(__VLS_ctx.view === 'chat'))
                        return;
                    __VLS_ctx.enterRoom(r.id, r.title);
                } },
            key: (r.id),
            ...{ class: "room-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "room-title" },
        });
        (r.title || (r.type === 'dm' ? '私信' : '群聊'));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "arrow" },
        });
    }
    if (!__VLS_ctx.store.rooms.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty muted" },
        });
    }
    var __VLS_43;
    const __VLS_44 = {}.Tab;
    /** @type {[typeof __VLS_components.Tab, typeof __VLS_components.Tab, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        title: (`好友${__VLS_ctx.requests.length ? `(${__VLS_ctx.requests.length})` : ''}`),
        name: "friends",
    }));
    const __VLS_46 = __VLS_45({
        title: (`好友${__VLS_ctx.requests.length ? `(${__VLS_ctx.requests.length})` : ''}`),
        name: "friends",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-bar" },
    });
    const __VLS_48 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        plain: true,
    }));
    const __VLS_50 = __VLS_49({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_52;
    let __VLS_53;
    let __VLS_54;
    const __VLS_55 = {
        onClick: (...[$event]) => {
            if (!!(!__VLS_ctx.profile))
                return;
            if (!!(__VLS_ctx.view === 'chat'))
                return;
            __VLS_ctx.showAddFriend = true;
        }
    };
    __VLS_51.slots.default;
    var __VLS_51;
    for (const [f] of __VLS_getVForSourceType((__VLS_ctx.friends))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (f.user_id),
            ...{ class: "friend-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.profile))
                        return;
                    if (!!(__VLS_ctx.view === 'chat'))
                        return;
                    __VLS_ctx.router.push(`/friend/${f.user_id}`);
                } },
            ...{ class: "friend-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "avatar" },
        });
        ((f.nickname || f.username || '?').slice(0, 1));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "fname" },
        });
        (f.remark || f.nickname || f.username);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "muted text-sm" },
        });
        (f.username);
        const __VLS_56 = {}.Button;
        /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            ...{ 'onClick': {} },
            size: "mini",
            plain: true,
        }));
        const __VLS_58 = __VLS_57({
            ...{ 'onClick': {} },
            size: "mini",
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        let __VLS_60;
        let __VLS_61;
        let __VLS_62;
        const __VLS_63 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.profile))
                    return;
                if (!!(__VLS_ctx.view === 'chat'))
                    return;
                __VLS_ctx.removeFriend(f.id);
            }
        };
        __VLS_59.slots.default;
        var __VLS_59;
    }
    if (!__VLS_ctx.friends.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty muted" },
        });
    }
    var __VLS_47;
    const __VLS_64 = {}.Tab;
    /** @type {[typeof __VLS_components.Tab, typeof __VLS_components.Tab, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        title: "群组",
        name: "groups",
    }));
    const __VLS_66 = __VLS_65({
        title: "群组",
        name: "groups",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-bar" },
    });
    const __VLS_68 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        plain: true,
    }));
    const __VLS_70 = __VLS_69({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    let __VLS_72;
    let __VLS_73;
    let __VLS_74;
    const __VLS_75 = {
        onClick: (...[$event]) => {
            if (!!(!__VLS_ctx.profile))
                return;
            if (!!(__VLS_ctx.view === 'chat'))
                return;
            __VLS_ctx.showCreate = true;
        }
    };
    __VLS_71.slots.default;
    var __VLS_71;
    for (const [g] of __VLS_getVForSourceType((__VLS_ctx.groups))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    if (!!(!__VLS_ctx.profile))
                        return;
                    if (!!(__VLS_ctx.view === 'chat'))
                        return;
                    __VLS_ctx.router.push(`/group/${g.id}`);
                } },
            key: (g.id),
            ...{ class: "room-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "room-title" },
        });
        (g.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "arrow" },
        });
    }
    if (!__VLS_ctx.groups.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty muted" },
        });
    }
    var __VLS_67;
    const __VLS_76 = {}.Tab;
    /** @type {[typeof __VLS_components.Tab, typeof __VLS_components.Tab, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        title: "代祷",
        name: "prayers",
    }));
    const __VLS_78 = __VLS_77({
        title: "代祷",
        name: "prayers",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-bar" },
    });
    const __VLS_80 = {}.Button;
    /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_82 = __VLS_81({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    let __VLS_84;
    let __VLS_85;
    let __VLS_86;
    const __VLS_87 = {
        onClick: (...[$event]) => {
            if (!!(!__VLS_ctx.profile))
                return;
            if (!!(__VLS_ctx.view === 'chat'))
                return;
            __VLS_ctx.showPrayer = true;
        }
    };
    __VLS_83.slots.default;
    var __VLS_83;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "sub" },
    });
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.myPrayers))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (p.id),
            ...{ class: "prayer-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "p-name" },
        });
        (p.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "p-content" },
        });
        (p.content);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "p-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted" },
        });
        (new Date(p.created_at).toLocaleDateString());
        (p.visibility === 'public' ? '公开' : '好友');
        const __VLS_88 = {}.Button;
        /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            ...{ 'onClick': {} },
            size: "mini",
            plain: true,
        }));
        const __VLS_90 = __VLS_89({
            ...{ 'onClick': {} },
            size: "mini",
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        let __VLS_92;
        let __VLS_93;
        let __VLS_94;
        const __VLS_95 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.profile))
                    return;
                if (!!(__VLS_ctx.view === 'chat'))
                    return;
                __VLS_ctx.removePrayer(p.id);
            }
        };
        __VLS_91.slots.default;
        var __VLS_91;
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h4, __VLS_intrinsicElements.h4)({
        ...{ class: "sub" },
    });
    for (const [p] of __VLS_getVForSourceType((__VLS_ctx.friendsPrayers))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (p.id),
            ...{ class: "prayer-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "p-name" },
        });
        (p.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted text-sm" },
        });
        (p.username);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "p-content" },
        });
        (p.content);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "p-meta" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "muted" },
        });
        (new Date(p.created_at).toLocaleDateString());
        const __VLS_96 = {}.Button;
        /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            ...{ 'onClick': {} },
            size: "mini",
            type: "primary",
            plain: true,
        }));
        const __VLS_98 = __VLS_97({
            ...{ 'onClick': {} },
            size: "mini",
            type: "primary",
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        let __VLS_100;
        let __VLS_101;
        let __VLS_102;
        const __VLS_103 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.profile))
                    return;
                if (!!(__VLS_ctx.view === 'chat'))
                    return;
                __VLS_ctx.checkinPrayer(p.id);
            }
        };
        __VLS_99.slots.default;
        var __VLS_99;
    }
    if (!__VLS_ctx.myPrayers.length && !__VLS_ctx.friendsPrayers.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty muted" },
        });
    }
    var __VLS_79;
    const __VLS_104 = {}.Tab;
    /** @type {[typeof __VLS_components.Tab, typeof __VLS_components.Tab, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        title: (`申请${__VLS_ctx.requests.length ? `(${__VLS_ctx.requests.length})` : ''}`),
        name: "requests",
    }));
    const __VLS_106 = __VLS_105({
        title: (`申请${__VLS_ctx.requests.length ? `(${__VLS_ctx.requests.length})` : ''}`),
        name: "requests",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
    for (const [r] of __VLS_getVForSourceType((__VLS_ctx.requests))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (r.id),
            ...{ class: "req-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "friend-info" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "avatar" },
        });
        ((r.from_username || '?').slice(0, 1));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "fname" },
        });
        (r.from_username);
        if (r.message) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "muted text-sm" },
            });
            (r.message);
        }
        const __VLS_108 = {}.Button;
        /** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
            ...{ 'onClick': {} },
            size: "mini",
            type: "primary",
        }));
        const __VLS_110 = __VLS_109({
            ...{ 'onClick': {} },
            size: "mini",
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        let __VLS_112;
        let __VLS_113;
        let __VLS_114;
        const __VLS_115 = {
            onClick: (...[$event]) => {
                if (!!(!__VLS_ctx.profile))
                    return;
                if (!!(__VLS_ctx.view === 'chat'))
                    return;
                __VLS_ctx.acceptFriend(r.from_id);
            }
        };
        __VLS_111.slots.default;
        var __VLS_111;
    }
    if (!__VLS_ctx.requests.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "empty muted" },
        });
    }
    var __VLS_107;
    var __VLS_39;
}
const __VLS_116 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    show: (__VLS_ctx.showAddFriend),
    position: "bottom",
    round: true,
}));
const __VLS_118 = __VLS_117({
    show: (__VLS_ctx.showAddFriend),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-inner" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_120 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.friendCode),
    label: "好友邀请码",
    placeholder: "输入对方的邀请码",
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.friendCode),
    label: "好友邀请码",
    placeholder: "输入对方的邀请码",
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-btns" },
});
const __VLS_124 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_128;
let __VLS_129;
let __VLS_130;
const __VLS_131 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showAddFriend = false;
    }
};
__VLS_127.slots.default;
var __VLS_127;
const __VLS_132 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_134 = __VLS_133({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
let __VLS_136;
let __VLS_137;
let __VLS_138;
const __VLS_139 = {
    onClick: (__VLS_ctx.addFriend)
};
__VLS_135.slots.default;
var __VLS_135;
var __VLS_119;
const __VLS_140 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    show: (__VLS_ctx.showCreate),
    position: "bottom",
    round: true,
}));
const __VLS_142 = __VLS_141({
    show: (__VLS_ctx.showCreate),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-inner" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_144 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    modelValue: (__VLS_ctx.groupTitle),
    label: "群名",
    placeholder: "如:周间查经",
}));
const __VLS_146 = __VLS_145({
    modelValue: (__VLS_ctx.groupTitle),
    label: "群名",
    placeholder: "如:周间查经",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "member-pick" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "muted text-sm" },
    ...{ style: {} },
});
for (const [f] of __VLS_getVForSourceType((__VLS_ctx.friends))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        key: (f.user_id),
        ...{ class: "check-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
        value: (f.user_id),
    });
    (__VLS_ctx.groupMemberIds);
    (f.nickname || f.username);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-btns" },
});
const __VLS_148 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_150 = __VLS_149({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
let __VLS_152;
let __VLS_153;
let __VLS_154;
const __VLS_155 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showCreate = false;
    }
};
__VLS_151.slots.default;
var __VLS_151;
const __VLS_156 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_158 = __VLS_157({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_157));
let __VLS_160;
let __VLS_161;
let __VLS_162;
const __VLS_163 = {
    onClick: (__VLS_ctx.createGroup)
};
__VLS_159.slots.default;
var __VLS_159;
var __VLS_143;
const __VLS_164 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
    show: (__VLS_ctx.showPrayer),
    position: "bottom",
    round: true,
}));
const __VLS_166 = __VLS_165({
    show: (__VLS_ctx.showPrayer),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
__VLS_167.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-inner" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
const __VLS_168 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.prayerName),
    label: "标题",
    placeholder: "如:为工作祷告",
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.prayerName),
    label: "标题",
    placeholder: "如:为工作祷告",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
const __VLS_172 = {}.Field;
/** @type {[typeof __VLS_components.Field, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.prayerContent),
    label: "内容",
    type: "textarea",
    rows: "3",
    placeholder: "具体代祷事项",
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.prayerContent),
    label: "内容",
    type: "textarea",
    rows: "3",
    placeholder: "具体代祷事项",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "vis-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "radio",
    value: "friends",
});
(__VLS_ctx.prayerVisibility);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "radio",
    value: "public",
});
(__VLS_ctx.prayerVisibility);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-btns" },
});
const __VLS_176 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_178 = __VLS_177({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
let __VLS_180;
let __VLS_181;
let __VLS_182;
const __VLS_183 = {
    onClick: (...[$event]) => {
        __VLS_ctx.showPrayer = false;
    }
};
__VLS_179.slots.default;
var __VLS_179;
const __VLS_184 = {}.Button;
/** @type {[typeof __VLS_components.Button, typeof __VLS_components.Button, ]} */ ;
// @ts-ignore
const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_186 = __VLS_185({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_185));
let __VLS_188;
let __VLS_189;
let __VLS_190;
const __VLS_191 = {
    onClick: (__VLS_ctx.submitPrayer)
};
__VLS_187.slots.default;
var __VLS_187;
var __VLS_167;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['chat-page']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['msgs']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['room-item']} */ ;
/** @type {__VLS_StyleScopedClasses['room-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['action-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['friend-item']} */ ;
/** @type {__VLS_StyleScopedClasses['friend-info']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['fname']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['action-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['room-item']} */ ;
/** @type {__VLS_StyleScopedClasses['room-title']} */ ;
/** @type {__VLS_StyleScopedClasses['arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['action-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['prayer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['p-name']} */ ;
/** @type {__VLS_StyleScopedClasses['p-content']} */ ;
/** @type {__VLS_StyleScopedClasses['p-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['sub']} */ ;
/** @type {__VLS_StyleScopedClasses['prayer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['p-name']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['p-content']} */ ;
/** @type {__VLS_StyleScopedClasses['p-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['req-item']} */ ;
/** @type {__VLS_StyleScopedClasses['friend-info']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['fname']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['empty']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-btns']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['member-pick']} */ ;
/** @type {__VLS_StyleScopedClasses['muted']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['check-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-btns']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['vis-row']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-btns']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NavBar: NavBar,
            Button: Button,
            Field: Field,
            Popup: Popup,
            Tabs: Tabs,
            Tab: Tab,
            router: router,
            store: store,
            tab: tab,
            profile: profile,
            view: view,
            input: input,
            list: list,
            activeTitle: activeTitle,
            friends: friends,
            requests: requests,
            friendCode: friendCode,
            showAddFriend: showAddFriend,
            groups: groups,
            showCreate: showCreate,
            groupTitle: groupTitle,
            groupMemberIds: groupMemberIds,
            myPrayers: myPrayers,
            friendsPrayers: friendsPrayers,
            showPrayer: showPrayer,
            prayerName: prayerName,
            prayerContent: prayerContent,
            prayerVisibility: prayerVisibility,
            enterRoom: enterRoom,
            back: back,
            send: send,
            addFriend: addFriend,
            acceptFriend: acceptFriend,
            removeFriend: removeFriend,
            createGroup: createGroup,
            submitPrayer: submitPrayer,
            removePrayer: removePrayer,
            checkinPrayer: checkinPrayer,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
