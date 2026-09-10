<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar, Button, Field, showToast, showConfirmDialog, Popup, Tabs, Tab } from 'vant'
import { useChatStore } from '@/stores/chat'
import { currentProfile } from '@/api/supabase'
import { api } from '@/api/hono'

const router = useRouter()
const store = useChatStore()
const tab = ref('messages')
const profile = ref<any>(null)

// 聊天视图
const view = ref<'list' | 'chat'>('list')
const input = ref('')
const list = ref<HTMLElement>()
const activeTitle = ref('')

// 好友
const friends = ref<any[]>([])
const requests = ref<any[]>([])
const friendCode = ref('')
const showAddFriend = ref(false)

// 群组
const groups = ref<any[]>([])
const showCreate = ref(false)
const groupTitle = ref('')
const groupMemberIds = ref<string[]>([])

// 代祷
const myPrayers = ref<any[]>([])
const friendsPrayers = ref<any[]>([])
const showPrayer = ref(false)
const prayerName = ref('')
const prayerContent = ref('')
const prayerVisibility = ref('friends')

onMounted(async () => {
  profile.value = await currentProfile()
  if (!profile.value) return
  await store.init()
  await loadAll()
})

onUnmounted(() => store.leaveRoom())

async function loadAll() {
  const { friends: f, requests: r } = await api.listFriends()
  friends.value = f
  requests.value = r
  // 群组
  groups.value = store.rooms.filter((r: any) => r.type === 'group')
  // 代祷
  try {
    const { items: m } = await api.myPrayers()
    myPrayers.value = m
  } catch {}
  try {
    const { items: fp } = await api.friendsPrayers()
    friendsPrayers.value = fp
  } catch {}
}

async function enterRoom(roomId: string, title?: string | null) {
  const r = store.rooms.find((x: any) => x.id === roomId)
  if (r?.type === 'group') {
    router.push(`/group/${roomId}`)
    return
  }
  view.value = 'chat'
  activeTitle.value = title || '私信'
  await store.openRoom(roomId)
  await scrollBottom()
}

