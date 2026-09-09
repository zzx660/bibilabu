<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Cell, Button, Field, NavBar, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { currentProfile, supabase } from '@/api/supabase'

const router = useRouter()
const store = useChatStore()
const view = ref<'list' | 'chat'>('list')
const input = ref('')
const list = ref<HTMLElement>()
const profile = ref<Awaited<ReturnType<typeof currentProfile>>>(null)

// 建群
const showCreate = ref(false)
const groupTitle = ref('')
const memberEmail = ref('')

onMounted(async () => {
  profile.value = await currentProfile()
  if (!profile.value) return
  await store.init()
})

onUnmounted(() => store.leaveRoom())

async function enterRoom(roomId: string) {
  view.value = 'chat'
  await store.openRoom(roomId)
  await scrollBottom()
}

async function back() {
  store.leaveRoom()
  view.value = 'list'
}

async function send() {
  const t = input.value.trim()
  if (!t) return
  input.value = ''
  await store.send(t)
  await scrollBottom()
}

async function scrollBottom() {
  await nextTick()
  const el = list.value
  if (el) el.scrollTop = el.scrollHeight
}

async function createGroup() {
  if (!groupTitle.value || !memberEmail.value) {
    showToast('请填写群名和成员邮箱')
    return
  }
  // 按邮箱查用户
  const { data: member } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', memberEmail.value)
    .single()
  if (!member) {
    showToast('未找到该用户')
    return
  }
  const roomId = await store.createGroup(groupTitle.value, [member.id])
  if (roomId) {
    showCreate.value = false
    groupTitle.value = ''
    memberEmail.value = ''
    showToast('群已创建')
    await enterRoom(roomId)
  }
}
</script>

<template>
  <div class="page chat-page">
    <template v-if="!profile">
      <div class="empty">
        <p class="muted">登录后可与弟兄姊妹交通</p>
        <Button type="primary" size="small" @click="router.push('/login')">去登录</Button>
      </div>
    </template>

    <template v-else-if="view === 'list'">
      <div class="bar">
        <h2 class="title">团契</h2>
        <Button plain size="small" @click="showCreate = true">新建群聊</Button>
      </div>
      <Cell
        v-for="r in store.rooms"
        :key="r.id"
        :title="r.title || (r.type === 'dm' ? '私信' : '群聊')"
        is-link
        @click="enterRoom(r.id)"
      />
      <div v-if="!store.rooms.length" class="empty">
        <p class="muted">还没有聊天,新建一个吧</p>
      </div>
    </template>

    <template v-else>
      <NavBar title="聊天" left-text="返回" @click-left="back" />
      <div ref="list" class="msgs">
        <div v-for="m in store.messages" :key="m.id" :class="['msg', m.mine ? 'mine' : 'other']">
          <div class="bubble">{{ m.text }}</div>
        </div>
      </div>
      <div class="input-bar">
        <Field v-model="input" placeholder="说点什么…" @keyup.enter="send" />
        <Button type="primary" size="small" @click="send">发送</Button>
      </div>
    </template>

    <!-- 建群弹层 -->
    <div v-if="showCreate" class="sheet" @click.self="showCreate = false">
      <div class="sheet-inner">
        <h3>新建群聊</h3>
        <Field v-model="groupTitle" label="群名" placeholder="如:周间查经" />
        <Field v-model="memberEmail" label="成员邮箱" placeholder="对方的注册邮箱" />
        <div class="sheet-btns">
          <Button plain @click="showCreate = false">取消</Button>
          <Button type="primary" @click="createGroup">创建</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page { display: flex; flex-direction: column; min-height: 100vh; }
.bar { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; }
.title { font-size: 18px; margin: 0; }
.empty { padding: 40px 16px; text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.msgs { flex: 1; overflow-y: auto; padding: 12px; }
.msg { margin-bottom: 10px; }
.msg.mine { text-align: right; }
.bubble {
  display: inline-block; max-width: 78%; padding: 8px 12px;
  border-radius: 10px; line-height: 1.5; word-break: break-word; white-space: pre-wrap;
}
.msg.mine .bubble { background: var(--grape); color: #fff; }
.msg.other .bubble { background: var(--paper); border: 1px solid var(--line); }
.input-bar { display: flex; gap: 6px; padding: 8px 12px; align-items: center; background: var(--paper); border-top: 1px solid var(--line); }
.input-bar :deep(.van-field) { flex: 1; }
.sheet { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; z-index: 100; }
.sheet-inner { width: 100%; background: var(--paper); border-radius: 12px 12px 0 0; padding: 16px; }
.sheet-inner h3 { margin: 0 0 12px; }
.sheet-btns { display: flex; gap: 8px; margin-top: 12px; }
.sheet-btns button { flex: 1; }
</style>
