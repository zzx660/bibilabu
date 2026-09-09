import { ref, onMounted } from 'vue';
import { Cell, Button, Tag, showToast } from 'vant';
import { supabase } from '@/api/supabase';
const list = ref([]);
onMounted(load);
async function load() {
    const { data } = await supabase
        .from('profiles')
        .select('id,email,role,display_name')
        .order('created_at', { ascending: false });
    list.value = data || [];
}
async function toggleRole(u) {
    const next = u.role === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: next }).eq('id', u.id);
    if (error) {
        showToast(error.message);
        return;
    }
    u.role = next;
    await logAudit(u.id, `set_role_${next}`);
}
async function logAudit(target, action) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return;
    await supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target });
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
for (const [u] of __VLS_getVForSourceType((__VLS_ctx.list))) {
    const __VLS_0 = {}.Cell;
    /** @type {[typeof __VLS_components.Cell, typeof __VLS_components.Cell, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        key: (u.id),
        title: (u.display_name || u.email),
        label: (u.email),
    }));
    const __VLS_2 = __VLS_1({
        key: (u.id),
        title: (u.display_name || u.email),
        label: (u.email),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    {
        const { value: __VLS_thisSlot } = __VLS_3.slots;
        const __VLS_4 = {}.Tag;
        /** @type {[typeof __VLS_components.Tag, typeof __VLS_components.Tag, ]} */ ;
        // @ts-ignore
        const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
            type: (u.role === 'admin' ? 'danger' : 'default'),
            plain: true,
        }));
        const __VLS_6 = __VLS_5({
            type: (u.role === 'admin' ? 'danger' : 'default'),
            plain: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        __VLS_7.slots.default;
        (u.role === 'admin' ? '管理员' : '普通');
        var __VLS_7;
    }
    {
        const { extra: __VLS_thisSlot } = __VLS_3.slots;
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
                __VLS_ctx.toggleRole(u);
            }
        };
        __VLS_11.slots.default;
        (u.role === 'admin' ? '降为普通' : '提升管理员');
        var __VLS_11;
    }
    var __VLS_3;
}
/** @type {__VLS_StyleScopedClasses['page']} */ ;
/** @type {__VLS_StyleScopedClasses['pinch']} */ ;
/** @type {__VLS_StyleScopedClasses['pad']} */ ;
/** @type {__VLS_StyleScopedClasses['title']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Cell: Cell,
            Button: Button,
            Tag: Tag,
            list: list,
            toggleRole: toggleRole,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
