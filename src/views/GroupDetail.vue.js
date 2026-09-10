import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NavBar, showToast, showConfirmDialog, Popup } from 'vant';
import { api } from '@/api/hono';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
const route = useRoute();
const router = useRouter();
const id = route.params.id;
const chatStore = useChatStore();
const authStore = useAuthStore();
const group = ref(null);
const members = ref([]);
const msg = ref('');
const showMembers = ref(false);
const showInvite = ref(false);
const friends = ref([]);
const selected = ref([]);
const newAnnouncement = ref('');
const showAnnounce = ref(false);
async function load() {
    const { group: g, members: m } = await api.groupMembers(id);
    group.value = g;
    members.value = m;
}
onMounted(async () => {
    await chatStore.init();
    await load();
    await chatStore.openRoom(id);
});
onBeforeUnmount(() => {
    chatStore.leaveRoom();
});
const isOwner = computed(() => group.value?.owner_id === authStore.profile?.id);
function send() {
    if (!msg.value.trim())
        return;
    chatStore.send(msg.value);
    msg.value = '';
}
function memberName(uid) {
    const m = members.value.find((x) => x.user_id === uid);
    return m?.nickname || m?.username || '成员';
}
async function saveAnnouncement() {
    try {
        await api.setAnnouncement(id, newAnnouncement.value);
        showToast('已保存');
        showAnnounce.value = false;
        await load();
    }
    catch (e) {
        showToast(e.message || '失败');
    }
}
async function loadFriends() {
    const { friends: f } = await api.listFriends();
    friends.value = f;
    selected.value = [];
    showInvite.value = true;
}
async function invite() {
    if (!selected.value.length)
        return;
    try {
        await api.inviteToGroup(id, selected.value);
        showToast('已邀请');
        showInvite.value = false;
        await load();
    }
    catch (e) {
        showToast(e.message || '失败');
    }
}
async function setRole(uid, role) {
    await api.setMemberRole(id, uid, role);
    await load();
}
async function kick(uid) {
    try {
        await showConfirmDialog({ title: '移除成员', message: '确认移除?' });
    }
    catch {
        return;
    }
    await api.kickMember(id, uid);
    showToast('已移除');
    await load();
}
async function leave() {
    try {
        await showConfirmDialog({ title: '退出群组', message: '确认退出?' });
    }
    catch {
        return;
    }
    await api.leaveGroup(id);
    showToast('已退出');
    router.push('/chat');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['mine']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['member']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "page" },
});
const __VLS_0 = {}.NavBar;
/** @type {[typeof __VLS_components.NavBar, typeof __VLS_components.NavBar, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClickLeft': {} },
    title: (__VLS_ctx.group?.title || '群聊'),
    leftArrow: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClickLeft': {} },
    title: (__VLS_ctx.group?.title || '群聊'),
    leftArrow: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClickLeft: (...[$event]) => {
        __VLS_ctx.router.back();
    }
};
__VLS_3.slots.default;
{
    const { right: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showMembers = true;
            } },
        ...{ class: "nav-right" },
    });
}
var __VLS_3;
if (__VLS_ctx.group?.announcement) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "announcement" },
    });
    (__VLS_ctx.group.announcement);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "messages" },
});
for (const [m] of __VLS_getVForSourceType((__VLS_ctx.chatStore.messages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (m.id),
        ...{ class: "msg" },
        ...{ class: ({ mine: m.mine }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "name" },
    });
    (__VLS_ctx.memberName(m.sender_id));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bubble" },
    });
    (m.text);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "input-bar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onKeydown: (__VLS_ctx.send) },
    placeholder: "输入消息...",
});
(__VLS_ctx.msg);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.send) },
});
const __VLS_8 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    show: (__VLS_ctx.showMembers),
    position: "right",
    ...{ style: ({ width: '80%' }) },
}));
const __VLS_10 = __VLS_9({
    show: (__VLS_ctx.showMembers),
    position: "right",
    ...{ style: ({ width: '80%' }) },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet-head" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
(__VLS_ctx.members.length);
if (__VLS_ctx.isOwner) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ops" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.loadFriends) },
        ...{ class: "link" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                if (!(__VLS_ctx.isOwner))
                    return;
                __VLS_ctx.showAnnounce = true;
            } },
        ...{ class: "link danger" },
    });
}
for (const [m] of __VLS_getVForSourceType((__VLS_ctx.members))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (m.user_id),
        ...{ class: "member" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (m.nickname || m.username);
    if (m.role === 'owner') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
    }
    else if (m.role === 'admin') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.em, __VLS_intrinsicElements.em)({});
    }
    if (__VLS_ctx.isOwner && m.role !== 'owner') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "member-ops" },
        });
        if (m.role !== 'admin') {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isOwner && m.role !== 'owner'))
                            return;
                        if (!(m.role !== 'admin'))
                            return;
                        __VLS_ctx.setRole(m.user_id, 'admin');
                    } },
                ...{ class: "link" },
            });
        }
        else {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(__VLS_ctx.isOwner && m.role !== 'owner'))
                            return;
                        if (!!(m.role !== 'admin'))
                            return;
                        __VLS_ctx.setRole(m.user_id, 'member');
                    } },
                ...{ class: "link" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.isOwner && m.role !== 'owner'))
                        return;
                    __VLS_ctx.kick(m.user_id);
                } },
            ...{ class: "link danger" },
        });
    }
}
if (!__VLS_ctx.isOwner) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "leave" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.leave) },
        ...{ class: "btn danger" },
    });
}
var __VLS_11;
const __VLS_12 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    show: (__VLS_ctx.showInvite),
    position: "bottom",
    round: true,
}));
const __VLS_14 = __VLS_13({
    show: (__VLS_ctx.showInvite),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
for (const [f] of __VLS_getVForSourceType((__VLS_ctx.friends))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (f.user_id),
        ...{ class: "check-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
        type: "checkbox",
        value: (f.user_id),
    });
    (__VLS_ctx.selected);
    (f.nickname || f.username);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.invite) },
    ...{ class: "btn primary full" },
});
var __VLS_15;
const __VLS_16 = {}.Popup;
/** @type {[typeof __VLS_components.Popup, typeof __VLS_components.Popup, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    show: (__VLS_ctx.showAnnounce),
    position: "bottom",
    round: true,
}));
const __VLS_18 = __VLS_17({
    show: (__VLS_ctx.showAnnounce),
    position: "bottom",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sheet" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.newAnnouncement),
    rows: "3",
    placeholder: "群公告...",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.saveAnnouncement) },
    ...{ class: "btn primary full" },
});
var __VLS_19;
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-right']} */ ;
/** @type {__VLS_StyleScopedClasses['announcement']} */ ;
/** @type {__VLS_StyleScopedClasses['messages']} */ ;
/** @type {__VLS_StyleScopedClasses['msg']} */ ;
/** @type {__VLS_StyleScopedClasses['name']} */ ;
/** @type {__VLS_StyleScopedClasses['bubble']} */ ;
/** @type {__VLS_StyleScopedClasses['input-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet-head']} */ ;
/** @type {__VLS_StyleScopedClasses['ops']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['member']} */ ;
/** @type {__VLS_StyleScopedClasses['member-ops']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['link']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['leave']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['check-row']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['full']} */ ;
/** @type {__VLS_StyleScopedClasses['sheet']} */ ;
/** @type {__VLS_StyleScopedClasses['btn']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['full']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            NavBar: NavBar,
            Popup: Popup,
            router: router,
            chatStore: chatStore,
            group: group,
            members: members,
            msg: msg,
            showMembers: showMembers,
            showInvite: showInvite,
            friends: friends,
            selected: selected,
            newAnnouncement: newAnnouncement,
            showAnnounce: showAnnounce,
            isOwner: isOwner,
            send: send,
            memberName: memberName,
            saveAnnouncement: saveAnnouncement,
            loadFriends: loadFriends,
            invite: invite,
            setRole: setRole,
            kick: kick,
            leave: leave,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
