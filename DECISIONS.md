# Cacao — DECISIONS.md

Registro de decisiones de producto y técnicas, para no repetir la discusión en
cada sesión. Actualizar cada vez que se tome una decisión nueva o se revierta una
existente (con fecha y motivo).

## Alcance
- **[2026-09] v1 es 100% financiero.** Toda la sección de juego (moneda,
  recompensas, Patrimonio/pueblo tipo Township, notificaciones de premios) es
  placeholder documentado para v2. Cero UI, cero lógica de juego en v1.
- Fuera de alcance v1: inversión, interés compuesto, proyección de retiro.

## Bancos y bot de correos
- Prioridad de bancos v1: **Santander, Nu, Plata, BBVA**. Todos confirmados con
  notificación por correo. Solo México por ahora.
- Acceso al correo: **API/OAuth únicamente**, nunca IMAP con credenciales.
- Aprendizaje de descriptores: **por usuario únicamente**. Se descartó una tabla
  cross-usuario de Transaction_IDs (violaba la regla de privacidad); solo
  Formatos_correos es compartida entre usuarios, y solo contiene el patrón
  técnico del correo (remitente/formato), nunca montos ni datos de transacciones.
- Créditos: `credit_expense` (gasto) vs. `credit_payment` (pago de deuda) — tipos
  distintos para no duplicar gasto.
- Reembolsos: el bot detecta correo de devolución por el mismo monto que un gasto
  existente, lo flagea, y **pide confirmación al usuario**. Al confirmar, el
  gasto original se **cancela/anula** (no se registra el reembolso como ingreso
  aparte).
- Retención de correos: **48h de colchón en producción** tras extraer los datos
  (por reintentos); **7 días en Beta** para testing.
- **[2026-09] Arquitectura confirmada** — detalle completo en
  `docs/email-bot-architecture.md`. Resumen:
  - Suscripción vía Gmail `watch()` (Google Cloud Pub/Sub) y Microsoft
    Graph `subscriptions`, no polling — con jobs de renovación antes de
    que expiren (7 días Gmail, ~3 días Graph).
  - El bot filtra por remitente permitido (`formatos_correos`) **antes**
    de leer el cuerpo de cualquier correo — nunca hace scan general del
    buzón.
  - Tokens OAuth cifrados en una tabla (`oauth_tokens`) sin ninguna
    policy de RLS — inaccesible incluso para el propio dueño desde el
    cliente, solo el rol de servicio del bot la toca.
  - Cargo duplicado (mismo monto/descriptor/cuenta, ventana corta) se
    flagea (`posible_duplicado_de`) como recomendación, nunca se
    fusiona/borra automático.
  - Banco no soportado o que cambió de formato: mismo flujo (usuario sube
    PDF de ejemplo → se agrega/actualiza `formatos_correos`), disparado
    también automáticamente cuando la tasa de extracción exitosa de un
    formato cae por debajo de un umbral.

## Categorías
Taxonomía v1 (fija + el usuario puede agregar propias):
Cafés, Carro, Ejercicio, Entretenimiento, Salud, Gasolina, Intereses Financieros,
Mascota, Random, Regalos, Restaurantes, Shopping Físico, Shopping Online, Snacks,
Social, Subscripciones, Super, Take-out, Transporte, Viajes, Cashback, Reembolso,
Transferencia.

Categorías especiales:
- **Intereses Financieros + Cashback → "Free money"** (ganancia por buenas
  decisiones financieras: interés, cashback, dividendos futuros).
- **Reembolso → cancela el gasto original** (no es ingreso aparte).
- **Transferencia → movimiento entre cuentas propias**, no afecta
  ingreso/gasto del dashboard.

Clasificación Fijo/Semi-fijo/Variable — asignación automática por categoría,
recategorizable por el usuario:
| Tipo | Categorías |
|---|---|
| Fijo | Subscripciones, Ejercicio si se detecta monto recurrente por descriptor (ej. gym) |
| Semi-fijo | Super, Gasolina, Carro, Transporte, Salud, Mascota |
| Variable | Take-out, Restaurantes, Cafés, Snacks, Entretenimiento, Shopping Físico, Shopping Online, Social, Viajes, Random, Regalos, Ejercicio (default) |
| N/A | Intereses Financieros, Cashback, Reembolso, Transferencia |

