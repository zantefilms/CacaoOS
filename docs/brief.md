# Cacao — Brief de construcción v1

## Visión
Cacao es una app de finanzas personales gamificada para iOS. El problema real:
la mayoría de la gente no sabe en qué se le va el dinero, y depende de cada persona
planear su propia jubilación. Cacao automatiza el tracking de gastos y, en el
futuro (v2+), usará mecánicas de juego (recompensas, moneda del juego, construcción
de un "Patrimonio" tipo Township) para reforzar buenos hábitos financieros.

**Para v1: cero UI y cero lógica de juego.** Todo lo relacionado a gamificación
(moneda, recompensas, Patrimonio, notificaciones de premios) es un placeholder
documentado para v2 — no se construye nada de esto ahora. v1 se enfoca 100% en que
el tracking financiero funcione bien.

## Usuario objetivo
Personas con ingreso propio en México a quienes les cuesta controlar sus gastos:
quieren ahorrar/invertir más pero les falta disciplina, conocimiento o herramientas.
Una cuenta Cacao = una persona (sin cuentas compartidas/familiares en v1).

## Alcance del MVP (v1)
1. Registro automático de transacciones vía escaneo de correos bancarios (OAuth,
   nunca credenciales).
2. Registro manual rápido de gastos en efectivo e ingresos no ordinarios.
3. Categorización automática de gastos, editable por el usuario.
4. Reconciliación de transferencias entrantes contra gastos recientes.
5. Reporte semanal/mensual de hábitos de gasto + recomendaciones.
6. Plan de Juego (nombre se mantiene, pero es 100% financiero en v1): Metas de
   ahorro + 3 Estrategias prioritarias por periodo. Sin mecánica de juego.

**Explícitamente fuera de alcance en v1:** inversión, interés compuesto, proyección
de retiro, construcción visual del Patrimonio/pueblo, moneda de juego, sistema de
recompensas, notificaciones de premios in-game.

## Flujo de usuario
**Onboarding:** registro (correo+contraseña o login social — Sign in with Apple
recomendado por políticas de App Store) → selección del correo de tracking
(distinto al de login, con recomendación de crear uno dedicado) → tutorial de
cómo activar alertas bancarias por correo → cuestionario de perfil (ingreso
mensual, cuentas a rastrear con dropdown de banco, día de corte del periodo:
inicio de mes o quincena) → setup de notificaciones (el usuario elige cuáles
quiere recibir, ver sección de Notificaciones) → tour de la app.

**Uso recurrente:** el usuario abre la app para revisar sus hábitos; el resto del
tiempo la app recopila datos en background vía el bot de correos. Para gastos en
efectivo o ingresos no ordinarios, debe poder registrarlos manualmente en
segundos desde cualquier pantalla.

## Pantallas
1. **Onboarding/Auth**
2. **Panel principal (Dashboard):** gasto del periodo, presupuesto restante,
   calificación de hábitos (1-10, ver fórmula abajo), gráfico ingresos vs gastos,
   tasa de ahorro, categoría con más gasto, "Free money" del periodo.
3. **Movimientos:** tabla de transacciones (Fecha Operación, Descriptor crudo,
   Nombre limpio, Monto, Tipo físico/digital, Cuenta, Categoría), orden por fecha
   desc, filtrable, editable. Botón "Necesita revisión" para transacciones sin
   clasificar. Las transacciones con reconciliación de transferencia muestran un
   indicador visual; al hacer clic se ve el detalle del descuento (cuánto, cuándo,
   quién transfirió).
4. **Plan de Juego** (nombre mantenido, contenido 100% financiero en v1):
   - Estrategias: top 3 recomendaciones del periodo.
   - Metas: ahorro objetivo del periodo y anual.
   - Recomendaciones críticas de la app.
   - Vista de gastos Fijo/Semi-fijo/Variable con % por tipo.
5. **Registro rápido** (modal accesible desde cualquier pantalla): registrar gasto
   en efectivo o ingreso no ordinario en segundos. Puede quedar sin categorizar;
   se resuelve después por el usuario o el bot en Revisión.

