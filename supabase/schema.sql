-- ============================================================
-- Loto entre collègues — schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Table DRAW (un tirage)
-- ------------------------------------------------------------
create table if not exists draw (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  draw_date date not null,
  participation_amount numeric(10, 2) not null check (participation_amount > 0),
  participations_locked boolean not null default false,
  participations_locked_at timestamptz,
  tickets_locked boolean not null default false,
  tickets_locked_at timestamptz,
  total_gain numeric(10, 2),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table PARTICIPANT (un participant à un tirage)
-- ------------------------------------------------------------
create table if not exists participant (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draw (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Table TICKET (photo d'un ticket acheté pour un tirage)
-- ------------------------------------------------------------
create table if not exists ticket (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references draw (id) on delete cascade,
  image_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists participant_draw_id_idx on participant (draw_id);
create index if not exists ticket_draw_id_idx on ticket (draw_id);

-- ============================================================
-- RLS (Row Level Security)
--
-- Lecture : ouverte à tous (page publique du tirage, sans compte).
-- Écriture : réservée aux utilisateurs authentifiés (l'admin, Christian).
-- ============================================================

alter table draw enable row level security;
alter table participant enable row level security;
alter table ticket enable row level security;

-- Lecture publique
create policy "draw_public_read" on draw for select using (true);
create policy "participant_public_read" on participant for select using (true);
create policy "ticket_public_read" on ticket for select using (true);

-- Écriture réservée aux utilisateurs authentifiés (admin)
create policy "draw_admin_write" on draw for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "participant_admin_write" on participant for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "ticket_admin_write" on ticket for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================
-- Storage : bucket "tickets" pour les photos des tickets
--
-- Le bucket doit être créé manuellement (voir README), en mode PUBLIC
-- (lecture publique) pour que les photos s'affichent sur la page du tirage.
-- Les policies ci-dessous protègent l'écriture (upload/suppression).
-- ============================================================

create policy "tickets_bucket_public_read" on storage.objects for select
  using (bucket_id = 'tickets');

create policy "tickets_bucket_admin_write" on storage.objects for insert
  with check (bucket_id = 'tickets' and auth.role() = 'authenticated');

create policy "tickets_bucket_admin_delete" on storage.objects for delete
  using (bucket_id = 'tickets' and auth.role() = 'authenticated');

-- ============================================================
-- Données de démonstration (facultatif)
--
-- Décommentez et exécutez le bloc ci-dessous pour créer un tirage
-- de démonstration avec des participants fictifs.
-- ============================================================

-- insert into draw (title, draw_date, participation_amount)
-- values ('Loto du samedi 19 septembre 2026', '2026-09-19', 2.20)
-- returning id; -- notez l'id retourné, à réutiliser ci-dessous

-- insert into participant (draw_id, name) values
--   ('<id_du_tirage>', 'Christian'),
--   ('<id_du_tirage>', 'Michel'),
--   ('<id_du_tirage>', 'Sophie'),
--   ('<id_du_tirage>', 'Karim'),
--   ('<id_du_tirage>', 'Julie'),
--   ('<id_du_tirage>', 'Thomas'),
--   ('<id_du_tirage>', 'Nadia'),
--   ('<id_du_tirage>', 'David');
