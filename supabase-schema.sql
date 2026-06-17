-- ============================================
-- Schéma : Team Events
-- À copier-coller dans Supabase > SQL Editor > Run
-- ============================================

create extension if not exists "pgcrypto";

-- Table des événements
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  location text default '',
  icon text default '📅',
  event_date timestamptz not null,
  rsvp_deadline timestamptz,
  created_by text not null,
  created_at timestamptz not null default now()
);

-- Table des réponses (participation)
create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  participant_name text not null,
  status text not null check (status in ('yes', 'no', 'maybe')),
  comment text default '',
  updated_at timestamptz not null default now(),
  unique (event_id, participant_name)
);

-- Table des membres de l'équipe (gérée depuis l'app)
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Index pour les perfs
create index if not exists idx_responses_event_id on responses(event_id);
create index if not exists idx_events_event_date on events(event_date);

-- Activer la sécurité au niveau ligne (RLS)
alter table events enable row level security;
alter table responses enable row level security;

-- Politiques : accès public en lecture/écriture
-- (app interne d'équipe, pas de données sensibles, accès simplifié par pseudo)
create policy "events_select_all" on events for select using (true);
create policy "events_insert_all" on events for insert with check (true);
create policy "events_delete_all" on events for delete using (true);

create policy "responses_select_all" on responses for select using (true);
create policy "responses_insert_all" on responses for insert with check (true);
create policy "responses_update_all" on responses for update using (true);
create policy "responses_delete_all" on responses for delete using (true);

alter table members enable row level security;
create policy "members_select_all" on members for select using (true);
create policy "members_insert_all" on members for insert with check (true);
create policy "members_delete_all" on members for delete using (true);

-- Activer le temps réel sur les trois tables
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table responses;
alter publication supabase_realtime add table members;
