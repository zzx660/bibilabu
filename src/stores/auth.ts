import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/api/supabase'
import { api } from '@/api/hono'

export type Profile = {
  id: string
  username: string
  email: string
  friend_code: string
  invite_code: string | null
  role: 'user' | 'admin'
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<Profile | null>(null)
  const loading = ref(false)

  async function init() {
    loading.value = true
    try {
      // 先从 Supabase session 恢复
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        await loadProfile()
      }
    } finally {
      loading.value = false
    }
  }

  async function loadProfile() {
    const res = await api.me()
    if (res?.profile) {
      profile.value = res.profile
      return res.profile as Profile
    }
    return null
  }

  async function login(username: string, password: string) {
    const data = await api.login(username, password)
    if (data?.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      })
      localStorage.setItem('sb_token', data.session.access_token)
    }
    await loadProfile()
    return profile.value
  }

  async function register(username: string, password: string, invite_code?: string) {
    const data = await api.register(username, password, invite_code)
    if (data?.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      })
      localStorage.setItem('sb_token', data.session.access_token)
    }
    await loadProfile()
    return profile.value
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('sb_token')
    profile.value = null
  }

  async function changeInviteCode(code: string) {
    await api.changeInviteCode(code)
    await loadProfile()
  }

  return { profile, loading, init, login, register, logout, loadProfile, changeInviteCode }
})
