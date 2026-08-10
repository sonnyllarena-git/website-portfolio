create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed'))
);

alter table public.messages enable row level security;

create policy "Allow inserts from anon"
  on public.messages
  for insert
  to anon
  with check (true);
