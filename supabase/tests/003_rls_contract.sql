\set ON_ERROR_STOP on
begin;

do $$
declare
  v_without_rls text[];
  v_write_grants text[];
begin
  select array_agg(c.relname order by c.relname)
    into v_without_rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'operator'
    and c.relkind = 'r'
    and not c.relrowsecurity;
  if v_without_rls is not null then
    raise exception 'operator tables without RLS: %', v_without_rls;
  end if;

  select array_agg(table_name || ':' || privilege_type order by table_name, privilege_type)
    into v_write_grants
  from information_schema.role_table_grants
  where table_schema = 'operator'
    and grantee in ('anon', 'authenticated')
    and privilege_type in ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'TRIGGER', 'REFERENCES');
  if v_write_grants is not null then
    raise exception 'untrusted write grants detected: %', v_write_grants;
  end if;
end;
$$;

rollback;
