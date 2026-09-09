<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Field, Button, showToast, Tabs, Tab } from 'vant'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const mode = ref<'login' | 'signup'>('login')
const username = ref('')
const password = ref('')
const inviteCode = ref('')
const showPwd = ref(false)
const submitting = ref(false)

onMounted(async () => {
  await auth.init()
  if (auth.profile) router.replace('/read')
})

async function submit() {
  if (!username.value || !password.value) {
    showToast('请输入账号和密码')
    return
  }
  if (password.value.length < 6) {
    showToast('密码至少 6 位')
    return
  }

  submitting.value = true
  try {
    if (mode.value === 'login') {
      await auth.login(username.value.trim(), password.value)
      showToast('登录成功')
    } else {
      const p = await auth.register(
        username.value.trim(),
        password.value,
        inviteCode.value.trim() || undefined
      )
      if (p) showToast(`注册成功,你的好友码是 ${p.friend_code}`)
    }
    router.replace('/read')
  } catch (e: any) {
    showToast(e?.response?.data?.error || e?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page auth-page">
    <div class="auth-card">
      <div class="logo">📖</div>
      <h2 class="title">{{ mode === 'login' ? '登录' : '注册' }}</h2>
      <p class="subtitle">圣经 · AI · 好友</p>

      <Tabs v-model:active="mode" class="mode-tabs" shrink>
        <Tab title="登录" name="login" />
        <Tab title="注册" name="signup" />
      </Tabs>

      <div class="form">
        <Field v-model="username" label="账号" placeholder="字母/数字/中文,2-32位" maxlength="32" />
        <Field v-model="password" :type="showPwd ? 'text' : 'password'" label="密码" placeholder="至少 6 位" maxlength="64">
          <template #button>
            <span class="eye" @click="showPwd = !showPwd">{{ showPwd ? '🙈' : '👁' }}</span>
          </template>
        </Field>
        <Field
          v-if="mode === 'signup'"
          v-model="inviteCode"
          label="邀请码"
          placeholder="选填,邀请码由管理员提供"
          maxlength="16"
        />
      </div>

      <Button type="primary" block :loading="submitting" @click="submit" class="submit-btn">
        {{ mode === 'login' ? '登 录' : '注 册' }}
      </Button>

      <p class="tip">
        {{ mode === 'login' ? '没有账号?切到注册 →' : '已有账号?切到登录 ←' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f0e8 0%, #e8f0f5 100%);
  padding: 24px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
.logo {
  font-size: 48px;
  text-align: center;
  margin-bottom: 8px;
}
.title {
  font-size: 22px;
  text-align: center;
  margin: 0;
  color: #2c3e50;
}
.subtitle {
  text-align: center;
  color: #7f8c8d;
  margin: 4px 0 16px;
  font-size: 13px;
}
.form {
  margin: 8px 0 16px;
}
.mode-tabs {
  margin-bottom: 16px;
}
.submit-btn {
  height: 44px;
  font-size: 16px;
}
.eye {
  cursor: pointer;
  font-size: 16px;
}
.tip {
  text-align: center;
  color: #95a5a6;
  font-size: 13px;
  margin-top: 12px;
}
</style>
