<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cell, Button, Field, Tag, showDialog } from 'vant'
import { supabase } from '@/api/supabase'

type FB = { id: number; user_id: string; category: string; status: string; content: string; admin_reply: string | null }

const list = ref<FB[]>([])
const replyMap = ref<Record<number, string>>({})

const statusLabel: Record<string, string> = { open: '待处理', in_progress: '处理中', resolved: '已回复', closed: '已关闭' }

onMounted(load)

async function load() {
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .order('updated_at', { ascending: false })
  list.value = data || []
}

async function take(id: number) {
  await supabase.from('feedback').update({ status: 'in_progress' }).eq('id', id)
  await load()
}

async function reply(id: number) {
  const text = replyMap.value[id]?.trim()
  if (!text) return
  const { error } = await supabase.from('feedback').update({
    admin_reply: text, status: 'resolved'
  }).eq('id', id)
  if (error) return
  replyMap.value[id] = ''
  await load()
}
</script>

<template>
  <div class="page pinch">
    <div class="pad"><h2 class="title">反馈处理</h2></div>
    <Cell v-for="f in list" :key="f.id" :title="f.category" :label="f.content">
      <template #value>
        <Tag plain>{{ statusLabel[f.status] }}</Tag>
      </template>
      <template #extra>
        <div v-if="f.status === 'open'">
          <Button plain size="mini" @click="take(f.id)">接单</Button>
        </div>
        <div v-else-if="f.status !== 'closed'" class="reply-box">
          <Field v-model="replyMap[f.id]" placeholder="回复内容…" rows="2" />
          <Button type="primary" size="mini" @click="reply(f.id)">回复并解决</Button>
        </div>
        <div v-if="f.admin_reply" class="reply">已回复:{{ f.admin_reply }}</div>
      </template>
    </Cell>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 18px; }
.reply-box { margin-top: 6px; }
.reply { font-size: 13px; color: var(--muted); margin-top: 4px; }
</style>
