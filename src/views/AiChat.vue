<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Field, Button, Tag, showToast, showConfirmDialog, NavBar } from 'vant'
import { api } from '@/api/hono'
import { useBibleStore } from '@/stores/bible'

type Chunk = { title: string; source: string; snippet: string }
type Msg = { role: 'user' | 'ai'; text: string; refs?: { verses: string[]; persons: string[] }; chunks?: Chunk[]; fallback?: boolean }

const WELCOME: Msg = { role: 'ai', text: '愿主赐福给你。我是智能问答助手,会先从知识库(注释书、人物字典)检索相关内容,再结合经文回答。可问经文含义、人物事迹、生活指引等。' }

const input = ref('')
const msgs = ref<Msg[]>([WELCOME])
const busy = ref(false)
const list = ref<HTMLElement>()

const store = useBibleStore()
const currentVerse = () => {
  if (!store.currentChapter.length) return ''
  return `${store.activeBook} ${store.activeChapterNum}:1`
}

onMounted(async () => {
  try {
    const { items } = await api.aiHistory()
    if (items.length) {
      const historyMsgs: Msg[] = []
      for (const h of items) {
        historyMsgs.push({ role: 'user', text: h.question })
        historyMsgs.push({ role: 'ai', text: h.answer })
      }
      msgs.value = [WELCOME, ...historyMsgs]
      await scroll()
    }
  } catch {}
})

async function clearHistory() {
  try {
    await showConfirmDialog({ title: '清空对话', message: '确认清空所有AI对话记录?' })
  } catch { return }
  await api.clearAiHistory()
  msgs.value = [WELCOME]
  showToast('已清空')
}

async function send() {
  const q = input.value.trim()
  if (!q || busy.value) return
  msgs.value.push({ role: 'user', text: q })
  input.value = ''
  busy.value = true
  await scroll()
  try {
    // 智能体 RAG(失败自动降级普通问答)
    const { answer, chunks, fallback } = await api.ragAsk(q)
    msgs.value.push({ role: 'ai', text: answer, chunks, fallback })
  } catch (e: any) {
    // RAG 路由不可用,降级到普通问答
    try {
      const ctx = currentVerse()
      const { answer, refs } = await api.askGlm(q, ctx)
      msgs.value.push({ role: 'ai', text: answer, refs })
    } catch {
      msgs.value.push({ role: 'ai', text: '暂时无法回答,稍后再试。' })
    }
  } finally {
    busy.value = false
    await scroll()
  }
}

async function explainCurrent() {
  const ref = currentVerse()
  if (!ref) {
    showToast('请先在读经页打开一章')
    return
  }
  busy.value = true
  msgs.value.push({ role: 'user', text: `解读 ${ref}` })
  await scroll()
  try {
    const { answer } = await api.explainVerse(ref)
    msgs.value.push({ role: 'ai', text: answer })
  } finally {
    busy.value = false
    await scroll()
  }
}

async function scroll() {
  await nextTick()
  const el = list.value
  if (el) el.scrollTop = el.scrollHeight
}

const sourceLabel: Record<string, string> = {
  commentary: '注释',
  devotional: '灵修',
  dictionary: '字典',
  user_upload: '上传'
}

const suggestions = ['什么是爱？', '如何祷告？', '信心是什么？', '彼得是谁？']
function pick(s: string) {
  input.value = s
  send()
}
</script>

<template>
  <div class="page chat-page">
    <NavBar title="智能问答" right-text="清空" @click-right="clearHistory" />
    <div ref="list" class="msgs">
      <div v-for="(m, i) in msgs" :key="i" :class="['msg', m.role]">
        <div class="bubble">{{ m.text }}</div>
        <div v-if="m.fallback" class="note muted">(知识库检索暂不可用,基于经文回答)</div>
        <div v-if="m.refs && (m.refs.verses.length || m.refs.persons.length)" class="refs">
          <Tag v-for="v in m.refs.verses" :key="v" plain size="medium">{{ v }}</Tag>
          <Tag v-for="p in m.refs.persons" :key="p" type="primary" plain size="medium">{{ p }}</Tag>
        </div>
        <div v-if="m.chunks && m.chunks.length" class="chunks">
          <div class="chunks-title muted">引用来源:</div>
          <div v-for="(c, j) in m.chunks" :key="j" class="chunk">
            <Tag plain size="medium">{{ sourceLabel[c.source] || c.source }}</Tag>
            <span class="chunk-title">{{ c.title }}</span>
          </div>
        </div>
      </div>
      <div v-if="busy" class="msg ai"><div class="bubble">检索知识库并思考中…</div></div>
    </div>

    <div class="suggestions">
      <Tag v-for="s in suggestions" :key="s" plain @click="pick(s)">{{ s }}</Tag>
    </div>

    <div class="input-bar">
      <Button v-if="store.currentChapter.length" plain size="small" @click="explainCurrent">解读本章</Button>
      <Field v-model="input" placeholder="提问…" @keyup.enter="send" />
      <Button type="primary" size="small" :loading="busy" @click="send">发送</Button>
    </div>
  </div>
</template>

<style scoped>
.chat-page { display: flex; flex-direction: column; height: 100vh; padding-bottom: 50px; }
.msgs { flex: 1; overflow-y: auto; padding: 12px; }
.msg { margin-bottom: 12px; }
.msg.user { text-align: right; }
.bubble {
  display: inline-block; max-width: 85%; padding: 10px 14px;
  border-radius: 12px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;
}
.msg.user .bubble { background: var(--grape); color: #fff; }
.msg.ai .bubble { background: var(--paper); border: 1px solid var(--line); }
.note { font-size: 11px; margin-top: 4px; }
.refs { margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap; }
.chunks { margin-top: 8px; }
.chunks-title { font-size: 11px; margin-bottom: 4px; }
.chunk { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.chunk-title { font-size: 12px; color: var(--muted); }
.suggestions { padding: 6px 12px; display: flex; gap: 6px; flex-wrap: wrap; }
.input-bar { display: flex; gap: 6px; padding: 8px 12px; align-items: center; background: var(--paper); border-top: 1px solid var(--line); }
.input-bar :deep(.van-field) { flex: 1; padding: 4px 8px; }
</style>
