<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NavBar, showToast, showConfirmDialog } from 'vant'
import { api } from '@/api/hono'

const router = useRouter()
const items = ref<any[]>([])
const editing = ref<number | null>(null)
const noteText = ref('')

async function load() {
  const { items: list } = await api.listBookmarks()
  items.value = list
}

onMounted(load)

async function saveNote(id: number) {
  try {
    await api.updateBookmark(id, { note: noteText.value })
    showToast('已保存')
    editing.value = null
    await load()
  } catch (e: any) {
    showToast(e.message || '保存失败')
  }
}

function startEdit(bm: any) {
  editing.value = bm.id
  noteText.value = bm.note || ''
}

async function remove(id: number) {
  try {
    await showConfirmDialog({ title: '删除书签', message: '确认删除?' })
  } catch {
    return
  }
  await api.removeBookmark(id)
  showToast('已删除')
  await load()
}

function goto(bm: any) {
  router.push(`/read/${bm.book_code}/${bm.chapter}`)
}
</script>

<template>
  <div class="page">
    <NavBar title="我的书签" left-arrow @click-left="router.back()" />
    <div v-if="!items.length" class="center muted py-20">暂无书签,去读经页添加吧</div>
    <div v-else class="list">
      <div v-for="bm in items" :key="bm.id" class="card">
        <div class="head">
          <span class="ref" @click="goto(bm)">{{ bm.book_name_zh }} {{ bm.chapter }}:{{ bm.verse_start }}</span>
          <div class="ops">
            <button class="link" @click="startEdit(bm)">备注</button>
            <button class="link danger" @click="remove(bm.id)">删除</button>
          </div>
        </div>
        <div v-if="editing === bm.id" class="edit">
          <textarea v-model="noteText" rows="2" placeholder="备注..." />
          <div class="edit-ops">
            <button class="btn primary" @click="saveNote(bm.id)">保存</button>
            <button class="btn" @click="editing = null">取消</button>
          </div>
        </div>
        <div v-else-if="bm.note" class="note">{{ bm.note }}</div>
        <div class="meta muted">{{ new Date(bm.created_at).toLocaleDateString() }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list { max-width: 720px; margin: 0 auto; padding: 12px; }
.card { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 14px; margin-bottom: 12px; }
.head { display: flex; justify-content: space-between; align-items: center; }
.ref { color: var(--grape); font-weight: 600; cursor: pointer; }
.ops { display: flex; gap: 10px; }
.link { background: none; border: none; color: var(--grape); font-size: 13px; cursor: pointer; }
.link.danger { color: #e74c3c; }
.note { margin-top: 8px; font-size: 14px; color: var(--ink); }
.meta { margin-top: 6px; font-size: 12px; }
.edit { margin-top: 10px; }
textarea { width: 100%; padding: 8px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); color: var(--ink); font-size: 14px; box-sizing: border-box; }
.edit-ops { display: flex; gap: 8px; margin-top: 8px; justify-content: flex-end; }
.btn { padding: 6px 14px; border: 1px solid var(--line); background: var(--paper); border-radius: 6px; color: var(--ink); font-size: 13px; cursor: pointer; }
.btn.primary { background: var(--scroll); color: #fff; border-color: var(--scroll); }
</style>