La detección de "monto recurrente por descriptor" se construye desde v1 (no se
pospuso a v2).
- **[2026-09] Algoritmo confirmado**: mismo monto (±1% de tolerancia) visto
  2+ veces con al menos 20 días entre cada ocurrencia → se fuerza
  `tipo_gasto = fijo` para esa categoría/descriptor, solo si la categoría
  es `variable` por default. Vive en `descriptores_usuario.monto_tipico` /
  `veces_mismo_monto` / `fecha_ultimo_monto_recurrente`. Detalle completo en
  `docs/email-bot-architecture.md`.

## Presupuesto y calificación
- Presupuesto sugerido automáticamente desde ingreso mensual con regla tipo
  50/30/20; ajustable por categoría por el usuario.
- Calificación de hábitos: **1-10**, pesos:
  - 40% tasa de ahorro del periodo
  - 20% ganancia de ahorro neta (Free money vs. periodo anterior)
  - 40% cumplimiento de las 3 Estrategias del Plan de Juego
  - 4to factor (inversión) reservado con peso 0 para v2.
- Periodo (semanal/mensual) con fecha de corte configurable por el usuario
  (inicio de mes o quincena).

## Predicción y autocompletado (categorización)
- **[2026-09]** Enfoque v1: simple, basado en frecuencia — sin ML pesado, sin
  entrenamiento de modelos. Determinístico y explicable.
- Normalización de descriptor: limpiar el texto crudo del correo (folios,
  fechas, espacios extra) para agrupar variantes del mismo comercio.
- Tabla de frecuencia **por usuario**: `descriptor_normalizado → categoría,
  nombre limpio, tipo (fijo/semi-fijo/variable)`.
  - Si el descriptor ya se vio 2+ veces con la misma categoría para ese
    usuario → autoasignación directa (no pasa por revisión).
  - Si es la primera vez o hay categorías mixtas previas → va a "Necesita
    revisión" con la opción más probable pre-seleccionada.
- Cold start (usuario nuevo sin historial): catálogo genérico de
  comercio→categoría (dato público de qué tipo de negocio es un comercio, ej.
  "OXXO" → Super/Snacks) — no contiene datos de transacciones de ningún
  usuario, así que no rompe la regla de privacidad. Vive en una tabla
  compartida separada de Formatos_correos.

## Sugerencias financieras informadas (Plan de Juego)
- **[2026-09]** Se pospuso el uso de marcos de libros específicos (Ramit
  Sethi, Morgan Housel, Vicki Robin, etc.) para una sesión futura — el usuario
  definirá la lógica paso a paso. No construir un motor de reglas basado en
  libros todavía.
- Mecánicas ya decididas mientras tanto:
  - **Fondo de emergencia:** al crear la meta, la app pregunta si el usuario
    tiene gastos altos inesperados con frecuencia (salud, mantenimiento de
    carro, etc.). Si responde que sí → sugiere 6 meses de gasto fijo como
    meta; si no → sugiere 3 meses.
  - **Energía de vida / salario real por hora:** descartado, no se
    implementa.
  - **Opinión de la app sobre la meta de ahorro:** se muestra al momento de
    crearla (basada en el ingreso registrado), y puede reaparecer como
    recordatorio si la meta no se cumple por varios periodos seguidos.
  - **Atribución de fuente (para cuando se agreguen reglas basadas en
    libros/autores):** oculta por default; solo visible si el usuario pica un
    ícono de libro junto al mensaje de recomendación. Nunca se cita texto
    verbatim de un libro, solo se referencia el nombre del marco/autor.

## Cuentas y usuarios
- Una cuenta Cacao = una persona. Sin cuentas compartidas/familiares en v1.
- Login social permitido (Sign in with Apple recomendado por políticas de App
  Store) + email/contraseña. El correo de tracking se configura por separado
  después del login.

## Registro manual e ingresos no ordinarios
- Sección de registro rápido (gastos en efectivo, ingresos no ordinarios),
  diseñada para tomar segundos.
- Puede quedar sin categorizar; se resuelve después (bot o usuario en Revisión).
- Ingresos no ordinarios cuentan para la meta de ahorro y afectan el presupuesto
  en vivo. Se recomienda (no se obliga) destinarlos a ahorro.

