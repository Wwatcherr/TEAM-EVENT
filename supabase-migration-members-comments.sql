-- ============================================
-- Migration : commentaires sur réponses + liste des membres
-- À copier-coller dans Supabase > SQL Editor > Run
-- (à exécuter UNE FOIS sur une base qui a déjà les tables events/responses)
-- ============================================

alter table responses add column if not exists comment text default '';

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table members enable row level security;

drop policy if exists "members_select_all" on members;
drop policy if exists "members_insert_all" on members;
drop policy if exists "members_delete_all" on members;

create policy "members_select_all" on members for select using (true);
create policy "members_insert_all" on members for insert with check (true);
create policy "members_delete_all" on members for delete using (true);

alter publication supabase_realtime add table members;

-- Liste de membres initiale (modifiable ensuite directement depuis l'app)
insert into members (name) values
  ('Bianca'), ('Enzo'), ('Katell'), ('Elodie'), ('Mathylde'),
  ('Samuel'), ('Yannis'), ('Roxana'), ('Corinne'), ('Vanessa'),
  ('Heloise'), ('Celine'), ('Lolita'), ('Marc')
on conflict (name) do nothing;
