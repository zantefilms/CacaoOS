-- Separa categorías de gasto vs. ingreso. Hasta ahora Registro rápido
-- ofrecía las mismas categorías (todas de gasto) sin importar si el
-- usuario registraba un gasto o un ingreso adicional — un ingreso no
-- debería poder clasificarse como "Take-out", por ejemplo.

create type categoria_direccion as enum ('gasto', 'ingreso');

alter table public.categorias
  add column direccion categoria_direccion not null default 'gasto';

-- Cashback e Intereses Financieros son dinero entrante ("Free money"),
-- aunque no participen del flujo normal de ingreso/gasto (es_especial).
update public.categorias
  set direccion = 'ingreso'
  where nombre in ('Cashback', 'Intereses Financieros');

-- Categorías de ingreso de sistema — punto de partida editable/ampliable
-- por el usuario (igual que las de gasto). La lista completa y
-- personalizada por usuario se captura en el onboarding (pendiente).
insert into public.categorias (nombre, tipo_default, es_especial, direccion) values
  ('Freelance', 'na', false, 'ingreso'),
  ('Comisiones', 'na', false, 'ingreso'),
  ('Venta', 'na', false, 'ingreso'),
  ('Regalo recibido', 'na', false, 'ingreso'),
  ('Otro ingreso', 'na', false, 'ingreso');
