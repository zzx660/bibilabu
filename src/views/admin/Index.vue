<script setup lang="ts">
import { Cell } from 'vant'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { currentProfile } from '@/api/supabase'

const router = useRouter()
const allowed = ref<boolean | null>(null)

onMounted(async () => {
  const p = await currentProfile()
  allowed.value = p?.role === 'admin'
})
</script>

<template>
  <div class="page pinch">
    <div class="pad">
      <h2 class="title">管理后台</h2>
    </div>
    <template v-if="allowed">
      <Cell title="圣经文本" is-link @click="router.push('/admin/bible')" />
      <Cell title="人物字典" is-link @click="router.push('/admin/persons')" />
      <Cell title="知识库上传" is-link @click="router.push('/admin/kb')" />
      <Cell title="用户管理" is-link @click="router.push('/admin/users')" />
      <Cell title="反馈处理" is-link @click="router.push('/admin/feedback')" />
    </template>
    <div v-else-if="allowed === false" class="pad center muted">无权限</div>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 20px; margin: 0; }
</style>
