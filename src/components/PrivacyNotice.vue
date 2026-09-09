<script setup lang="ts">
import { showDialog } from 'vant'

const content = `【保密说明】

1. 聊天消息端到端加密(E2EE),服务器只存密文,无法读取内容。
2. 你的私钥存在本地设备,不上传服务器。
3. 向智能体提问时,问题内容会发送给智谱 GLM-4-Flash 服务器以生成回答。这是 AI 服务的必要环节。
   - 提问不含你的账号、邮箱等身份信息。
   - 但问题本身的文字内容会经过智谱服务器。
4. 如需完全不经过第三方,需本地部署大模型(成本较高,暂未启用)。
5. 你可随时在"我的"页面删除账号及本地数据。`

function show() {
  showDialog({ title: '隐私与保密', message: content, confirmButtonText: '我已了解' })
}

defineExpose({ show })
</script>

<template>
  <span class="link" @click="show">隐私说明</span>
</template>

<style scoped>
.link { color: var(--grape); font-size: 13px; }
</style>
