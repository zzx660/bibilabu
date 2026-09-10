-- 0005_full_features.sql
-- 书签、AI对话历史、代祷、群组增强、用户读经记忆
-- 全部 idempotent,可重复执行

-- ============================================================
-- 1. profiles 扩展字段
-- ============================================================
alter table public.profiles
  add column if not exists last_book text default 'GEN',
  add column if not exists last_chapter int default 1,
  add column if not exists show_en boolean default true,
  add column if not exists title text,
  add column if not exists bio text,
  add column if not exists updated_at timestamptz default now();

-- ============================================================
-- 2. friends 扩展:申请留言 + 好友备注
-- ============================================================
alter table public.friends
  add column if not exists message text,
  add column if not exists remark text;

-- ============================================================
-- 3. chat_rooms 群功能扩展
-- ============================================================
alter table public.chat_rooms
  add column if not exists announcement text,
  add column if not exists owner_id uuid references public.profiles(id) on delete set null,
  add column if not exists avatar_url text;

-- ============================================================
-- 4. 书签表
-- ============================================================
create table if not exists public.bookmarks (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_code text not null,
  book_name_zh text not null,
  chapter int not null,
  verse_start int not null,
  verse_end int not null default 0,
  note text,
  color text default '#b89b5e',
  created_at timestamptz not null default now()
);
create index if not exists bookmarks_user on public.bookmarks(user_id, created_at desc);
alter table public.bookmarks enable row level security;
drop policy if exists bookmarks_all on public.bookmarks;
create policy bookmarks_all on public.bookmarks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- 5. AI 对话历史
-- ============================================================
create table if not exists public.ai_chat_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  refs jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists ai_history_user on public.ai_chat_history(user_id, created_at);
alter table public.ai_chat_history enable row level security;
drop policy if exists ai_history_all on public.ai_chat_history;
create policy ai_history_all on public.ai_chat_history
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- 6. 代祷
-- ============================================================
do $$ begin
  create type prayer_visibility as enum ('friends','groups','public');
exception when duplicate_object then null;
end $$;

create table if not exists public.prayers (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  content text not null,
  visibility prayer_visibility not null default 'friends',
  created_at timestamptz not null default now()
);
create index if not exists prayers_user on public.prayers(user_id, created_at desc);
create index if not exists prayers_time on public.prayers(created_at desc);
alter table public.prayers enable row level security;
drop policy if exists prayers_manage on public.prayers;
create policy prayers_manage on public.prayers
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 代祷打卡
create table if not exists public.prayer_checkins (
  id bigint generated always as identity primary key,
  prayer_id bigint not null references public.prayers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (prayer_id, user_id)
);
alter table public.prayer_checkins enable row level security;
drop policy if exists checkins_all on public.prayer_checkins;
create policy checkins_all on public.prayer_checkins
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- 7. profiles updated_at 触发器
-- ============================================================
create or replace function public.touch_profiles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_profiles_updated_at();