## Categorías (taxonomía v1 — fija, con posibilidad de que el usuario agregue más)
Cafés, Carro, Ejercicio, Entretenimiento, Salud, Gasolina, Intereses Financieros,
Mascota, Random, Regalos, Restaurantes, Shopping Físico, Shopping Online, Snacks,
Social, Subscripciones, Super, Take-out, Transporte, Viajes, Cashback, Reembolso,
Transferencia.

**Categorías especiales (no son gasto real, tratamiento distinto en el dashboard):**
- **Intereses Financieros y Cashback** → cuentan como "Free money" (dinero ganado
  por buenas decisiones financieras: interés, cashback, dividendos futuros).
- **Reembolso** → cuando se confirma, **cancela/anula el gasto original** (el gasto
  neto de esa categoría queda en $0, no se registra como ingreso aparte).
- **Transferencia** → movimiento entre cuentas propias del usuario. No afecta el
  cálculo de ingreso/gasto del dashboard; solo se registra para que Movimientos
  quede completo.

### Clasificación Fijo / Semi-fijo / Variable (asignación automática por categoría,
recategorizable por el usuario)
| Tipo | Categorías |
|---|---|
| Fijo | Subscripciones. También Ejercicio si se detecta el mismo monto recurrente por descriptor (ej. mensualidad de gimnasio) |
| Semi-fijo | Super, Gasolina, Carro, Transporte, Salud, Mascota |
| Variable | Take-out, Restaurantes, Cafés, Snacks, Entretenimiento, Shopping Físico, Shopping Online, Social, Viajes, Random, Regalos, y Ejercicio por default (ej. compra única de tenis) |
| N/A (no es gasto) | Intereses Financieros, Cashback, Reembolso, Transferencia |

La detección de "mismo monto recurrente por descriptor" (para Ejercicio → Fijo)
debe implementarse desde v1.

## Presupuesto y calificación de hábitos
- **Presupuesto:** la app lo sugiere automáticamente a partir del ingreso mensual
  usando una regla tipo 50/30/20, ajustable por el usuario por categoría.
- **Calificación de hábitos:** número entero de **1 a 10**, calculado con estos
  pesos:
  - 40% — Tasa de ahorro del periodo (Ingreso − Gasto) / Ingreso vs. la meta
    definida por el usuario.
  - 20% — Ganancia de ahorro neta ("Free money" del periodo vs. periodo anterior).
  - 40% — Cumplimiento de las 3 Estrategias del Plan de Juego.
  - Dejar un 4to factor reservado (peso 0 en v1) para "hábito/objetivo de
    inversión cumplido", para activarse en v2 sin rediseñar la fórmula.
- El periodo (semanal/mensual) tiene fecha de corte configurable por el usuario
  (inicio de mes o quincena).

## Ingresos no ordinarios y registro manual
- Sección de registro rápido para gastos en efectivo e ingresos no ordinarios
  (freelance, comisiones, etc.), pensada para tomar segundos.
- Los ingresos no ordinarios **cuentan para la meta de ahorro** y afectan
  directamente el cálculo del presupuesto en vivo. La app recomienda (no obliga)
  destinarlos directo a ahorro.
- Todo registro manual puede quedar sin categorizar si el usuario lo prefiere.

## Predicción y autocompletado de categorización
Para v1, usar un enfoque simple basado en frecuencia — **no machine learning**,
determinístico y explicable:
- Normalizar el descriptor crudo del correo (quitar folios, fechas, espacios
  extra) para agrupar variantes del mismo comercio.
- Mantener una tabla de frecuencia **por usuario**:
  `descriptor_normalizado → categoría, nombre limpio, tipo`.
  - Si el descriptor ya se vio 2+ veces con la misma categoría para ese
    usuario, autoasignar directo (sin pasar por revisión).
  - Si es la primera vez o hubo categorías mixtas antes, mandar a "Necesita
    revisión" con la opción más probable pre-seleccionada.
- **Cold start:** para usuarios nuevos sin historial, usar un catálogo
  genérico de comercio→categoría (información pública de qué tipo de negocio
  es un comercio, ej. "OXXO" → Super/Snacks) en una tabla compartida separada
  de Formatos_correos. Esta tabla nunca contiene datos de transacciones reales
  de ningún usuario.

