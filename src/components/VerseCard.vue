<script setup lang="ts">
const props = defineProps<{
  verse: {
    verse: number
    text_zh: string
    text_en?: string
  }
  book?: string
  chapter?: number
}>()

async function share() {
  const ref = `${props.book || ''}${props.chapter || ''}:${props.verse.verse}`
  const text = `${ref} ${props.verse.text_zh}`
  try {
    if (navigator.share) {
      await navigator.share({ title: ref, text })
      return
    }
  } catch {}
  try {
    await navigator.clipboard.writeText(text)
  } catch {}
}
</script>

<template>
  <div class="verse-card">
    <div class="text">
      <span class="verse-num">{{ verse.verse }}</span>
      <span>{{ verse.text_zh }}</span>
    </div>
    <div v-if="verse.text_en" class="en muted text-sm mt-1">{{ verse.text_en }}</div>
    <div class="actions">
      <span class="link" @click="share">分享</span>
    </div>
  </div>
</template>

<style scoped>
.text { line-height: 1.85; font-size: 17px; }
.en { font-size: 13px; }
.actions { margin-top: 8px; }
.link { color: var(--grape); font-size: 13px; }
</style>
