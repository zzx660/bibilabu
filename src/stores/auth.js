import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/api/supabase';
import { api } from '@/api/hono';
export const useAuthStore = defineStore('auth', () => {
    const profile = ref(null);
    const loading = ref(false);
    async function init() {
        loading.value = true;
        try {
            // 先从 Supabase session 恢复
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                await loadProfile();
            }
        }
        finally {
            loading.value = false;
        }
    }
    async function loadProfile() {
        const res = await api.me();
        if (res?.profile) {
            profile.value = res.profile;
            return res.profile;
        }
        return null;
    }
    async function login(username, password) {
        const data = await api.login(username, password);
        if (data?.session) {
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
            localStorage.setItem('sb_token', data.session.access_token);
        }
        await loadProfile();
        return profile.value;
    }
    async function register(username, password, invite_code) {
        const data = await api.register(username, password, invite_code);
        if (data?.session) {
            await supabase.auth.setSession({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token
            });
            localStorage.setItem('sb_token', data.session.access_token);
        }
        await loadProfile();
        return profile.value;
    }
    async function logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('sb_token');
        profile.value = null;
    }
    async function changeInviteCode(code) {
        await api.changeInviteCode(code);
        await loadProfile();
    }
    return { profile, loading, init, login, register, logout, loadProfile, changeInviteCode };
});
