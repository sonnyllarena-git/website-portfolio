create table if not exists public.chat_histories (
  id uuid primary key default gen_random_uuid(),
  guest_name text,
  guest_email text,
  messages jsonb not null default '[]'::jsonb,
  conversation_duration int not null default 0,
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  total_messages int not null default 0,
  bot_responses int not null default 0,
  human_follow_up boolean not null default false
);

alter table public.chat_histories enable row level security;

create policy "Allow inserts from anon"
  on public.chat_histories
  for insert
  to anon
  with check (true);

create table if not exists public.unanswered_chats (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  guest_email text,
  timestamp timestamptz not null default now(),
  chat_history_id uuid references public.chat_histories(id),
  status text not null default 'pending' check (status in ('pending', 'answered', 'ignored')),
  answer_provided text,
  added_to_faq boolean not null default false
);

alter table public.unanswered_chats enable row level security;

create policy "Allow inserts from anon"
  on public.unanswered_chats
  for insert
  to anon
  with check (true);
