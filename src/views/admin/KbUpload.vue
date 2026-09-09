<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Field, Button, Tag, Cell, showToast } from 'vant'
import { supabase } from '@/api/supabase'

const title = ref('')
const content = ref('')
const sourceType = ref<'commentary' | 'devotional' | 'user_upload'>('commentary')
const list = ref<any[]>([])

const sourceLabel: Record<string, string> = { commentary: '注释', devotional: '灵修', user_upload: '上传' }

onMounted(load)

async function load() {
  const { data } = await supabase
    .from('knowledge_base')
    .select('id,title,source_type,content,created_at')
    .order('created_at', { ascending: false })
    .limit(30)
  list.value = data || []
}

async function upload() {
  if (!title.value || !content.value) { showToast('请填写标题和内容'); return }
  const { data: { user } } = await supabase.auth.getUser()
  // 注意:embedding 需后端生成,这里先插入无 embedding 的文本,后续用 kb-loader 补
  const { error } = await supabase.from('knowledge_base').insert({
    source_type: sourceType.value,
    title: title.value,
    content: content.value,
    owner_id: user?.id || null
  })
  if (error) { showToast(error.message); return }
  showToast('已上传(向量需后端补全)')
  title.value = ''
  content.value = ''
  await load()
}

async function remove(id: number) {
  const { error } = await supabase.from('knowledge_base').delete().eq('id', id)
  if (!error) await load()
}
</script>

<template>
  <div class="page pinch">
    <div class="pad"><h2 class="title">知识库上传</h2></div>
    <div class="form pad">
      <div class="cats">
        <Tag v-for="k in (['commentary','devotional','user_upload'] as const)" :key="k"
          :plain="sourceType !== k" :type="sourceType === k ? 'primary' : 'default'"
          @click="sourceType = k">{{ sourceLabel[k] }}</Tag>
      </div>
      <Field v-model="title" label="标题" placeholder="如:创世记注释" />
      <Field v-model="content" type="textarea" label="内容" rows="5" placeholder="粘贴注释/灵修文本" />
      <Button type="primary" size="small" @click="upload">上传</Button>
    </div>
    <div class="pad"><h3 class="sub">最近条目</h3></div>
    <Cell v-for="k in list" :key="k.id" :title="k.title" :label="k.content?.slice(0, 60)">
      <template #value>
        <Tag plain>{{ sourceLabel[k.source_type] || k.source_type }}</Tag>
      </template>
      <template #extra>
        <Button plain size="mini" @click="remove(k.id)">删除</Button>
      </template>
    </Cell>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 18px; }
.sub { font-size: 15px; }
.form { padding-bottom: 8px; }
.cats { display: flex; gap: 6px; margin-bottom: 10px; }
.form button { margin-top: 8px; }
</style>