## Reconciliación de transferencias contra gastos
- Caso de uso: gasto compartido, un tercero transfiere su parte después.
- Flujo: notificación al usuario → "Asignar después" o "Asignar" (menú rápido,
  GUI distinto según ingreso/gasto) → si aplica a un gasto reciente, el usuario
  busca en Movimientos filtrando por categoría → se **crea un registro nuevo
  vinculado** al gasto original (no se sobrescribe el monto original) → en
  Movimientos, el gasto original muestra indicador visual del descuento; al
  hacer clic se ve cuánto, cuándo y quién transfirió.
- Distinto de Reembolso: aquí el gasto original se mantiene visible completo, el
  descuento es información vinculada, no una anulación.

## Notificaciones
Configurables por tipo durante el setup:
- Límite de presupuesto semanal alcanzado.
- Cierre de periodo positivo vs. metas.
- Transacción desconocida — con asignación rápida en el momento.
- (Reservado v2, no construir: premios del sistema in-game.)

## Privacidad (regla dura)
- Nunca se comparten gastos, montos o patrones de consumo con terceros.
- El bot solo lee correos que matcheen el patrón bancario configurado.
- Sin base de datos cross-usuario de transacciones/montos/patrones. Solo
  Formatos_correos es compartida, y solo contiene el patrón técnico del correo.

## Monetización
- Todas las features gratis desde el día 1 durante el trial (1-3 meses).
- Después, suscripción mensual o anual — precio a definir con datos de mercado.
- Sin tier premium en v1.

## Plataforma
- **[2026-09] v1 es web app** (responsive, uso desde iOS y Android por
  navegador), no una app nativa. Publicarla en App Store/Play Store queda
  como decisión post-Beta — si se hace, la ruta preferida es envolver la
  misma web app con Capacitor en vez de reescribir nativo. Ver
  `docs/stack-proposal.md` para el detalle y las implicaciones (sobre todo
  en notificaciones push en iOS).

## Marca
- **[2026-09] Logo no oficial/temporal**: ilustración de una vaina de cacao
  abierta (estilo grabado, blanco y negro), provista por el usuario, guardada
  en `assets/logo-temporal.png`. Se usa como placeholder en el logo mark del
  onboarding hasta que exista un logo oficial definitivo.

## Stack técnico
- **[2026-09] Confirmado.** Ver `docs/stack-proposal.md` para el detalle
  completo y la justificación de cada elección.
  - Cliente: Next.js (React) + TypeScript, PWA responsive (iOS/Android por
    navegador).
  - Backend-as-a-service: Supabase — Postgres + Auth (Apple/Google/email) +
    Row Level Security (fuerza la regla de privacidad por-usuario a nivel de
    base de datos).
  - Bot de correos: servicio separado en Node.js + TypeScript (Fly.io o
    Railway), con `googleapis` (Gmail) y Microsoft Graph SDK (Outlook).
  - Cola de background jobs: Redis + BullMQ.
  - Notificaciones: Web Push (VAPID) — con la limitación conocida de que en
    iOS solo funciona si el usuario agregó la app a su pantalla de inicio,
    en iOS 16.4+. Mitigado con onboarding que empuja ese paso, más
    "Necesita revisión" apareciendo primero en Movimientos como respaldo.
  - Suscripciones: Stripe Billing (checkout web).
  - ORM: Prisma o Drizzle.

## Pendientes / abiertos
- Confirmar con Plata el formato exacto de sus correos de notificación antes de
  construir el parser específico.
- Definir precio de suscripción con datos de mercado (post-lanzamiento de Beta).
- Mecánica exacta de moneda de juego y conexión con el Patrimonio — pendiente
  para cuando se abra la discusión de v2.

## Proceso de trabajo
- **[2026-09]** Orden de trabajo confirmado: primero exploración de diseño
  visual (`/design`) de las pantallas principales (Onboarding, Panel
  principal, Movimientos, Plan de Juego, Registro rápido) con iteración y
  aprobación del usuario. No se construye lógica de backend, bot de correos,
  ni esquema de base de datos hasta que el diseño esté aprobado.
