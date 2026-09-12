-- ============================================================
-- Loto entre collègues — données de démonstration
--
-- À exécuter après schema.sql, dans l'éditeur SQL Supabase.
-- Crée un tirage de démo avec 8 participants fictifs.
-- ============================================================

with new_draw as (
  insert into draw (title, draw_date, participation_amount)
  values ('Loto du samedi 19 septembre 2026', '2026-09-19', 2.20)
  returning id
)
insert into participant (draw_id, name)
select id, name
from new_draw
cross join (
  values
    ('Christian'),
    ('Michel'),
    ('Sophie'),
    ('Karim'),
    ('Julie'),
    ('Thomas'),
    ('Nadia'),
    ('David')
) as names (name);
