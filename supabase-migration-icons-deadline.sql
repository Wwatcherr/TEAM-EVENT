-- ============================================
-- Migration : ajout icône + date butoir
-- À copier-coller dans Supabase > SQL Editor > Run
-- (à exécuter UNE FOIS sur une base qui a déjà les tables events/responses)
-- ============================================

alter table events add column if not exists icon text default '📅';
alter table events add column if not exists rsvp_deadline timestamptz;
