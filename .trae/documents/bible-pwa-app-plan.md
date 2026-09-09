# 圣经 PWA 应用实现方案

## Context(为什么做 / 目标)

为基督徒朋友群体(约 50 人,iOS + Android 都有)做一款圣经应用,通过分享链接/加主屏使用,不上架不备案。核心目标:
1. 圣经搜索 + 人物生平查询(基础数据层)
2. 大模型解读经文 + 智能体问答(基于知识库 RAG)
3. 朋友间内部沟通(留言 + 实时聊天)
4. **管理后台**:管理员可改一切内容,反馈闭环流程
5. **保密/不受监视**:端到端加密聊天、数据加密、不记录用户内容

成本约束:除可选国内轻量云(¥30/年)外零成本,免费层够 50 人。诚实声明:LLM API 调用必然把提问发给智谱服务器(无法避免,除非本地部署,但成本超免费范围)。

**聊天记录可见性原则**:服务器只存密文,但所有成员可在客户端解密查看完整历史;用户删账号后,自己因私钥丢失无法再看,但**其他成员仍可正常查看历史消息**(因为 room 消息密钥用各成员公钥分别加密分发,各自用自己私钥解密)。

## 1. 分层架构

```
表示层  PWA (Vue3+Vite+Vant4+Tailwind+Pinia+vite-plugin-pwa)
        本地 IndexedDB(加密) + Service Worker 离线缓存
           │ HTTPS
接入层  Hono (Vercel Edge Functions) REST API
        + 独立 WebSocket (国内轻量云¥30/年, Node ws, 聊天长连接)
           │
数据层  Supabase 免费层 (PostgreSQL + pgvector + Auth + Realtime)
AI 层   智谱 GLM-4-Flash  fetch https://open.bigmodel.cn/api/paas/v4/chat/completions
存储层  Cloudflare R2 (注释书/用户上传, 免费 10GB)
```

## 2. 技术栈(锁定版本)

**前端**
- vue ^3.4 / vite ^5.2 / vite-plugin-pwa ^0.20
- vant ^4.9 (移动端 UI) / tailwindcss ^3.4 / pinia ^2.1 / vue-router ^4.3
- libsodium-wrappers ^0.7 (E2EE) / crypto-js ^4.2 (字段 AES-GCM)
- @supabase/supabase-js ^2.42 (Realtime/Auth) / socket.io-client ^4.7 (自建 WS 备用)

**后端**
- hono ^4.4 + @hono/zod-validator
- drizzle-orm 可选 / LLM 直接 fetch,不引 SDK

## 3. 数据库表结构(Supabase + RLS)

| 表 | 关键字段 | RLS 策略 |
|---|---|---|
| `users` | id uuid pk, email, role enum(user,admin), pub_key text, created_at | 自己读自己, role 仅 admin 读他人 |
| `bible_verses` | id, book_code, chapter, verse, text_zh, text_en, fts tsvector | 公开读 / admin 写;唯一(book,chapter,verse) + GIN fts |
| `persons` | id, name_zh, name_en, wiki_id, summary, dictionary_refs jsonb, verse_refs jsonb | 公开读 / admin 写 |
| `knowledge_base` | id, source_type enum(commentary,devotional,user_upload), title, content, embedding vector(1024) HNSW, owner_id | 公共源公开读; user_upload 仅 owner+admin |
| `chat_rooms` | id, type dm\|group, members jsonb | 成员可读 |
| `chat_room_keys` | id, room_id, user_id, encrypted_room_key text | 成员可读自己行(用自己公钥加密的 room 密钥) |
| `chat_messages` | id, room_id, sender_id, **ciphertext text**, iv, created_at | room 成员可读;**不存明文** |
| `feedback` | id, user_id, category, status enum(open,in_progress,resolved,closed), content, admin_reply, updated_at | 用户读自己 / admin 读全部 |
| `admin_audit_log` | id, admin_id, action, target, ts | 仅 admin 读 |

## 4. 前端目录结构

```
src/
  main.ts, App.vue, router/
  stores/{auth,bible,person,chat,kb,feedback}.ts
  api/{hono,supabase,glm,crypto}.ts
  views/
    Home, Search, Reader, PersonDetail, AiChat, Chat,
    Feedback, Login, Profile,
    Admin/{BibleEdit,PersonEdit,KbUpload,UserMgmt,FeedbackMgmt}.vue
  components/{VerseCard,PersonCard,ChatBubble,E2eeSetup}
  utils/{bible-loader,seed-loader}.ts
  public/{manifest.webmanifest,icons}
supabase/migrations/{0001_schema,0002_rls}.sql
serverless/hono/*.ts
```

