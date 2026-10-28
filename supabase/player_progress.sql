-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.player_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.player_progress enable row level security;

revoke all on table public.player_progress from anon, authenticated;
grant select, insert, update on table public.player_progress to authenticated;

drop policy if exists "Users read their own progress" on public.player_progress;
drop policy if exists "Users create their own progress" on public.player_progress;
drop policy if exists "Users update their own progress" on public.player_progress;

create policy "Users read their own progress"
  on public.player_progress for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create their own progress"
  on public.player_progress for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users update their own progress"
  on public.player_progress for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
