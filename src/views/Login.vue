<script setup lang="ts">
import { ref } from 'vue'
import { Field, Button, showToast } from 'vant'
import { useRouter } from 'vue-router'
import { supabase } from '@/api/supabase'

const email = ref('')
const password = ref('')
const mode = ref<'login' | 'signup'>('login')
const router = useRouter()

async function submit() {
  if (!email.value || !password.value) {
    showToast('请输入邮箱和密码')
    return
  }
  if (mode.value === 'login') {
    const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
    if (error) { showToast(error.message); return }
  } else {
    const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
    if (error) { showToast(error.message); return }
    showToast('注册成功,请查收邮件确认')
  }
  router.replace('/me')
}
</script>

<template>
  <div class="page pinch">
    <div class="pad">
      <h2 class="title">{{ mode === 'login' ? '登录' : '注册' }}</h2>
      <Field v-model="email" label="邮箱" placeholder="email@example.com" />
      <Field v-model="password" type="password" label="密码" />
      <div class="btns">
        <Button type="primary" @click="submit">{{ mode === 'login' ? '登录' : '注册' }}</Button>
        <Button plain @click="mode = mode === 'login' ? 'signup' : 'login'">
          切换到{{ mode === 'login' ? '注册' : '登录' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pad { padding: 24px 16px; }
.title { font-size: 20px; margin: 0 0 16px; }
.btns { margin-top: 16px; display: flex; flex-direction: column; gap: 8px; }
</style>
