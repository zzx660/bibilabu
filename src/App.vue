<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Tabbar, TabbarItem } from 'vant'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const active = ref(tabKey(route.path))

function tabKey(p: string) {
  if (p.startsWith('/read')) return 'read'
  if (p.startsWith('/search')) return 'search'
  if (p.startsWith('/ai')) return 'ai'
  if (p.startsWith('/chat')) return 'chat'
  if (p.startsWith('/me')) return 'me'
  return 'read'
}

function onTab(k: string) {
  const map: Record<string, string> = {
    read: '/read',
    search: '/search',
    ai: '/ai',
    chat: '/chat',
    me: '/me'
  }
  router.push(map[k] || '/read')
}
</script>

<template>
  <div class="app-shell">
    <RouterView v-slot="{ Component }">
      <keep-alive :include="['Home', 'Search']">
        <component :is="Component" />
      </keep-alive>
    </RouterView>
    <Tabbar v-model="active" @change="onTab" route fixed-placeholder>
      <TabbarItem name="read">读经</TabbarItem>
      <TabbarItem name="search">搜索</TabbarItem>
      <TabbarItem name="ai">问答</TabbarItem>
      <TabbarItem name="chat">团契</TabbarItem>
      <TabbarItem name="me">我的</TabbarItem>
    </Tabbar>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}
</style>
