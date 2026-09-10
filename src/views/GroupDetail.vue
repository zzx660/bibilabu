<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NavBar, showToast, showConfirmDialog, Popup } from 'vant'
import { api } from '@/api/hono'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const chatStore = useChatStore()
const authStore = useAuthStore()

const group = ref<any>(null)
const members = ref<any[]>([])
const msg = ref('')
const showMembers = ref(false)
const showInvite = ref(false)
const friends = ref<any[]>([])
const selected = ref<string[]>([])
const newAnnouncement = ref('')
const showAnnounce = ref(false)

async function load() {
  const { group: g, members: m } = await api.groupMembers(id)
  group.value = g
  members.value = m
}

onMounted(async () => {
  await chatStore.init()
  await load()
  await chatStore.openRoom(id)
})

onBeforeUnmount(() => {
  chatStore.leaveRoom()
})

const isOwner = computed(() => group.value?.owner_id === authStore.profile?.id)

function send() {
  if (!msg.value.trim()) return
  chatStore.send(msg.value)
  msg.value = ''
}

function memberName(uid: string) {
  const m = members.value.find((x: any) => x.user_id === uid)
  return m?.nickname || m?.username || '成员'
}

async function saveAnnouncement() {
  try {
    await api.setAnnouncement(id, newAnnouncement.value)
    showToast('已保存')
    showAnnounce.value = false
    await load()
  } catch (e: any) {
    showToast(e.message || '失败')
  }
}

async function loadFriends() {
  const { friends: f } = await api.listFriends()
  friends.value = f
  selected.value = []
  showInvite.value = true
}

async function invite() {
  if (!selected.value.length) return
  try {
    await api.inviteToGroup(id, selected.value)
    showToast('已邀请')
    showInvite.value = false
    await load()
  } catch (e: any) {
    showToast(e.message || '失败')
  }
}

async function setRole(uid: string, role: string) {
  await api.setMemberRole(id, uid, role)
  await load()
}

async function kick(uid: string) {
  try {
    await showConfirmDialog({ title: '移除成员', message: '确认移除?' })
  } catch { return }
  await api.kickMember(id, uid)
  showToast('已移除')
  await load()
}

async function leave() {
  try {
    await showConfirmDialog({ title: '退出群组', message: '确认退出?' })
  } catch { return }
  await api.leaveGroup(id)
  showToast('已退出')
  router.push('/chat')
}
</script>

<template>
  <div class="page">
    <NavBar :title="group?.title || '群聊'" left-arrow @click-left="router.back()">
      <template #right>
        <span @click="showMembers = true" class="nav-right">成员</span>
      </template>
    </NavBar>

    <div v-if="group?.announcement" class="announcement">{{ group.announcement }}</div>

    <div class="messages">
      <div v-for="m in chatStore.messages" :key="m.id" class="msg" :class="{ mine: m.mine }">
        <div class="name">{{ memberName(m.sender_id) }}</div>
        <div class="bubble">{{ m.text }}</div>
      </div>
    </div>

    <div class="input-bar">
      <input v-model="msg" @keydown.enter="send" placeholder="输入消息..." />
      <button @click="send">发送</button>
    </div>

    <Popup v-model:show="showMembers" position="right" :style="{ width: '80%' }">
      <div class="sheet">
        <div class="sheet-head">
          <h3>群成员 ({{ members.length }})</h3>
          <div v-if="isOwner" class="ops">
            <button class="link" @click="loadFriends">邀请</button>
            <button class="link danger" @click="showAnnounce = true">公告</button>
          </div>
        </div>
        <div v-for="m in members" :key="m.user_id" class="member">
          <span>{{ m.nickname || m.username }} <em v-if="m.role === 'owner'">群主</em><em v-else-if="m.role === 'admin'">管理</em></span>
          <div v-if="isOwner && m.role !== 'owner'" class="member-ops">
            <button v-if="m.role !== 'admin'" class="link" @click="setRole(m.user_id, 'admin')">设管理</button>
            <button v-else class="link" @click="setRole(m.user_id, 'member')">取消管理</button>
            <button class="link danger" @click="kick(m.user_id)">移除</button>
          </div>
        </div>
        <div v-if="!isOwner" class="leave"><button class="btn danger" @click="leave">退出群组</button></div>
      </div>
    </Popup>

    <Popup v-model:show="showInvite" position="bottom" round>
      <div class="sheet">
        <h3>邀请好友入群</h3>
        <div v-for="f in friends" :key="f.user_id" class="check-row">
          <label>
            <input type="checkbox" :value="f.user_id" v-model="selected" />
            {{ f.nickname || f.username }}
          </label>
        </div>
        <button class="btn primary full" @click="invite">邀请</button>
      </div>
    </Popup>

    <Popup v-model:show="showAnnounce" position="bottom" round>
      <div class="sheet">
        <h3>编辑公告</h3>
        <textarea v-model="newAnnouncement" rows="3" placeholder="群公告..." />
        <button class="btn primary full" @click="saveAnnouncement">保存</button>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
.nav-right { color: var(--grape); font-size: 14px; }
.announcement { background: #fff7e6; padding: 10px 16px; font-size: 13px; color: #ad6800; border-bottom: 1px solid #ffe7ba; }
.messages { max-width: 720px; margin: 0 auto; padding: 12px; min-height: 60vh; }
.msg { margin-bottom: 12px; }
.msg.mine { text-align: right; }
.name { font-size: 12px; color: var(--muted); margin-bottom: 2px; }
.bubble { display: inline-block; background: var(--paper); padding: 8px 12px; border-radius: 12px; font-size: 15px; }
.msg.mine .bubble { background: var(--grape); color: #fff; }
.input-bar { position: fixed; bottom: 0; left: 0; right: 0; display: flex; padding: 8px; background: var(--bg); border-top: 1px solid var(--line); gap: 8px; }
.input-bar input { flex: 1; padding: 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--paper); color: var(--ink); }
.input-bar button { padding: 0 16px; background: var(--grape); color: #fff; border: none; border-radius: 8px; cursor: pointer; }
.sheet { padding: 16px; }
.sheet-head { display: flex; justify-content: space-between; align-items: center; }
.ops { display: flex; gap: 12px; }
.member { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); }
.member em { font-style: normal; font-size: 11px; color: var(--grape); margin-left: 6px; }
.member-ops { display: flex; gap: 10px; }
.link { background: none; border: none; color: var(--grape); font-size: 13px; cursor: pointer; }
.link.danger { color: #e74c3c; }
.leave { margin-top: 16px; }
.btn { padding: 8px 16px; border: 1px solid var(--line); background: var(--paper); border-radius: 8px; color: var(--ink); cursor: pointer; }
.btn.primary { background: var(--grape); color: #fff; border-color: var(--grape); }
.btn.danger { background: #e74c3c; color: #fff; border-color: #e74c3c; }
.btn.full { width: 100%; margin-top: 12px; }
.check-row { padding: 10px 0; }
textarea { width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 8px; box-sizing: border-box; background: var(--bg); color: var(--ink); }
</style>
