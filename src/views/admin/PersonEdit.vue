<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Field, Button, Cell, showToast } from 'vant'
import { supabase } from '@/api/supabase'

const keyword = ref('')
const list = ref<any[]>([])
const editing = ref<any | null>(null)
const draft = ref<{ name_zh: string; summary: string; biography: string }>({ name_zh: '', summary: '', biography: '' })

onMounted(async () => {
  await search()
})

async function search() {
  let q = supabase.from('persons').select('id,name_zh,name_en,summary')
  if (keyword.value) q = q.ilike('name_zh', `%${keyword.value}%`)
  const { data } = await q.limit(20)
  list.value = data || []
}

function startEdit(p: any) {
  editing.value = p
  draft.value = { name_zh: p.name_zh, summary: p.summary || '', biography: p.biography || '' }
}

async function save() {
  if (!editing.value) return
  const { error } = await supabase.from('persons').update({
    name_zh: draft.value.name_zh,
    summary: draft.value.summary,
    biography: draft.value.biography
  }).eq('id', editing.value.id)
  if (error) { showToast(error.message); return }
  const { data: { user } } = await supabase.auth.getUser()
  if (user) await supabase.from('admin_audit_log').insert({ admin_id: user.id, action: 'edit_person', target: `person:${editing.value.id}` })
  showToast('已保存')
  editing.value = null
  await search()
}

function cancel() { editing.value = null }
</script>

<template>
  <div class="page pinch">
    <div class="pad"><h2 class="title">人物字典编辑</h2></div>
    <Field v-model="keyword" placeholder="搜索人物名" @keyup.enter="search" />
    <Button type="primary" size="small" @click="search">搜索</Button>

    <template v-if="editing">
      <div class="edit-form pad">
        <Field v-model="draft.name_zh" label="中文名" />
        <Field v-model="draft.summary" type="textarea" label="简介" rows="2" />
        <Field v-model="draft.biography" type="textarea" label="生平" rows="5" />
        <div class="btns">
          <Button plain @click="cancel">取消</Button>
          <Button type="primary" @click="save">保存</Button>
        </div>
      </div>
    </template>
    <template v-else>
      <Cell v-for="p in list" :key="p.id" :title="p.name_zh" :label="p.summary" is-link @click="startEdit(p)" />
    </template>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 18px; }
.edit-form .btns { display: flex; gap: 8px; margin-top: 10px; }
.edit-form .btns button { flex: 1; }
</style>
