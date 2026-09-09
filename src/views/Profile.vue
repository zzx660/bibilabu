<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cell, Button, showConfirmDialog, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { supabase, currentProfile } from '@/api/supabase'
import { wipeKeys, clearRoomKeyCache } from '@/api/crypto'
import { api } from '@/api/hono'
import PrivacyNotice from '@/components/PrivacyNotice.vue'

const router = useRouter()
const profile = ref<Awaited<ReturnType<typeof currentProfile>>>(null)

onMounted(async () => {
  profile.value = await currentProfile()
})

async function signOut() {
  await supabase.auth.signOut()
  clearRoomKeyCache()
  profile.value = null
}

async function deleteAccount() {
  try {
    await showConfirmDialog({
      title: '删除账号',
      message: '此操作不可撤销,你的所有数据(含聊天密钥)将被清除,其他人的历史消息不受影响。'
    })
  } catch {
    return
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  try {
    await api.deleteAccount(session.access_token)
    await wipeKeys()
    clearRoomKeyCache()
    await supabase.auth.signOut()
    profile.value = null
    showToast('账号已删除')
    router.replace('/login')
  } catch (e: any) {
    showToast(e.message || '删除失败')
  }
}
</script>

<template>
  <div class="page pinch">
    <div class="pad">
      <template v-if="profile">
        <p class="name">{{ profile.display_name || profile.email }}</p>
        <p class="muted" v-if="profile.role === 'admin'">管理员</p>
      </template>
      <template v-else>
        <p class="muted">未登录</p>
        <Button type="primary" size="small" @click="router.push('/login')">登录</Button>
      </template>
    </div>
    <Cell title="我的反馈" is-link @click="router.push('/feedback')" />
    <Cell v-if="profile?.role === 'admin'" title="管理后台" is-link @click="router.push('/admin')" />
    <Cell title="隐私说明"><template #value><PrivacyNotice /></template></Cell>
    <Cell v-if="profile" title="退出登录" is-link @click="signOut" />
    <Cell v-if="profile" title="删除账号" is-link @click="deleteAccount" />
  </div>
</template>

<style scoped>
.pad { padding: 24px 16px; }
.name { font-size: 18px; margin: 0; }
</style>