## Sugerencias financieras informadas (dentro del Plan de Juego)
**No construir un motor de reglas basado en libros o marcos externos en esta
fase** — el dueño del producto va a definir esa lógica paso a paso en una
sesión futura. Sí construir estas mecánicas base, que son independientes de
cualquier marco externo:
- **Fondo de emergencia:** al crear una meta de este tipo, preguntar al
  usuario si tiene gastos altos inesperados con frecuencia (salud,
  mantenimiento de carro, etc.). Si responde que sí, sugerir una meta de 6
  meses de gasto fijo; si no, sugerir 3 meses.
- **Opinión de la app sobre metas de ahorro:** al momento de crear una meta,
  mostrar una opinión basada en el ingreso registrado del usuario (ej. si es
  baja o alta en proporción a su ingreso). Esta opinión puede reaparecer como
  recordatorio si la meta no se cumple por varios periodos seguidos.
- **No implementar** ningún campo de "salario real por hora" ni métricas de
  tiempo/energía de vida.
- **Diseño de atribución (para el futuro):** dejar previsto en el diseño de
  las tarjetas de recomendación un ícono de libro opcional que, al hacer clic,
  revele la fuente/autor de una regla — oculto por default para no saturar el
  dashboard. No implementar contenido de atribución todavía, solo el patrón de
  UI para que sea fácil de enchufar después.

## Reconciliación de transferencias entrantes contra gastos
Caso de uso: el usuario paga una cuenta compartida (ej. cena) y luego recibe una
transferencia de un amigo cubriendo su parte. Flujo:
1. La app detecta un ingreso o gasto no reconocido y **notifica al usuario** para
   que lo asigne.
2. El usuario elige entre **"Asignar después"** (queda pendiente, se resuelve
   luego desde la app) o **"Asignar"** (abre un menú rápido). El GUI de este menú
   se adapta según si es ingreso o gasto.
3. Si es un ingreso que corresponde a un gasto reciente compartido, el usuario
   navega la lista de Movimientos recientes, **filtrable por categoría** (ej.
   filtrar por "Restaurantes" para encontrar la cena rápido usando el descriptor).
4. Al vincular, se **crea un registro nuevo** (no se sobrescribe el gasto
   original). En la vista de Movimientos, el gasto original muestra un indicador
   visual de que tuvo un descuento; al hacer clic se ve el detalle: cuánto se
   descontó, cuándo, y quién transfirió.

Esto es una función distinta a Reembolso (que cancela el gasto original a $0) —
aquí el gasto original se mantiene visible con su monto completo, y el descuento
se muestra como información vinculada.

## Movimientos entre cuentas propias
Ver "Transferencia" arriba — no afecta el dashboard de ingreso/gasto.

## Modelo de datos (entidades mínimas)
- **Usuario:** email de login, email de tracking, ingreso mensual, día de corte
  del periodo, cuentas registradas, preferencias de notificación.
- **Cuenta:** nombre asignado por el usuario, banco, tipo.
- **Movimientos_usuario:** id_transacción, monto, terminación de cuenta, fecha,
  hora, descriptor crudo del correo, nombre limpio, categoría, tipo
  Fijo/Semi-fijo/Variable, estado (necesita_revisión/ok), flags de
  reembolso/reconciliación.
- **Reconciliaciones:** registro nuevo vinculado a un movimiento original —
  monto descontado, fecha, origen (quién transfirió).
- **Formatos_correos:** banco, patrón de asunto/remitente, mapeo de dónde extraer
  cada campo. Tabla compartida entre usuarios del mismo banco (sin datos
  personales ni montos — solo el patrón/formato del correo).
- **Descriptores_usuario:** mapeo de descriptor crudo → nombre limpio + categoría,
  aprendido **por usuario únicamente** (sin compartir cross-usuario, por
  privacidad).

## Bot de escaneo de correos
- Bancos a priorizar en el catálogo de Formatos_correos: **Santander, Nu, Plata,
  BBVA** (todos confirmados con notificación por correo). Solo México en v1.
- Acceso al correo **únicamente vía API/OAuth** — nunca IMAP con credenciales.
- El bot solo lee correos que matcheen el remitente/formato del banco registrado;
  nunca abre otros correos del usuario.
