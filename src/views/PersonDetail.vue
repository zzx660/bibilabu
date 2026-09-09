<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NavBar, Cell } from 'vant'
import { api } from '@/api/hono'

const route = useRoute()
const person = ref<any>(null)

onMounted(async () => {
  const id = parseInt(route.params.id as string, 10)
  if (id) {
    const { person: p } = await api.personDetail(id)
    person.value = p
  }
})
</script>

<template>
  <div class="page pinch">
    <NavBar :title="person?.name_zh || '人物'" />
    <template v-if="person">
      <div class="pad">
        <h2 class="name">{{ person.name_zh }} <span class="en muted" v-if="person.name_en">{{ person.name_en }}</span></h2>
        <p v-if="person.summary" class="summary">{{ person.summary }}</p>
        <p v-if="person.biography" class="bio">{{ person.biography }}</p>
      </div>
      <Cell v-for="(ref, i) in person.verse_refs || []" :key="i" :title="ref" />
    </template>
    <div v-else class="center muted py-10">加载中…</div>
  </div>
</template>

<style scoped>
.pad { padding: 16px; }
.name { font-size: 20px; margin: 0; }
.en { font-size: 14px; }
.summary { color: var(--muted); margin: 8px 0; }
.bio { line-height: 1.8; margin: 12px 0 0; }
</style>
