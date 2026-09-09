-- =====================================================================
--  FRANK'S — Copa Mar del Plata 2026
--  Esquema de base de datos para Supabase (Postgres)
--  Pegar TODO esto en:  Supabase -> SQL Editor -> New query -> Run
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABLA COLEGIOS  (las inscripciones de los colegios)
-- ---------------------------------------------------------------------
create table if not exists public.colegios (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  division    text not null,
  email       text,
  celular     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) TABLA MOVIMIENTOS  (cada carga de puntos que hace el admin)
-- ---------------------------------------------------------------------
create table if not exists public.movimientos (
  id          uuid primary key default gen_random_uuid(),
  colegio_id  uuid not null references public.colegios(id) on delete cascade,
  tipo        text not null,          -- ej: 'consumo', 'ticket_profe', 'hinchada', 'foto_grupal', 'clasico', 'ajuste'
  puntos      integer not null,       -- puede ser negativo para correcciones
  detalle     text,                   -- ej: '2 panchos + 1 promo'
  created_at  timestamptz not null default now(),
  created_by  uuid default auth.uid() -- qué usuario admin lo cargó
);

create index if not exists idx_mov_colegio on public.movimientos(colegio_id);

-- ---------------------------------------------------------------------
-- 3) VISTA RANKING  (suma de puntos por colegio, para el ranking en vivo)
-- ---------------------------------------------------------------------
create or replace view public.ranking as
select
  c.id,
  c.nombre,
  c.division,
  coalesce(sum(m.puntos), 0)::int as puntos,
  count(m.id) filter (where m.puntos <> 0) as movimientos
from public.colegios c
left join public.movimientos m on m.colegio_id = c.id
group by c.id, c.nombre, c.division
order by puntos desc, c.nombre asc;

-- ---------------------------------------------------------------------
-- 4) SEGURIDAD (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.colegios     enable row level security;
alter table public.movimientos  enable row level security;

-- COLEGIOS:
--   * cualquiera (anon) puede INSCRIBIRSE (insert)
--   * cualquiera puede VER la lista de colegios (para el ranking / select del admin)
--   * solo usuarios logueados (admin) pueden borrar/editar
drop policy if exists "colegios_insert_publico" on public.colegios;
create policy "colegios_insert_publico"
  on public.colegios for insert
  to anon, authenticated
  with check (true);

drop policy if exists "colegios_select_publico" on public.colegios;
create policy "colegios_select_publico"
  on public.colegios for select
  to anon, authenticated
  using (true);

drop policy if exists "colegios_admin_update" on public.colegios;
create policy "colegios_admin_update"
  on public.colegios for update
  to authenticated
  using (true) with check (true);

drop policy if exists "colegios_admin_delete" on public.colegios;
create policy "colegios_admin_delete"
  on public.colegios for delete
  to authenticated
  using (true);

-- MOVIMIENTOS:
--   * cualquiera puede LEER (así el ranking en vivo suma bien desde el navegador)
--   * SOLO usuarios logueados (admin) pueden cargar / editar / borrar puntos
drop policy if exists "mov_select_publico" on public.movimientos;
create policy "mov_select_publico"
  on public.movimientos for select
  to anon, authenticated
  using (true);

drop policy if exists "mov_admin_insert" on public.movimientos;
create policy "mov_admin_insert"
  on public.movimientos for insert
  to authenticated
  with check (true);

drop policy if exists "mov_admin_update" on public.movimientos;
create policy "mov_admin_update"
  on public.movimientos for update
  to authenticated
  using (true) with check (true);

drop policy if exists "mov_admin_delete" on public.movimientos;
create policy "mov_admin_delete"
  on public.movimientos for delete
  to authenticated
  using (true);

-- =====================================================================
--  LISTO. Después, para crear el usuario admin:
--  Supabase -> Authentication -> Users -> Add user
--  (email + password que va a usar el equipo para entrar al panel)
-- =====================================================================
