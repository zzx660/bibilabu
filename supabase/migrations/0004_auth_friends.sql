-- 注册/登录改造:账号+密码+邀请码(无邮箱验证)
-- 好友系统 + 6位 friend_code + 邀请码

-- 1) profiles 表加字段
alter table public.profiles
  add column if not exists username text unique,
  add column if not exists friend_code text unique,
  add column if not exists invite_code text,
  add column if not exists invited_by uuid references public.profiles(id) on delete set null,
  add column if not exists avatar_url text;

-- 2) 好友表(双向)
create table if not exists public.friends (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  friend_id uuid not null references public.profiles(id) on delete cascade,
  status    text not null default 'pending' check (status in ('pending','accepted','blocked')),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  primary key (user_id, friend_id)
);
create index if not exists friends_user on public.friends(user_id);
create index if not exists friends_friend on public.friends(friend_id);

-- 3) 6位 friend_code 自增序列(从 000001 开始,000000 留给初始 admin)
create sequence if not exists public.friend_code_seq start with 1;

-- 4) 注册触发器:自动分配 friend_code,首个注册者变 admin,写入 username
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
declare
  next_code text;
  first_user boolean;
  new_role user_role;
begin
  -- 判断是否首个用户(无任何 profile)
  select (count(*) = 0) into first_user from public.profiles;

  -- 分配 friend_code:首个用户 = '000000',其余走序列
  if first_user then
    next_code := '000000';
    new_role := 'admin';
  else
    next_code := lpad(nextval('public.friend_code_seq')::text, 6, '0');
    new_role := 'user';
  end if;

  insert into public.profiles (
    id, email, username, friend_code, role, display_name,
    invite_code, created_at
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(coalesce(new.email, ''), '@', 1)),
    next_code,
    new_role,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data->>'invite_code',
    now()
  );

  return new;
end;
$$;

-- 重建触发器
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) 邀请码校验函数
create or replace function public.validate_invite_code(code text)
returns boolean
language sql
security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where invite_code = code and code is not null and code <> ''
  );
$$;

-- 6) RLS:profiles 所有人可读(按 friend_code / username 查找),friends 按成员可见
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_role_admin on public.profiles;
create policy profiles_role_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- 邀请码字段:自己或 admin 可改
create or replace function public.can_manage_invite(target_id uuid)
returns boolean
language sql
security definer set search_path = public as $$
  select auth.uid() = target_id or public.is_admin();
$$;

alter table public.profiles enable row level security;

-- friends 表 RLS
alter table public.friends enable row level security;
drop policy if exists friends_read on public.friends;
create policy friends_read on public.friends
  for select using (user_id = auth.uid() or friend_id = auth.uid() or public.is_admin());

drop policy if exists friends_insert on public.friends;
create policy friends_insert on public.friends
  for insert with check (user_id = auth.uid());

drop policy if exists friends_update on public.friends;
create policy friends_update on public.friends
  for update using (user_id = auth.uid() or friend_id = auth.uid());

drop policy if exists friends_delete on public.friends;
create policy friends_delete on public.friends
  for delete using (user_id = auth.uid() or friend_id = auth.uid() or public.is_admin());
