-- UniVerso: formulário institucional e mural moderado.
-- Execute no SQL Editor do Supabase antes de configurar o deploy.

create extension if not exists pgcrypto;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 3 and 100),
  email text not null check (char_length(email) between 5 and 180),
  school text check (school is null or char_length(school) <= 150),
  message text not null check (char_length(message) between 10 and 1500),
  source text not null default 'site',
  created_at timestamptz not null default now(),
  handled_at timestamptz
);

create table if not exists public.commitments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  message text not null check (char_length(message) between 10 and 180),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists commitments_public_index
  on public.commitments (approved_at desc)
  where status = 'approved';

alter table public.contact_messages enable row level security;
alter table public.commitments enable row level security;

-- As funções da Vercel usam a publishable key (papel anon). O RLS garante
-- que mensagens privadas não sejam lidas publicamente e que ninguém publique
-- compromissos sem moderação.
revoke all on table public.contact_messages from anon, authenticated;
revoke all on table public.commitments from anon, authenticated;
grant all on table public.contact_messages to service_role;
grant all on table public.commitments to service_role;

grant insert on table public.contact_messages to anon;
grant select, insert on table public.commitments to anon;

drop policy if exists "Public may submit contact messages" on public.contact_messages;
create policy "Public may submit contact messages"
  on public.contact_messages for insert
  to anon
  with check (
    source = 'site'
    and char_length(name) between 3 and 100
    and char_length(email) between 5 and 180
    and char_length(message) between 10 and 1500
  );

drop policy if exists "Public may submit pending commitments" on public.commitments;
create policy "Public may submit pending commitments"
  on public.commitments for insert
  to anon
  with check (status = 'pending' and approved_at is null);

drop policy if exists "Public may read approved commitments" on public.commitments;
create policy "Public may read approved commitments"
  on public.commitments for select
  to anon
  using (status = 'approved' and approved_at is not null);

-- Para publicar um compromisso após revisão, execute:
-- update public.commitments
-- set status = 'approved', approved_at = now()
-- where id = 'UUID_DA_MENSAGEM';
