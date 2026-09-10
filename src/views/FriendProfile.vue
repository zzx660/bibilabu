<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NavBar, showToast, showConfirmDialog } from 'vant'
import { api } from '@/api/hono'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const profile = ref<any>(null)
const prayers = ref<any[]>([])
const editingRemark = ref(false)
const remarkText = ref('')

async function load() {
  const { profile: p } = await api.friendProfile(id)
  profile.value = p
  // 好友的公开代祷
  try {
    const { items } = await api.friendsPrayers()
    prayers.value = items.filter((x: any) => x.user_id === id)
  } catch {}
}

onMounted(load)

function startEdit() {
  remarkText.value = profile.value?.remark || ''
  editingRemark.value = true
}

async function saveRemark() {
  await api.setFriendRemark(id, remarkText.value)
  showToast('已保存')
  editingRemark.value = false
  await load()
}

async function removeFriend() {
  try {
    await showConfirmDialog({ title: '解除好友', message: '确认解除好友关系?' })
  } catch { return }
  await api.removeFriend(id)
  showToast('已解除')
  router.push('/chat')
}

async function checkin(pid: number) {
  try {
    await api.checkinPrayer(pid)
    showToast('已打卡')
  } catch (e: any) {
    showToast(e.message || '失败')
  }
}
</script>

<template>
  <div class="page">
    <NavBar title="好友资料" left-arrow @click-left="router.back()" />
    <div v-if="profile" class="container">
      <div class="header">
        <div class="avatar">{{ (profile.nickname || profile.username || '?').slice(0, 1) }}</div>
        <div class="info">
          <div class="name">{{ profile.nickname || profile.username }}</div>
          <div v-if="profile.title" class="title">{{ profile.title }}</div>
          <div class="code">邀请码: {{ profile.friend_code }}</div>
        </div>
      </div>

      <div class="section">
        <div class="row">
          <span>备注</span>
          <span v-if="!editingRemark" class="value">
            {{ profile.remark || '未设置' }}
            <button class="link" @click="startEdit">编辑</button>
          </span>
          <div v-else class="edit">
            <input v-model="remarkText" placeholder="备注名" />
            <button class="btn primary" @click="saveRemark">保存</button>
          </div>
        </div>
        <div class="row">
          <span>读经进度</span>
          <span class="value">{{ profile.last_book || '-' }} {{ profile.last_chapter || '' }}</span>
        </div>
      </div>

      <div class="section">
        <h3>TA 的代祷</h3>
        <div v-if="!prayers.length" class="muted">暂无公开代祷</div>
        <div v-for="p in prayers" :key="p.id" class="prayer">
          <div class="p-name">{{ p.name }}</div>
          <div class="p-content">{{ p.content }}</div>
          <div class="p-meta">
            <span class="muted">{{ new Date(p.created_at).toLocaleDateString() }}</span>
            <button class="btn" @click="checkin(p.id)">为TA祷告</button>
          </div>
        </div>
      </div>

      <button class="btn danger full" @click="removeFriend">解除好友</button>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 16px; }
.header { display: flex; gap: 16px; align-items: center; margin-bottom: 24px; }
.avatar { width: 64px; height: 64px; border-radius: 50%; background: var(--grape); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.name { font-size: 18px; font-weight: 600; }
.title { color: var(--grape); font-size: 13px; margin-top: 2px; }
.code { color: var(--muted); font-size: 12px; margin-top: 4px; }
.section { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); }
.row:last-child { border-bottom: none; }
.value { color: var(--muted); font-size: 14px; }
.link { background: none; border: none; color: var(--grape); font-size: 13px; cursor: pointer; margin-left: 8px; }
.edit { display: flex; gap: 8px; }
.edit input { padding: 6px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--bg); color: var(--ink); }
.btn { padding: 6px 14px; border: 1px solid var(--line); background: var(--paper); border-radius: 6px; color: var(--ink); font-size: 13px; cursor: pointer; }
.btn.primary { background: var(--grape); color: #fff; border-color: var(--grape); }
.btn.danger { background: #e74c3c; color: #fff; border-color: #e74c3c; }
.btn.full { width: 100%; padding: 12px; margin-top: 16px; }
.prayer { padding: 12px 0; border-bottom: 1px solid var(--line); }
.prayer:last-child { border-bottom: none; }
.p-name { font-weight: 600; margin-bottom: 4px; }
.p-content { font-size: 14px; color: var(--ink); margin-bottom: 6px; }
.p-meta { display: flex; justify-content: space-between; align-items: center; }
</style>
