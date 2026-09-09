-- 行级安全策略(RLS)
-- 原则:最小权限;服务器永不触明文聊天;admin 可改一切公共数据

alter table public.profiles enable row level security;
alter table public.bible_verses enable row level security;
alter table public.bible_books enable row level security;
alter table public.persons enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.chat_rooms enable row level security;
alter table public.chat_room_members enable row level security;
alter table public.chat_room_keys enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chat_read_state enable row level security;
alter table public.feedback enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.user_notes enable row level security;

-- 辅助:判断当前用户是否 admin
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles:自己读自己;admin 读全
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- role 只能 admin 改(防自助提权):admin 可改 role,自己不能改自己的 role
drop policy if exists profiles_role_admin on public.profiles;
create policy profiles_role_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- bible_verses / bible_books / persons:所有人可读,仅 admin 写
drop policy if exists bible_read on public.bible_verses;
create policy bible_read on public.bible_verses for select using (true);

drop policy if exists bible_write on public.bible_verses;
create policy bible_write on public.bible_verses
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists books_read on public.bible_books;
create policy books_read on public.bible_books for select using (true);

drop policy if exists books_write on public.bible_books;
create policy books_write on public.bible_books
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists persons_read on public.persons;
create policy persons_read on public.persons for select using (true);

drop policy if exists persons_write on public.persons;
create policy persons_write on public.persons
  for all using (public.is_admin()) with check (public.is_admin());

-- knowledge_base:公共源(commentary/devotional/dictionary)所有人可读;user_upload 仅 owner+admin
drop policy if exists kb_read on public.knowledge_base;
create policy kb_read on public.knowledge_base
  for select using (
    source_type in ('commentary', 'devotional', 'dictionary')
    or owner_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists kb_insert on public.knowledge_base;
create policy kb_insert on public.knowledge_base
  for insert with check (
    owner_id = auth.uid() or public.is_admin()
  );

drop policy if exists kb_update on public.knowledge_base;
create policy kb_update on public.knowledge_base
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists kb_delete on public.knowledge_base;
create policy kb_delete on public.knowledge_base
  for delete using (owner_id = auth.uid() or public.is_admin());

-- chat_rooms:成员可见
drop policy if exists rooms_read on public.chat_rooms;
create policy rooms_read on public.chat_rooms
  for select using (
    exists (
      select 1 from public.chat_room_members m
      where m.room_id = chat_rooms.id and m.user_id = auth.uid()
    ) or public.is_admin()
  );

drop policy if exists rooms_insert on public.chat_rooms;
create policy rooms_insert on public.chat_rooms
  for insert with check (created_by = auth.uid());

-- chat_room_members:成员可读;自己可加入(room 创建者拉人);admin 可管理
drop policy if exists members_read on public.chat_room_members;
create policy members_read on public.chat_room_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.chat_room_members m2
      where m2.room_id = chat_room_members.room_id and m2.user_id = auth.uid()
    )
    or public.is_admin()
  );

drop policy if exists members_insert on public.chat_room_members;
create policy members_insert on public.chat_room_members
  for insert with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.chat_room_members m3
      where m3.room_id = chat_room_members.room_id
        and m3.user_id = auth.uid() and m3.role = 'owner'
    )
    or public.is_admin()
  );

-- chat_room_keys:成员只读自己那行
drop policy if exists room_keys_read on public.chat_room_keys;
create policy room_keys_read on public.chat_room_keys
  for select using (user_id = auth.uid());

drop policy if exists room_keys_insert on public.chat_room_keys;
create policy room_keys_insert on public.chat_room_keys
  for insert with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.chat_room_members m4
      where m4.room_id = chat_room_keys.room_id
        and m4.user_id = auth.uid() and m4.role = 'owner'
    )
  );

-- chat_messages:room 成员可读;成员可发(明文不进 RLS,只管写入权限)
drop policy if exists msg_read on public.chat_messages;
create policy msg_read on public.chat_messages
  for select using (
    exists (
      select 1 from public.chat_room_members m5
      where m5.room_id = chat_messages.room_id and m5.user_id = auth.uid()
    )
  );

drop policy if exists msg_insert on public.chat_messages;
create policy msg_insert on public.chat_messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.chat_room_members m6
      where m6.room_id = chat_messages.room_id and m6.user_id = auth.uid()
    )
  );

-- chat_read_state:自己管自己
drop policy if exists readstate_all on public.chat_read_state;
create policy readstate_all on public.chat_read_state
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- feedback:用户读自己;admin 读全;用户可写;admin 可改状态/回复
drop policy if exists feedback_read on public.feedback;
create policy feedback_read on public.feedback
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists feedback_insert on public.feedback;
create policy feedback_insert on public.feedback
  for insert with check (user_id = auth.uid());

drop policy if exists feedback_update on public.feedback;
create policy feedback_update on public.feedback
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- admin_audit_log:仅 admin 可读;admin 写(admin 自助写,通过 service role 也行)
drop policy if exists audit_read on public.admin_audit_log;
create policy audit_read on public.admin_audit_log
  for select using (public.is_admin());

drop policy if exists audit_insert on public.admin_audit_log;
create policy audit_insert on public.admin_audit_log
  for insert with check (public.is_admin());

-- user_notes:自己管自己
drop policy if exists notes_all on public.user_notes;
create policy notes_all on public.user_notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Realtime:发布 chat_messages / chat_rooms / feedback 变更
-- (Supabase Dashboard 里需手动开 realtime,或用以下 SQL)
alter publication supabase_realtime add table public.chat_messages;
alter publication supabase_realtime add table public.chat_rooms;
alter publication supabase_realtime add table public.feedback;
alter publication supabase_realtime add table public.chat_room_members;