## 5. 分阶段实现计划(已调整:实时聊天提前,安全加固最后)

### Phase 1(数据导入 + 只读)
- 导入 cuvs/kjv → `bible_verses` 表
- 实现 Reader(读经)+ Search(关键词搜索)+ SW 离线
- **验证**:搜"爱"返回约 311 节;断网可读

### Phase 2(Auth + 人物 + AI 解读)
- 导入 tipnr/bible-dict → `persons` 表
- Supabase Auth 登录(邮箱)
- GLM 接入,AiChat 拼经文+人物回答
- **验证**:登录后问"彼得是谁"返回经节

### Phase 3(智能体问答 + 知识库 RAG)
- pgvector 分块导入注释书到 `knowledge_base`
- 智能体:用户提问 → 检索知识库 → 拼 prompt → GLM 回答
- **验证**:问"创世记第一章的注释"返回注释书内容

### Phase 4(沟通交流:留言 + 实时聊天 + E2EE)← 提前
- Supabase Realtime 订阅 room(实时聊天)
- 留言功能(异步消息存库)
- libsodium X25519 交换密钥,密文落库,PWA install 引导
- **聊天记录可见**:成员登录后用自己私钥解密 room_key → 查看完整历史
- **验证**:双设备互发;DB 只见密文;重新登录后能看到历史消息

### Phase 5(管理后台 + 反馈闭环)
- admin 权限(role 由现有 admin 在 users 表 UPDATE 设定,无自助注册)
- 管理员可改:圣经文本 / 人物字典 / 知识库
- 反馈状态机:提反馈 → admin 通知 → 回复 → 用户收
- Realtime 推变更通知
- **验证**:普通账号 GET /admin → 403;反馈走完全流程

### Phase 6(国内加速 + iOS 适配)
- 轻量云跑 WS(¥30/年)
- manifest + apple-touch-icon + 启动图全套尺寸
- iOS 加主屏 standalone 体验
- **验证**:Lighthouse PWA 100;iOS 图标正确

### Phase 7(安全加固,最后)← 调整到末尾
- RLS 审计脚本(全表权限回归测试)
- 删自己数据按钮(账号注销)
- 零日志策略(Supabase auth logs 关闭长存;Hono 不打 body)
- 50 并发压测(模拟 50 人同时在线聊天)
- **验证**:
  - 50 并发下消息延迟 < 2s
  - 无明文泄露(DB 全表扫描无明文)
  - 删账号后:该用户无法再查看消息(私钥丢失),**其他成员仍可正常查看历史**

## 6. 保密加密方案(关键)

### 端到端加密(E2EE)
- 库:libsodium-wrappers(X25519 密钥交换 + XSalsa20-Poly1305 加密)
- 注册时客户端生成密钥对:公钥存 `users.pub_key`,私钥用用户密码(Argon2id 派生 KEK)加密存 IndexedDB
- 群聊:每个 room 有一个对称消息密钥(room_key),用每个成员的公钥分别加密后存 `chat_room_keys` 表
- 发消息:用 room_key 加密 → 存 ciphertext;收消息:取自己的 encrypted_room_key → 用私钥解密得 room_key → 解密消息
- **服务器只存 ciphertext + iv,永不触明文**
- **历史可见**:成员登录后用私钥解出 room_key,即可解密该 room 所有历史消息

### 数据库字段加密
- `feedback.content` / `admin_reply` 用 AES-256-GCM,密钥由 KEK 包裹

### LLM 调用脱敏
- 系统提示前置:"忽略身份,仅基于经文回答"
- 调 GLM 前剥离 email/uid,传匿名 session_id
- **不把 chat 明文喂 LLM**,只喂经文 + 用户问题

### 日志策略
- 关 Supabase auth logs 长存;Hono 不打 body;R2 不开访问日志;前端不报第三方

### 诚实声明(必须在应用内告知用户)
- GLM 调用必然把提问明文发智谱服务器,无法避免
- 更高保密需 Phase 8(可选,超免费范围):本地 Ollama qwen2.5:7b

## 7. 管理员 + 反馈流程

