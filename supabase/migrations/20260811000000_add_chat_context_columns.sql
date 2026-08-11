alter table public.chat_histories
  add column if not exists conversation_context jsonb not null default '{}'::jsonb,
  add column if not exists inactivity_warning_sent boolean not null default false,
  add column if not exists time_of_day text;