- Extrae únicamente: ID de transacción, monto, terminación de cuenta, fecha, hora.
- Aprendizaje de descriptores: cuando el usuario corrige manualmente una
  transacción, el sistema debe recordarlo **por ese usuario** para la próxima vez
  que vea un descriptor similar (sin compartir esto entre usuarios).
- **Créditos:** distinguir `credit_expense` (gasto con tarjeta de crédito) de
  `credit_payment` (pago para liquidar la deuda), para no duplicar el gasto.
- **Reembolsos:** si el bot detecta un correo de devolución/cancelación por el
  mismo monto que un gasto existente, lo flagea como posible reembolso y **pide
  confirmación al usuario** antes de cancelar el gasto original.
- **Formato de banco no soportado:** el usuario exporta un correo de ejemplo a
  PDF, lo sube, y ese formato se agrega a Formatos_correos (reutilizable para
  otros usuarios del mismo banco — solo el patrón, nunca datos personales).
- El bot debe poder detectar cuando un banco cambia su formato de correo y pedir
  al usuario que suba una versión actualizada.
- **Retención de correos:** se borran del lado de la app una vez extraídos los
  datos, con un colchón de 48 horas en producción (por si falla la extracción y
  se necesita reintentar). En Beta, se conservan 7 días para fines de testing.

## Notificaciones
Configurables por el usuario durante el setup, granulares por tipo:
- Límite de presupuesto semanal alcanzado.
- Cierre de periodo positivo respecto a metas (felicitación).
- Transacción desconocida que necesita categorización — con acceso rápido
  (un par de clicks) para asignar categoría en el momento, para no olvidar de
  qué fue el gasto.
- *(Reservado para v2, no construir en v1: notificaciones de premios/recompensas
  del sistema in-game.)*

## Privacidad (regla dura, no negociable)
- Nunca se comparten gastos, montos o patrones de consumo con terceros.
- El bot solo tiene acceso de lectura a correos que matcheen el patrón bancario
  configurado por el usuario.
- El aprendizaje de descriptores es estrictamente por usuario — no existe una
  base de datos cross-usuario de transacciones, montos o patrones de consumo.
  Formatos_correos es la única tabla compartida entre usuarios, y solo contiene
  el patrón técnico del formato de correo del banco, nunca datos de transacciones
  reales.

## Monetización
Acceso gratuito a todas las features desde el día 1, durante 1-3 meses de trial.
Después, suscripción mensual o anual (precio a definir con datos de mercado).
Sin tier premium en v1 — todo el mundo tiene acceso completo durante el trial.

## Plataforma
iOS (iPhone) primero.

## Orden de trabajo: diseño antes que lógica
Antes de construir cualquier lógica de backend, bot de correos, o base de
datos, quiero **explorar el diseño visual de la app con `/design`** y ver
posibles layouts de las pantallas (Onboarding, Panel principal, Movimientos,
Plan de Juego, Registro rápido) para poder iterar sobre la interfaz primero.
No avances a construir la lógica funcional hasta que el diseño de las
pantallas esté aprobado.

## Lo que necesito que hagas
1. Usa `/design` primero para proponer y explorar layouts de las pantallas
   principales (ver "Orden de trabajo" arriba). Espera mi aprobación del
   diseño antes de pasar a construir lógica o backend.
2. Antes de escribir código de backend, propón el stack técnico (frontend +
   backend + DB) y justifica la elección para este caso (background email
   scanning vía OAuth, procesamiento de correo, notificaciones push).
3. Diseña el esquema de base de datos completo para las entidades de arriba.
4. Plantea la arquitectura del servicio de escaneo de correos (conexión a
   Gmail/Outlook vía OAuth, procesamiento en background, catálogo compartido de
   Formatos_correos sin exponer datos personales).
5. Propón la lógica de detección de "monto recurrente por descriptor" para la
   clasificación Fijo/Variable de categorías ambiguas como Ejercicio.
6. Propón una estructura de proyecto/repo y arranca con el andamiaje antes de
   construir pantallas completas.
7. Registra cada decisión técnica importante (stack, arquitectura, esquema de DB)
   en `DECISIONS.md` dentro del repo.
8. Si algo no está claro, pregunta antes de asumir.
