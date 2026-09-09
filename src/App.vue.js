import { RouterView } from 'vue-router';
import { Tabbar, TabbarItem } from 'vant';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const active = ref(tabKey(route.path));
function tabKey(p) {
    if (p.startsWith('/read'))
        return 'read';
    if (p.startsWith('/search'))
        return 'search';
    if (p.startsWith('/ai'))
        return 'ai';
    if (p.startsWith('/chat'))
        return 'chat';
    if (p.startsWith('/me'))
        return 'me';
    return 'read';
}
function onTab(k) {
    const map = {
        read: '/read',
        search: '/search',
        ai: '/ai',
        chat: '/chat',
        me: '/me'
    };
    router.push(map[k] || '/read');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-shell" },
});
const __VLS_0 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.RouterView, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
{
    const { default: __VLS_thisSlot } = __VLS_3.slots;
    const [{ Component }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_4 = {}.KeepAlive;
    /** @type {[typeof __VLS_components.KeepAlive, typeof __VLS_components.keepAlive, typeof __VLS_components.KeepAlive, typeof __VLS_components.keepAlive, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        include: (['Home', 'Search']),
    }));
    const __VLS_6 = __VLS_5({
        include: (['Home', 'Search']),
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    const __VLS_8 = ((Component));
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({}));
    const __VLS_10 = __VLS_9({}, ...__VLS_functionalComponentArgsRest(__VLS_9));
    var __VLS_7;
    __VLS_3.slots['' /* empty slot name completion */];
}
var __VLS_3;
const __VLS_12 = {}.Tabbar;
/** @type {[typeof __VLS_components.Tabbar, typeof __VLS_components.Tabbar, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.active),
    route: true,
    fixedPlaceholder: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.active),
    route: true,
    fixedPlaceholder: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onChange: (__VLS_ctx.onTab)
};
__VLS_15.slots.default;
const __VLS_20 = {}.TabbarItem;
/** @type {[typeof __VLS_components.TabbarItem, typeof __VLS_components.TabbarItem, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    name: "read",
}));
const __VLS_22 = __VLS_21({
    name: "read",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
var __VLS_23;
const __VLS_24 = {}.TabbarItem;
/** @type {[typeof __VLS_components.TabbarItem, typeof __VLS_components.TabbarItem, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    name: "search",
}));
const __VLS_26 = __VLS_25({
    name: "search",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
var __VLS_27;
const __VLS_28 = {}.TabbarItem;
/** @type {[typeof __VLS_components.TabbarItem, typeof __VLS_components.TabbarItem, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    name: "ai",
}));
const __VLS_30 = __VLS_29({
    name: "ai",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
var __VLS_31;
const __VLS_32 = {}.TabbarItem;
/** @type {[typeof __VLS_components.TabbarItem, typeof __VLS_components.TabbarItem, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    name: "chat",
}));
const __VLS_34 = __VLS_33({
    name: "chat",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
var __VLS_35;
const __VLS_36 = {}.TabbarItem;
/** @type {[typeof __VLS_components.TabbarItem, typeof __VLS_components.TabbarItem, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    name: "me",
}));
const __VLS_38 = __VLS_37({
    name: "me",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
var __VLS_39;
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            RouterView: RouterView,
            Tabbar: Tabbar,
            TabbarItem: TabbarItem,
            active: active,
            onTab: onTab,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
