-- RLS 审计脚本:检查所有表是否启用 RLS + 是否有策略
-- 运行: psql -f audit_rls.sql 或 Supabase Studio SQL Editor

select
  schemaname as schema,
  tablename as table,
  rowsecurity as rls_enabled,
  (
    select count(*)
    from pg_policies
    where schemaname = t.schemaname and tablename = t.tablename
  ) as policy_count
from pg_tables t
where schemaname = 'public'
order by tablename;

-- 检查是否有 PUBLIC 策略(可能意外开放)
select
  schemaname, tablename, policyname, cmd, roles,
  qual, with_check
from pg_policies
where schemaname = 'public'
  and 'public' = any(roles)
order by tablename, policyname;

-- 检查 chat_messages 表没有明文泄露(抽样)
-- 如果 text 列存在明文则返回 >0
select
  count(*) as suspect_plaintext
from public.chat_messages
where ciphertext ~ '[一-龥]';

-- 检查没有 PUBLIC 写权限的表
select tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and cmd in ('INSERT', 'UPDATE', 'DELETE')
  and 'public' = any(roles);
