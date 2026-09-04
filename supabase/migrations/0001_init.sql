-- Cacao v1 — esquema inicial
-- Ver docs/db-schema.md para el razonamiento completo de cada tabla y política.

-- ============================================================
-- Enums
-- ============================================================

create type banco as enum ('santander', 'nu', 'plata', 'bbva', 'otro');
create type cuenta_tipo as enum ('debito', 'credito');
create type corte_tipo as enum ('mensual', 'quincenal');
create type subscription_status as enum ('trial', 'activa', 'vencida', 'cancelada');
create type gasto_tipo as enum ('fijo', 'semi_fijo', 'variable', 'na');
create type movimiento_medio as enum ('fisico', 'digital');
create type movimiento_origen as enum ('bot', 'manual');
create type movimiento_estado as enum ('ok', 'necesita_revision');
create type credit_kind as enum ('credit_expense', 'credit_payment');
create type meta_tipo as enum ('periodo', 'anual', 'fondo_emergencia');
create type notificacion_tipo as enum (
  'limite_presupuesto',
  'cierre_periodo',
  'transaccion_desconocida',
  'recomendaciones_app'
);
create type formato_correo_fuente as enum ('equipo', 'usuario_pdf');

-- ============================================================
-- public.users — perfil, 1:1 con auth.users
-- ============================================================

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  tracking_email text,
  salario_fijo_mensual numeric(12, 2),
  ingreso_no_fijo_aproximado numeric(12, 2),
  corte_tipo corte_tipo not null default 'mensual',
  corte_dia smallint,
  stripe_customer_id text,
  subscription_status subscription_status not null default 'trial',
  trial_ends_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users select own" on public.users
  for select using (id = auth.uid());
create policy "users update own" on public.users
  for update using (id = auth.uid());
create policy "users insert own" on public.users
  for insert with check (id = auth.uid());

-- ============================================================
-- cuentas
-- ============================================================

create table public.cuentas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  banco banco not null,
  nombre text not null,
  tipo cuenta_tipo not null,
  terminacion text check (char_length(terminacion) <= 4),
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.cuentas enable row level security;

create policy "cuentas all own" on public.cuentas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- categorias — sistema (user_id null) + propias del usuario
-- ============================================================

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete cascade,
  nombre text not null,
  tipo_default gasto_tipo not null,
  es_especial boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, nombre)
);

alter table public.categorias enable row level security;

create policy "categorias select system or own" on public.categorias
  for select using (user_id is null or user_id = auth.uid());
create policy "categorias write own" on public.categorias
  for insert with check (user_id = auth.uid());
create policy "categorias update own" on public.categorias
  for update using (user_id = auth.uid());
create policy "categorias delete own" on public.categorias
  for delete using (user_id = auth.uid());

-- ============================================================
-- movimientos
-- ============================================================

create table public.movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  cuenta_id uuid references public.cuentas (id) on delete set null,
  categoria_id uuid references public.categorias (id) on delete set null,
  id_transaccion_externo text,
  monto numeric(12, 2) not null,
  fecha_operacion date not null,
  hora_operacion time,
  descriptor_crudo text,
  nombre_limpio text not null,
  tipo_gasto gasto_tipo not null default 'na',
  medio movimiento_medio not null,
  credit_kind credit_kind,
  origen movimiento_origen not null,
  estado movimiento_estado not null default 'necesita_revision',
  reembolsado boolean not null default false,
  fecha_reembolso timestamptz,
  monto_reembolso numeric(12, 2),
  created_at timestamptz not null default now()
);

create unique index movimientos_dedupe_idx
  on public.movimientos (user_id, cuenta_id, id_transaccion_externo)
  where id_transaccion_externo is not null;

create index movimientos_user_fecha_idx on public.movimientos (user_id, fecha_operacion desc);
create index movimientos_user_estado_idx on public.movimientos (user_id, estado);

alter table public.movimientos enable row level security;

create policy "movimientos all own" on public.movimientos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- reconciliaciones
-- ============================================================

create table public.reconciliaciones (
  id uuid primary key default gen_random_uuid(),
  movimiento_original_id uuid not null references public.movimientos (id) on delete cascade,
  monto_descontado numeric(12, 2) not null,
  fecha timestamptz not null default now(),
  origen_texto text,
  movimiento_vinculado_id uuid references public.movimientos (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.reconciliaciones enable row level security;

create policy "reconciliaciones all via movimiento" on public.reconciliaciones
  for all using (
    exists (
      select 1 from public.movimientos m
      where m.id = movimiento_original_id and m.user_id = auth.uid()
    )
  );

-- ============================================================
-- descriptores_usuario — NUNCA compartida entre usuarios
-- ============================================================

create table public.descriptores_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  descriptor_normalizado text not null,
  nombre_limpio text not null,
  categoria_id uuid not null references public.categorias (id),
  veces_visto int not null default 1,
  categorias_mixtas boolean not null default false,
  monto_tipico numeric(12, 2),
  veces_mismo_monto int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, descriptor_normalizado)
);

alter table public.descriptores_usuario enable row level security;