### 权限模型
- `users.role` enum(user, admin)
- 首个 admin:你在 Supabase Studio 手动 `UPDATE users SET role='admin' WHERE email='你'`
- 之后 admin 互设;注册接口 RLS + DB 默认 'user',**禁设 role**

### 反馈状态机
```
open → in_progress(admin 接单) → resolved(admin 回复) → closed(用户确认)
```
- Realtime 推变更通知
- `admin_audit_log` 记每次 admin 写操作

## 8. iOS / Android PWA 差异

| 维度 | Android | iOS |
|---|---|---|
| 推送 | FCM 全支持 | iOS 16.4+ 才有,且前台限制 |
| 缓存 | 大,后台保活 | 7 天未用 IndexedDB 易丢 |
| 后台 | 保活 | 切后台断连,需回前台重连+未读补偿 |
| 图标 | 标准即可 | 需 apple-touch-icon + 启动图全套尺寸 |

**方案**:iOS 用 Realtime 重连 + 本地未读计数;manifest start_url 独立。

## 9. 推荐增强功能(完善 app,可选实现)

以下功能适合基督徒场景、不超出免费范围,可按需加入后续迭代:

| 功能 | 说明 | 实现复杂度 | 数据来源 |
|---|---|---|---|
| **每日经文/灵粮** | 首页展示每日一节经文 + GLM 生成简短灵修 | 低 | 本地轮询 + GLM |
| **读经计划** | 一年读经/30天诗篇/四福音等,本地存进度 | 低 | 计划表(公共) |
| **经文高亮/收藏/笔记** | 读经时标注、写笔记,个人数据 | 中 | Supabase(user_notes 表) |
| **经文图片分享** | 选经文 → 生成精美图片 → 分享给朋友 | 中 | Canvas + html2image |
| **主题串珠** | 相关经文交叉引用(如"信心"相关经文) | 中 | 公共串珠数据(KJV十字参考) |
| **祷告/代祷板** | 朋友间发布代祷需求,互相代祷打卡 | 中 | Supabase 表 + Realtime |
| **多版本对照** | 和合本/KJV 并排显示同一节 | 低 | 已有 cuvs + kjv 数据 |
| **读经打卡/进度追踪** | 每日读经打卡,群内排行 | 中 | Supabase 表 |
| **灵修提醒** | 定时推送提醒读经(PWA Notification) | 低 | Notification API |
| **音频圣经** | 听经功能 | 高 | 公共音频源或 TTS |

**建议优先加入**:每日经文、读经计划、经文收藏/笔记、多版本对照、祷告代祷板 —— 这几个成本低、体验提升明显,适合"给朋友用"的定位。

## 10. 验证方式(端到端)

| Phase | 验证命令/操作 |
|---|---|
| P1 | `curl /api/search?q=爱` 返回 JSON;断网读经文 |
| P2 | auth 拿 token;AiChat 回答含经节 |
| P3 | 问注释相关问题返回知识库内容 |
| P4 | 双设备互发;DB 只见密文;重新登录看历史 |
| P5 | 普通账号 GET /admin → 403;反馈走完全流程 |
| P6 | Lighthouse PWA 100;iOS 图标正确 |
| P7 | 50 并发 < 2s;DB 无明文;删账号后他人仍可看历史 |

## 关键文件(实现时优先创建)

- `supabase/migrations/0001_schema.sql`(表结构)
- `supabase/migrations/0002_rls.sql`(行级安全策略)
- `src/api/crypto.ts`(E2EE 加密核心)
- `src/api/glm.ts`(GLM-4-Flash 调用)
- `serverless/hono/index.ts`(后端入口)
- `src/utils/bible-loader.ts`(圣经数据导入脚本)
- `src/utils/seed-loader.ts`(人物字典/注释书导入)

## 诚实成本说明

| 项 | 费用 |
|---|---|
| 前端 Vercel | ¥0 |
| Supabase 免费层 | ¥0 |
| GLM-4-Flash | ¥0(完全免费) |
| Cloudflare R2 | ¥0(10GB 免费) |
| 国内轻量云(可选,实时聊天用) | ¥30/年 |
| 域名(可选) | ¥30/年 |
| **合计** | **¥0 ~ ¥60/年** |

**唯一无法零成本的部分**:真正做到完全不经过第三方 LLM(本地部署 Ollama),需要 GPU 服务器,月成本 ¥200+,超出"给朋友用"的预算。
