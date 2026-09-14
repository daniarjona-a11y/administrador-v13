-- ADMINISTRADOR · El Reto Empresarial V13
-- Supabase setup: public leaderboard with server-side write gate.
-- Run this file once in Supabase SQL Editor on a fresh project.

create extension if not exists pgcrypto;

create table if not exists public.global_records (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  points integer not null,
  days integer not null,
  result_type text not null default 'stable',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.global_records enable row level security;

-- Normalize / validate data at the database boundary.
update public.global_records
set company_name = trim(company_name)
where company_name <> trim(company_name);

with ranked as (
  select id,
         row_number() over (
           partition by lower(trim(company_name))
           order by points desc, days desc, created_at asc, id asc
         ) as rn
  from public.global_records
)
delete from public.global_records g
using ranked r
where g.id = r.id and r.rn > 1;

create unique index if not exists uq_global_records_company_name_normalized
on public.global_records ((lower(trim(company_name))));

create index if not exists idx_global_records_points_desc
on public.global_records (points desc);

create index if not exists idx_global_records_days_desc
on public.global_records (days desc);

create index if not exists idx_global_records_created_at
on public.global_records (created_at);

-- Public leaderboard is readable, but not writable directly from the browser.
drop policy if exists "anon_select_global_records" on public.global_records;
create policy "anon_select_global_records"
on public.global_records for select
to anon, authenticated using (true);

drop policy if exists "anon_insert_global_records" on public.global_records;
drop policy if exists "authenticated_insert_global_records" on public.global_records;
drop policy if exists "anon_update_global_records" on public.global_records;
drop policy if exists "authenticated_update_global_records" on public.global_records;
drop policy if exists "anon_delete_global_records" on public.global_records;
drop policy if exists "authenticated_delete_global_records" on public.global_records;

revoke insert, update, delete, truncate on table public.global_records from anon, authenticated;
grant select on table public.global_records to anon, authenticated;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_global_records_updated_at on public.global_records;
create trigger trg_global_records_updated_at
before update on public.global_records
for each row execute function public.update_updated_at_column();

drop function if exists public.upsert_global_record(text, integer, integer, text);

create or replace function public.upsert_global_record(
  p_company_name text,
  p_points integer,
  p_days integer,
  p_result_type text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := trim(coalesce(p_company_name, ''));
  v_id uuid;
  v_existing_points integer;
  v_record_points integer;
  v_record_days integer;
  v_created_at timestamptz;
  v_rank bigint;
  v_total bigint;
begin
  if v_name = '' or char_length(v_name) > 28 then
    raise exception 'Nombre de empresa inválido';
  end if;

  if v_name ~ '[[:cntrl:]]' then
    raise exception 'Nombre de empresa inválido';
  end if;

  if p_points is null or p_points < 0 or p_points > 50000 then
    raise exception 'Puntuación inválida';
  end if;

  if p_days is null or p_days < 1 or p_days > 10 then
    raise exception 'Número de días inválido';
  end if;

  if p_result_type is null or p_result_type not in ('victory', 'competitive', 'stable', 'crisis') then
    raise exception 'Tipo de resultado inválido';
  end if;

  insert into public.global_records (company_name, points, days, result_type)
  values (v_name, p_points, p_days, p_result_type)
  on conflict ((lower(trim(company_name)))) do update
    set company_name = public.global_records.company_name
  returning id, points, days, created_at
  into v_id, v_existing_points, v_record_days, v_created_at;

  if p_points > v_existing_points then
    update public.global_records
    set company_name = v_name,
        points = p_points,
        days = p_days,
        result_type = p_result_type,
        updated_at = now()
    where id = v_id;

    v_record_points := p_points;
    v_record_days := p_days;
  else
    v_record_points := v_existing_points;
  end if;

  select count(*) + 1 into v_rank
  from public.global_records r
  where r.points > v_record_points
     or (r.points = v_record_points and r.days > v_record_days)
     or (r.points = v_record_points and r.days = v_record_days and r.created_at < v_created_at);

  select count(*) into v_total from public.global_records;

  return jsonb_build_object(
    'id', v_id,
    'rank', v_rank,
    'total', v_total
  );
end;
$$;

revoke all on function public.upsert_global_record(text, integer, integer, text) from public;
grant execute on function public.upsert_global_record(text, integer, integer, text) to anon, authenticated;