create policy "descriptores all own" on public.descriptores_usuario
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- formatos_correos — compartida, sin datos de transacciones. Solo el rol
-- de servicio escribe; se expone lectura a cualquier usuario autenticado.
-- ============================================================

create table public.formatos_correos (
  id uuid primary key default gen_random_uuid(),
  banco banco not null,
  patron_remitente text not null,
  patron_asunto text,
  mapeo_campos jsonb not null default '{}'::jsonb,
  version int not null default 1,
  activo boolean not null default false,
  fuente formato_correo_fuente not null default 'equipo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.formatos_correos enable row level security;

create policy "formatos_correos select all authenticated" on public.formatos_correos
  for select using (auth.role() = 'authenticated');
-- Sin policy de insert/update/delete: solo el rol de servicio (que
-- bypassa RLS) puede escribir aquí.

-- ============================================================
-- comercios_genericos — catálogo cold start, compartido, sin datos de
-- usuario. Mismo modelo de acceso que formatos_correos.
-- ============================================================

create table public.comercios_genericos (
  id uuid primary key default gen_random_uuid(),
  patron_comercio text not null,
  categoria_id uuid not null references public.categorias (id),
  nombre_limpio_sugerido text not null
);

alter table public.comercios_genericos enable row level security;

create policy "comercios_genericos select all authenticated" on public.comercios_genericos
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- metas
-- ============================================================

create table public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  tipo meta_tipo not null,
  monto_objetivo numeric(12, 2) not null,
  gastos_altos_frecuentes boolean,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.metas enable row level security;

create policy "metas all own" on public.metas
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- presupuestos
-- ============================================================

create table public.presupuestos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  categoria_id uuid not null references public.categorias (id),
  monto_mensual numeric(12, 2) not null,
  updated_at timestamptz not null default now(),
  unique (user_id, categoria_id)
);

alter table public.presupuestos enable row level security;

create policy "presupuestos all own" on public.presupuestos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- notificacion_preferencias
-- ============================================================

create table public.notificacion_preferencias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  tipo notificacion_tipo not null,
  activo boolean not null default true,
  unique (user_id, tipo)
);

alter table public.notificacion_preferencias enable row level security;

create policy "notif_prefs all own" on public.notificacion_preferencias
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- calificaciones_periodo
-- ============================================================

create table public.calificaciones_periodo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  periodo_inicio date not null,
  periodo_fin date not null,
  calificacion smallint not null check (calificacion between 1 and 10),
  tasa_ahorro numeric(6, 4),
  ganancia_ahorro_neta numeric(12, 2),
  estrategias_cumplidas_pct numeric(5, 2),
  created_at timestamptz not null default now(),
  unique (user_id, periodo_inicio)
);

alter table public.calificaciones_periodo enable row level security;

create policy "calificaciones all own" on public.calificaciones_periodo
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- correos_recibidos — solo metadata de retención, nunca el contenido
-- ============================================================

create table public.correos_recibidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  message_id text not null,
  fecha_recibido timestamptz not null default now(),
  fecha_procesado timestamptz,
  extraido_ok boolean,
  fecha_borrado_programada timestamptz not null,
  borrado boolean not null default false,
  unique (user_id, message_id)
);

create index correos_borrado_pendiente_idx
  on public.correos_recibidos (fecha_borrado_programada)
  where borrado = false;

alter table public.correos_recibidos enable row level security;

create policy "correos all own" on public.correos_recibidos
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- Seed: taxonomía de categorías v1 (DECISIONS.md)
-- ============================================================

insert into public.categorias (nombre, tipo_default, es_especial) values
  ('Cafés', 'variable', false),
  ('Carro', 'semi_fijo', false),
  ('Ejercicio', 'variable', false), -- default; se fuerza a 'fijo' por monto recurrente (ver docs/db-schema.md)
  ('Entretenimiento', 'variable', false),
  ('Salud', 'semi_fijo', false),
  ('Gasolina', 'semi_fijo', false),
  ('Intereses Financieros', 'na', true),
  ('Mascota', 'semi_fijo', false),
  ('Random', 'variable', false),
  ('Regalos', 'variable', false),
  ('Restaurantes', 'variable', false),
  ('Shopping Físico', 'variable', false),
  ('Shopping Online', 'variable', false),
  ('Snacks', 'variable', false),
  ('Social', 'variable', false),
  ('Subscripciones', 'fijo', false),
  ('Super', 'semi_fijo', false),
  ('Take-out', 'variable', false),
  ('Transporte', 'semi_fijo', false),
  ('Viajes', 'variable', false),
  ('Cashback', 'na', true),
  ('Reembolso', 'na', true),
  ('Transferencia', 'na', true);

-- ============================================================
-- Seed: catálogo de bancos v1 (formatos por confirmar — ver
-- "Pendientes / abiertos" en DECISIONS.md, sobre todo Plata)
-- ============================================================

insert into public.formatos_correos (banco, patron_remitente, activo) values
  ('santander', 'notificaciones@santander.com.mx', false),
  ('nu', 'notificaciones@nu.com.mx', false),
  ('plata', 'notificaciones@plata.com.mx', false),
  ('bbva', 'notificaciones@bbva.mx', false);
