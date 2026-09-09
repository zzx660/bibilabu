<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Field, Button, Cell, Tag, showToast } from 'vant'
import { supabase, currentProfile } from '@/api/supabase'

type FB = { id: number; category: string; status: string; content: string; admin_reply: string | null; updated_at: string }

const profile = ref<Awaited<ReturnType<typeof currentProfile>>>(null)
const list = ref<FB[]>([])
const category = ref('')
const content = ref('')
const submitting = ref(false)

const statusLabel: Record<string, string> = {
  open: '待处理', in_progress: '处理中', resolved: '已回复', closed: '已关闭'
}
const statusType: Record<string, string> = {
  open: 'warning', in_progress: 'primary', resolved: 'success', closed: 'default'
}

onMounted(async () => {
  profile.value = await currentProfile()
  if (profile.value) await load()
})

async function load() {
  if (!profile.value) return
  const { data } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', profile.value.id)
    .order('updated_at', { ascending: false })
  list.value = data || []
}

async function submit() {
  if (!profile.value) { showToast('请先登录'); return }
  if (!category.value || !content.value) { showToast('请填写分类和内容'); return }
  submitting.value = true
  try {
    const { error } = await supabase.from('feedback').insert({
      user_id: profile.value.id,
      category: category.value,
      content: content.value
    })
    if (error) { showToast(error.message); return }
    category.value = ''
    content.value = ''
    showToast('已提交,感谢反馈')
    await load()
  } finally {
    submitting.value = false
  }
}

async function confirmClose(id: number) {
  const { error } = await supabase.from('feedback').update({ status: 'closed' }).eq('id', id)
  if (error) { showToast(error.message); return }
  await load()
}

const cats = ['经文错误', '功能建议', '内容补充', '其他']
</script>

<template>
  <div class="page pinch">
    <div class="pad">
      <h2 class="title">反馈</h2>
    </div>
    <div v-if="profile" class="form">
      <div class="cats">
        <Tag v-for="c in cats" :key="c" :plain="category !== c" :type="category === c ? 'primary' : 'default'" @click="category = c">{{ c }}</Tag>
      </div>
      <Field v-model="content" type="textarea" placeholder="描述你的反馈…" rows="3" />
      <Button type="primary" size="small" :loading="submitting" @click="submit">提交</Button>
    </div>
    <div v-else class="pad center muted">请先登录</div>

    <div class="pad"><h3 class="sub">我的反馈</h3></div>
    <Cell v-for="f in list" :key="f.id" :title="f.category" :label="f.content">
      <template #value>
        <Tag :type="(statusType[f.status] as any)" plain>{{ statusLabel[f.status] }}</Tag>
      </template>
      <template v-if="f.admin_reply" #extra>
        <div class="reply">回复:{{ f.admin_reply }}</div>
        <Button v-if="f.status === 'resolved'" plain size="mini" @click="confirmClose(f.id)">确认关闭</Button>
      </template>
    </Cell>
    <div v-if="!list.length && profile" class="center muted py-6">暂无反馈</div>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 20px; margin: 0; }
.sub { font-size: 16px; margin: 0; }
.form { padding: 0 16px; }
.cats { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.form button { margin-top: 10px; }
.reply { font-size: 13px; color: var(--muted); margin-top: 4px; }
</style>
