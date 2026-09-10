<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cell, Button, showConfirmDialog, showToast, Popup, Field } from 'vant'
import { useRouter } from 'vue-router'
import { supabase, currentProfile } from '@/api/supabase'
import { wipeKeys, clearRoomKeyCache } from '@/api/crypto'
import { api } from '@/api/hono'
import { useAuthStore } from '@/stores/auth'
import PrivacyNotice from '@/components/PrivacyNotice.vue'

const router = useRouter()
const authStore = useAuthStore()
const profile = ref<any>(null)
const showEdit = ref(false)
const nickname = ref('')
const title = ref('')
const avatarColor = ref('#7c3aed')

const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2']

onMounted(async () => {
  profile.value = await currentProfile()
})

function openEdit() {
  nickname.value = profile.value?.nickname || profile.value?.display_name || ''
  title.value = profile.value?.title || ''
  avatarColor.value = profile.value?.avatar_color || '#7c3aed'
  showEdit.value = true
}

async function saveProfile() {
  try {
    const { profile: p } = await api.updateProfile({
      nickname: nickname.value,
      title: title.value,
      avatar_color: avatarColor.value
    })
    profile.value = { ...profile.value, ...p }
    await authStore.loadProfile()
    showToast('已保存')
    showEdit.value = false
  } catch (e: any) {
    showToast(e.message || '保存失败')
  }
}

async function signOut() {
  await supabase.auth.signOut()
  clearRoomKeyCache()
  profile.value = null
  router.replace('/login')
}

async function deleteAccount() {
  try {
    await showConfirmDialog({
      title: '删除账号',
      message: '此操作不可撤销,你的所有数据(含聊天密钥)将被清除。'
    })
  } catch { return }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  try {
    await api.deleteAccount(session.access_token)
    await wipeKeys()
    clearRoomKeyCache()
    await supabase.auth.signOut()
    showToast('账号已删除')
    router.replace('/login')
  } catch (e: any) {
    showToast(e.message || '删除失败')
  }
}
</script>

<template>
  <div class="page">
    <div v-if="profile" class="hero">
      <div class="avatar" :style="{ background: profile.avatar_color || '#7c3aed' }">
        {{ (profile.nickname || profile.username || '?').slice(0, 1) }}
      </div>
      <div class="info">
        <div class="name">{{ profile.nickname || profile.username }}</div>
        <div v-if="profile.title" class="title">{{ profile.title }}</div>
        <div class="code">邀请码: {{ profile.friend_code }}</div>
      </div>
      <button class="edit-btn" @click="openEdit">编辑</button>
    </div>

    <div v-else class="hero">
      <p class="muted">未登录</p>
      <Button type="primary" size="small" @click="router.push('/login')">登录</Button>
    </div>

    <Cell title="读经进度" :value="profile?.last_book ? `${profile.last_book} ${profile.last_chapter}章` : '暂无'" />
    <Cell title="我的书签" is-link @click="router.push('/bookmarks')" />
    <Cell title="我的反馈" is-link @click="router.push('/feedback')" />
    <Cell v-if="profile?.role === 'admin'" title="管理后台" is-link @click="router.push('/admin')" />
    <Cell title="隐私说明"><template #value><PrivacyNotice /></template></Cell>
    <Cell v-if="profile" title="退出登录" is-link @click="signOut" />
    <Cell v-if="profile" title="删除账号" is-link @click="deleteAccount" />

    <Popup v-model:show="showEdit" position="bottom" round>
      <div class="sheet">
        <h3>编辑资料</h3>
        <Field v-model="nickname" label="昵称" placeholder="你的昵称" />
        <Field v-model="title" label="头衔" placeholder="如:敬拜组" />
        <div class="color-row">
          <span>头像颜色</span>
          <div class="colors">
            <span
              v-for="c in colors"
              :key="c"
              class="color-dot"
              :class="{ active: avatarColor === c }"
              :style="{ background: c }"
              @click="avatarColor = c"
            />
          </div>
        </div>
        <div class="btns">
          <Button plain @click="showEdit = false">取消</Button>
          <Button type="primary" @click="saveProfile">保存</Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
.hero { display: flex; align-items: center; gap: 16px; padding: 24px 16px; background: var(--paper); border-bottom: 1px solid var(--line); position: relative; }
.avatar { width: 64px; height: 64px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
.info { flex: 1; }
.name { font-size: 18px; font-weight: 600; }
.title { color: var(--grape); font-size: 13px; margin-top: 2px; }
.code { color: var(--muted); font-size: 12px; margin-top: 4px; }
.edit-btn { position: absolute; top: 16px; right: 16px; padding: 4px 12px; border: 1px solid var(--line); background: var(--bg); border-radius: 16px; font-size: 13px; color: var(--ink); cursor: pointer; }
.sheet { padding: 16px; }
.sheet h3 { margin: 0 0 12px; }
.color-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
.colors { display: flex; gap: 8px; }
.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; }
.color-dot.active { border-color: var(--ink); }
.btns { display: flex; gap: 8px; margin-top: 12px; }
.btns button { flex: 1; }
</style>