function back() {
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

// 好友
async function addFriend() {
  if (!friendCode.value.trim()) return
  try {
    await api.requestFriend(friendCode.value.trim())
    showToast('好友申请已发送')
    showAddFriend.value = false
    friendCode.value = ''
  } catch (e: any) {
    showToast(e.message || '失败')
  }
}

async function acceptFriend(uid: string) {
  await api.acceptFriend(uid)
  showToast('已同意')
  await loadAll()
}

async function removeFriend(id: string) {
  try {
    await showConfirmDialog({ title: '解除好友', message: '确认?' })
  } catch { return }
  await api.removeFriend(id)
  await loadAll()
}

// 群组
async function createGroup() {
  if (!groupTitle.value.trim()) { showToast('请输入群名'); return }
  if (!groupMemberIds.value.length) { showToast('请选择成员'); return }
  const roomId = await store.createGroup(groupTitle.value, groupMemberIds.value)
  if (roomId) {
    showCreate.value = false
    groupTitle.value = ''
    groupMemberIds.value = []
    showToast('群已创建')
    router.push(`/group/${roomId}`)
  }
}

// 代祷
async function submitPrayer() {
  if (!prayerName.value.trim() || !prayerContent.value.trim()) { showToast('请填写完整'); return }
  await api.createPrayer(prayerName.value, prayerContent.value, prayerVisibility.value)
  showPrayer.value = false
  prayerName.value = ''
  prayerContent.value = ''
  showToast('代祷已发布')
  await loadAll()
}

async function removePrayer(id: number) {
  try {
    await showConfirmDialog({ title: '删除代祷', message: '确认?' })
  } catch { return }
  await api.removePrayer(id)
  await loadAll()
}

async function checkinPrayer(id: number) {
  try {
    await api.checkinPrayer(id)
    showToast('已打卡')
  } catch (e: any) {
    showToast(e.message || '失败')
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

    <template v-else-if="view === 'chat'">
      <NavBar :title="activeTitle" left-text="返回" @click-left="back" />
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

    <template v-else>
      <NavBar title="团契" />
      <Tabs v-model="tab" shrink>
        <Tab title="消息" name="messages">
          <div v-for="r in store.rooms" :key="r.id" class="room-item" @click="enterRoom(r.id, r.title)">
            <span class="room-title">{{ r.title || (r.type === 'dm' ? '私信' : '群聊') }}</span>
            <span class="arrow">›</span>
          </div>
          <div v-if="!store.rooms.length" class="empty muted">还没有会话</div>
        </Tab>

        <Tab :title="`好友${requests.length ? `(${requests.length})` : ''}`" name="friends">
          <div class="action-bar">
            <Button size="small" type="primary" plain @click="showAddFriend = true">添加好友</Button>
          </div>
          <div v-for="f in friends" :key="f.user_id" class="friend-item">
            <div class="friend-info" @click="router.push(`/friend/${f.user_id}`)">
              <div class="avatar">{{ (f.nickname || f.username || '?').slice(0, 1) }}</div>
              <div>
                <div class="fname">{{ f.remark || f.nickname || f.username }}</div>
                <div class="muted text-sm">{{ f.username }}</div>
              </div>
            </div>
            <Button size="mini" plain @click="removeFriend(f.id)">解除</Button>
          </div>
          <div v-if="!friends.length" class="empty muted">还没有好友</div>
        </Tab>

        <Tab title="群组" name="groups">
          <div class="action-bar">
            <Button size="small" type="primary" plain @click="showCreate = true">新建群聊</Button>
          </div>
          <div v-for="g in groups" :key="g.id" class="room-item" @click="router.push(`/group/${g.id}`)">
            <span class="room-title">{{ g.title }}</span>
            <span class="arrow">›</span>
          </div>
          <div v-if="!groups.length" class="empty muted">还没有群组</div>
        </Tab>

        <Tab title="代祷" name="prayers">
          <div class="action-bar">
            <Button size="small" type="primary" @click="showPrayer = true">发布代祷</Button>
          </div>
          <h4 class="sub">我的代祷</h4>
          <div v-for="p in myPrayers" :key="p.id" class="prayer-item">
            <div class="p-name">{{ p.name }}</div>
            <div class="p-content">{{ p.content }}</div>
            <div class="p-meta">
              <span class="muted">{{ new Date(p.created_at).toLocaleDateString() }} · {{ p.visibility === 'public' ? '公开' : '好友' }}</span>
              <Button size="mini" plain @click="removePrayer(p.id)">删除</Button>
            </div>
          </div>
          <h4 class="sub">好友代祷</h4>
          <div v-for="p in friendsPrayers" :key="p.id" class="prayer-item">
            <div class="p-name">{{ p.name }} <span class="muted text-sm">— {{ p.username }}</span></div>
            <div class="p-content">{{ p.content }}</div>
            <div class="p-meta">
              <span class="muted">{{ new Date(p.created_at).toLocaleDateString() }}</span>
              <Button size="mini" type="primary" plain @click="checkinPrayer(p.id)">为TA祷告</Button>
            </div>
          </div>
          <div v-if="!myPrayers.length && !friendsPrayers.length" class="empty muted">暂无代祷</div>
        </Tab>

        <Tab :title="`申请${requests.length ? `(${requests.length})` : ''}`" name="requests">
          <div v-for="r in requests" :key="r.id" class="req-item">
            <div class="friend-info">
              <div class="avatar">{{ (r.from_username || '?').slice(0, 1) }}</div>
              <div>
                <div class="fname">{{ r.from_username }}</div>
                <div v-if="r.message" class="muted text-sm">{{ r.message }}</div>
              </div>
            </div>
            <Button size="mini" type="primary" @click="acceptFriend(r.from_id)">同意</Button>
          </div>
          <div v-if="!requests.length" class="empty muted">暂无好友申请</div>
        </Tab>
      </Tabs>
    </template>

    <!-- 添加好友 -->
    <Popup v-model:show="showAddFriend" position="bottom" round>
      <div class="sheet-inner">
        <h3>添加好友</h3>
        <Field v-model="friendCode" label="好友邀请码" placeholder="输入对方的邀请码" />
        <div class="sheet-btns">
          <Button plain @click="showAddFriend = false">取消</Button>
          <Button type="primary" @click="addFriend">发送申请</Button>
        </div>
      </div>
    </Popup>

    <!-- 建群 -->
    <Popup v-model:show="showCreate" position="bottom" round>
      <div class="sheet-inner">
        <h3>新建群聊</h3>
        <Field v-model="groupTitle" label="群名" placeholder="如:周间查经" />
        <div class="member-pick">
          <div class="muted text-sm" style="margin-bottom: 8px;">选择成员</div>
          <label v-for="f in friends" :key="f.user_id" class="check-row">
            <input type="checkbox" :value="f.user_id" v-model="groupMemberIds" />
            {{ f.nickname || f.username }}
          </label>
        </div>
        <div class="sheet-btns">
          <Button plain @click="showCreate = false">取消</Button>
          <Button type="primary" @click="createGroup">创建</Button>
        </div>
      </div>
    </Popup>

    <!-- 代祷 -->
    <Popup v-model:show="showPrayer" position="bottom" round>
      <div class="sheet-inner">
        <h3>发布代祷</h3>
        <Field v-model="prayerName" label="标题" placeholder="如:为工作祷告" />
        <Field v-model="prayerContent" label="内容" type="textarea" rows="3" placeholder="具体代祷事项" />
        <div class="vis-row">
          <span>可见范围</span>
          <label><input type="radio" value="friends" v-model="prayerVisibility" /> 仅好友</label>
          <label><input type="radio" value="public" v-model="prayerVisibility" /> 公开</label>
        </div>
        <div class="sheet-btns">
          <Button plain @click="showPrayer = false">取消</Button>
          <Button type="primary" @click="submitPrayer">发布</Button>
        </div>
      </div>
    </Popup>
  </div>
</template>

<style scoped>
.chat-page { display: flex; flex-direction: column; min-height: 100vh; }
.empty { padding: 40px 16px; text-align: center; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.msgs { flex: 1; overflow-y: auto; padding: 12px; }
.msg { margin-bottom: 10px; }
.msg.mine { text-align: right; }
.bubble { display: inline-block; max-width: 78%; padding: 8px 12px; border-radius: 10px; line-height: 1.5; word-break: break-word; white-space: pre-wrap; }
.msg.mine .bubble { background: var(--grape); color: #fff; }
.msg.other .bubble { background: var(--paper); border: 1px solid var(--line); }
.input-bar { display: flex; gap: 6px; padding: 8px 12px; align-items: center; background: var(--paper); border-top: 1px solid var(--line); }
.input-bar :deep(.van-field) { flex: 1; }
.action-bar { padding: 12px 16px; border-bottom: 1px solid var(--line); }
.room-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--line); cursor: pointer; }
.room-title { font-size: 15px; }
.arrow { color: var(--muted); font-size: 20px; }
.friend-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.friend-info { display: flex; gap: 12px; align-items: center; flex: 1; cursor: pointer; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--grape); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.fname { font-weight: 600; font-size: 15px; }
.sub { padding: 12px 16px 4px; color: var(--muted); font-size: 13px; }
.prayer-item { padding: 12px 16px; border-bottom: 1px solid var(--line); }
.p-name { font-weight: 600; margin-bottom: 4px; }
.p-content { font-size: 14px; margin-bottom: 6px; }
.p-meta { display: flex; justify-content: space-between; align-items: center; }
.req-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--line); }
.sheet-inner { padding: 16px; }
.sheet-inner h3 { margin: 0 0 12px; }
.sheet-btns { display: flex; gap: 8px; margin-top: 12px; }
.sheet-btns button { flex: 1; }
.check-row { display: block; padding: 8px 0; }
.vis-row { display: flex; gap: 16px; padding: 8px 0; align-items: center; }
.member-pick { max-height: 200px; overflow-y: auto; }
</style>
