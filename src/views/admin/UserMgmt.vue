<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cell, Button, Tag, showToast } from 'vant'
import { supabase } from '@/api/supabase'

type U = { id: string; email: string; role: string; display_name: string | null }

const list = ref<U[]>([])

onMounted(load)

async function load() {
  const { data } = await supabase
    .from('profiles')
    .select('id,email,role,display_name')
    .order('created_at', { ascending: false })
  list.value = data || []
}

async function toggleRole(u: U) {
  const next = u.role === 'admin' ? 'user' : 'admin'
  const { error } = await supabase.from('profiles').update({ role: next }).eq('id', u.id)
  if (error) { showToast(error.message); return }
  u.role = next
  await logAudit(u.id, `set_role_${next}`)
}

async function logAudit(target: string, action: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('admin_audit_log').insert({ admin_id: user.id, action, target })
}
</script>

<template>
  <div class="page pinch">
    <div class="pad"><h2 class="title">用户管理</h2></div>
    <Cell v-for="u in list" :key="u.id" :title="u.display_name || u.email" :label="u.email">
      <template #value>
        <Tag :type="u.role === 'admin' ? 'danger' : 'default'" plain>{{ u.role === 'admin' ? '管理员' : '普通' }}</Tag>
      </template>
      <template #extra>
        <Button plain size="mini" @click="toggleRole(u)">
          {{ u.role === 'admin' ? '降为普通' : '提升管理员' }}
        </Button>
      </template>
    </Cell>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.title { font-size: 18px; }
</style>
