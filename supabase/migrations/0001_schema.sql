-- 圣经 PWA 数据库 schema
-- 注:public.profiles 与 auth.users 一对一,通过 trigger 自动建

create extension if not exists pg_trgm;
create extension if not exists vector;
create extension if not exists pg_stat_statements;

-- 用户档案(对齐 auth.users)
create type user_role as enum ('user', 'admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null default 'user',
  pub_key text,
  display_name text,
  created_at timestamptz not null default now()
);

-- 圣经经文
create table if not exists public.bible_verses (
  id bigint generated always as identity primary key,
  book_code text not null,
  book_name_zh text not null,
  book_name_en text not null,
  chapter int not null,
  verse int not null,
  text_zh text not null,
  text_en text,
  search_text tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(text_zh, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(text_en, '')), 'B')
  ) stored
);

create unique index if not exists bible_verses_uk on public.bible_verses (book_code, chapter, verse);
create index if not exists bible_verses_search_idx on public.bible_verses using gin (search_text);
create index if not exists bible_verses_book_chapter on public.bible_verses (book_code, chapter);
create index if not exists bible_verses_trgm on public.bible_verses using gin (text_zh gin_trgm_ops);

-- 圣经书卷目录(便于 UI 列表)
create table if not exists public.bible_books (
  code text primary key,
  name_zh text not null,
  name_en text not null,
  testament text not null check (testament in ('OT', 'NT')),
  order_num int not null,
  chapter_count int not null
);

-- 人物
create table if not exists public.persons (
  id bigint generated always as identity primary key,
  name_zh text not null,
  name_en text,
  alt_names text[],
  wiki_id text,
  summary text,
  biography text,
  dictionary_refs jsonb not null default '[]'::jsonb,
  verse_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists persons_name_trgm on public.persons using gin (name_zh gin_trgm_ops);
create index if not exists persons_alt_names on public.persons using gin (alt_names);
create index if not exists persons_verse_refs on public.persons using gin (verse_refs jsonb_path_ops);

-- 知识库(RAG)
create type kb_source as enum ('commentary', 'devotional', 'dictionary', 'user_upload');

create table if not exists public.knowledge_base (
  id bigint generated always as identity primary key,
  source_type kb_source not null,
  title text not null,
  content text not null,
  chunk_index int not null default 0,
  embedding vector(1024),
  meta jsonb not null default '[]'::jsonb,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists kb_embedding_hnsw on public.knowledge_base using hnsw (embedding vector_cosine_ops);
create index if not exists kb_source on public.knowledge_base (source_type);

-- 聊天
create type room_type as enum ('dm', 'group');

create table if not exists public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  type room_type not null,
  title text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_room_members (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

create index if not exists crm_user on public.chat_room_members (user_id);

-- 每个成员收到的、用自己公钥加密过的 room_key
create table if not exists public.chat_room_keys (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  encrypted_key text not null,
  created_at timestamptz not null default now(),
  unique (room_id, user_id)
);

-- 消息:只存密文
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  ciphertext text not null,
  nonce text not null,
  created_at timestamptz not null default now()
);

create index if not exists msg_room_time on public.chat_messages (room_id, created_at desc);

-- 留言/异步消息:也加密,但允许"已读回执"
create table if not exists public.chat_read_state (
  room_id uuid references public.chat_rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  last_read_msg_id uuid,
  last_read_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- 反馈
create type feedback_status as enum ('open', 'in_progress', 'resolved', 'closed');

create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null,
  status feedback_status not null default 'open',
  content text not null,
  admin_reply text,
  updated_at timestamptz not null default now()
);

create index if not exists feedback_status on public.feedback (status);
create index if not exists feedback_user on public.feedback (user_id);

-- 管理操作日志
create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target text,
  detail jsonb,
  ts timestamptz not null default now()
);

create index if not exists audit_admin on public.admin_audit_log (admin_id, ts desc);

-- 个人经文笔记/收藏(增强功能,Phase 后续用)
create table if not exists public.user_notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  verse_id bigint references public.bible_verses(id) on delete cascade,
  kind text not null check (kind in ('highlight', 'note', 'bookmark')),
  content text,
  color text,
  created_at timestamptz not null default now()
);

create index if not exists notes_user on public.user_notes (user_id);
create index if not exists notes_verse on public.user_notes (verse_id);

-- profiles 自动建行(注册时)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role, display_name)
  values (new.id, new.email, 'user', coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 自动更新
create or replace function public.touch_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists feedback_touch on public.feedback;
create trigger feedback_touch before update on public.feedback
  for each row execute function public.touch_updated_at();
