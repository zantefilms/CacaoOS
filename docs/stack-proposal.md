# Cacao — Propuesta de stack técnico (v1)

Estado: **propuesta, pendiente de tu confirmación.** Una vez la ajustemos y la
apruebes, se registra como decisión final en `DECISIONS.md`.

**[2026-09] Cambio de plataforma**: v1 será **web app** (responsive, usable
desde iOS y Android por navegador), no una app nativa de iOS. Publicarla en
la App Store queda como decisión post-Beta. Ver "Qué cambia con la web app"
más abajo — el bot de correos y la base de datos casi no cambian, lo que
cambia es el cliente y las notificaciones push.

## Comparación de lenguajes para el backend

Preguntaste específicamente por esto, así que va aparte antes del resto de
la propuesta. El backend de Cacao es, en el fondo, un servicio que: habla
con Gmail API / Microsoft Graph vía OAuth, mantiene webhooks/suscripciones
vivas, parsea correos con reglas determinísticas (no ML), y escribe a
Postgres. Comparo los tres candidatos razonables para ese trabajo:

### Node.js + TypeScript
**Ventajas**
- SDKs oficiales y maduros para exactamente lo que necesitas: `googleapis`
  (Google, primera clase) y `@microsoft/microsoft-graph-client` (Outlook).
- Modelo de I/O asíncrono no-bloqueante — tu carga de trabajo real es
  esperar respuestas de red (Gmail, Graph, Postgres), no cómputo pesado.
  Node está construido justo para eso.
- Si el cliente es una web app en React/Next.js (ver abajo), usar TS en
  ambos lados significa **compartir tipos y validación** (ej. con Zod)
  entre frontend y backend — un solo modelo mental, menos bugs de
  contrato entre cliente y servidor.
- Las Edge Functions de Supabase corren TypeScript/Deno — quedarte en un
  solo lenguaje reduce el cambio de contexto en todo el stack.
- Ecosistema enorme para lo demás: BullMQ (colas), RevenueCat/Stripe SDKs,
  deploys simples (Railway, Fly.io, Vercel).

**Desventajas**
- El sistema de tipos es estructural y se borra en runtime — hay que ser
  disciplinado (Zod/io-ts) al validar datos externos (el HTML/texto crudo
  de un correo bancario) para no meter bugs de tipo silenciosos.
- Débil para cómputo numérico pesado — irrelevante aquí porque la
  categorización v1 es conteo de frecuencia, no ML.
- Un solo hilo por proceso: para trabajo CPU-bound necesitarías workers
  separados — tampoco es tu caso (todo es I/O-bound).

### Python
**Ventajas**
- SDKs también maduros para Gmail/Graph, y el lenguaje más fuerte del
  mercado si algún día metes ML de verdad para categorización (no es el
  plan de v1, pero es una puerta abierta).
- Muy legible, arranque rápido si el equipo ya lo conoce.
- Celery + Redis es el equivalente probado a BullMQ para colas.

**Desventajas**
- Si el cliente es una web app en TypeScript, tienes **dos ecosistemas
  de tipos** sin compartir nada entre front y back — más fricción para un
  equipo chico.
- El GIL limita paralelismo real de CPU en un solo proceso (igual que con
  Node, no es tu cuello de botella aquí, pero vale mencionarlo).
- Ecosistema async (FastAPI/asyncio) es sólido pero más joven y menos
  uniforme que el de Node para servicios de vida larga tipo
  webhook-listener.

### Go (opción a considerar, no recomendada para esto)
**Ventajas**: concurrencia excelente, muy eficiente para muchas conexiones
de larga duración, binario único fácil de desplegar.
**Desventajas**: SDKs de Gmail/Graph menos maduros que en Node, más
código repetitivo (boilerplate) para lo mismo, sin compartir tipos con un
frontend en JS/TS tampoco, curva de aprendizaje si el equipo no lo conoce
ya. Tiene sentido si algún día el bot necesita escalar a un volumen enorme
de conexiones simultáneas — no es el problema de una Beta.

### Recomendación: Node.js + TypeScript
Por tres razones concretas, en orden de peso:
1. **Un solo lenguaje de punta a punta** (frontend web + backend + workers
   + Edge Functions de Supabase) — para un equipo chico construyendo
   rápido en Beta, esto pesa más que cualquier otra diferencia.
2. La categorización de v1 es determinística por diseño (frecuencia, no
   ML) — la ventaja histórica de Python en datos/ML no aplica todavía.
3. SDKs oficiales de primera clase para Gmail y Graph, que es el corazón
   del producto (el bot de correos).

Si más adelante el equipo crece y alguien tiene fuerte preferencia por
Python, o si la categorización evoluciona hacia ML real, vale la pena
reabrir esta conversación — no es una decisión que te encierre para
siempre, solo la mejor opción para arrancar la Beta rápido.

## Qué cambia con la web app

La decisión de que v1 sea web (no nativo iOS) afecta sobre todo al
**cliente**. El bot de correos, Postgres, y la arquitectura de background
jobs no cambian nada — ya vivían del lado del servidor, sin importar qué
dispositivo abre la app.

### Cliente: Next.js (React) + TypeScript
- Responsive desde el día uno — la misma app sirve para iOS y Android por
  navegador, sin mantener dos codebases nativas.
- PWA (Progressive Web App): instalable en la pantalla de inicio en ambos
  sistemas, con ícono y splash screen propios, se siente más "app" que una
  pestaña de navegador normal.
- Mismo lenguaje que el backend (TypeScript) — comparten tipos y schemas
  de validación entre cliente y servidor, como se explicó arriba.
- Integración oficial y bien documentada con Supabase (`@supabase/ssr`)
  para auth y queries con RLS directo desde el navegador.
- Deploy simple en Vercel, con buen soporte de caching/SSR para las
  pantallas menos dinámicas (onboarding, por ejemplo).

Alternativa razonable: **SvelteKit** — más liviano y con mejor rendimiento
percibido, pero comunidad y ejemplos de integración con Supabase más chicos
que los de Next.js. Next.js gana por ecosistema y facilidad de contratar/
encontrar ejemplos, no por ser técnicamente superior.

### El costo real de ser web en vez de nativo (para que lo decidas con los ojos abiertos)
- **Notificaciones push**: en Android (Chrome) el Web Push funciona bien.
  En iOS, Web Push **solo funciona si el usuario agrega la app a su
  pantalla de inicio, y solo en iOS 16.4+** — si no la agrega, o tiene una
  versión más vieja, no recibe push del todo. Esto le pega directo a
  "Transacción desconocida" (que depende de notificar al momento). Para
  Beta, la mitigación es: (a) empujar fuerte el "agrega Cacao a tu
  pantalla de inicio" en el onboarding/tutorial, y (b) tener un fallback
  de notificación por correo o simplemente confiar en que el usuario abre
  la app seguido para ver "Necesita revisión" (que ya diseñamos para que
  aparezca primero en Movimientos).
- **Face ID / biometría**: se puede lograr con WebAuthn en Safari 16+ /
  Chrome Android, pero es menos fluido que biometría nativa. No bloquea
  v1, pero no esperes la misma pulida que tendría una app nativa.
- **Sign in with Apple**: funciona en web (Apple lo soporta vía
  "Sign in with Apple JS"), así que no se pierde esa opción del onboarding.
- **Camino a la App Store después de Beta**: si más adelante decides
  publicar, la ruta más barata es envolver esta misma web app con
  **Capacitor** (le da acceso a APNs nativo, biometría nativa, y un ícono
  real de App Store) en vez de reescribir todo en Swift — la inversión en
  Next.js/TypeScript no se tira, se reutiliza.

## Resumen del stack

| Capa | Elección | Alternativa considerada |
|---|---|---|
| Cliente | Next.js (React) + TypeScript, PWA responsive | SvelteKit, Swift nativo (post-Beta) |
| Backend-as-a-service (Auth + DB + API) | Supabase (Postgres) | Firebase, AWS a medida |
| Base de datos | PostgreSQL (vía Supabase) | Firestore / Mongo |
| Bot de correos (workers) | Node.js + TypeScript, servicio separado | Python + FastAPI/Celery |
| Cola de trabajos en background | Redis + BullMQ | Cron simple, SQS |
| Notificaciones push | Web Push (VAPID) — con las limitaciones de iOS de arriba | Firebase Cloud Messaging |
| Suscripciones | Stripe Billing (checkout web) | RevenueCat (si se pasa a App Store) |
| ORM (workers) | Prisma o Drizzle | Knex, raw SQL |

## Por qué cada elección (lo que no cambió)

### Backend-as-a-service: Supabase (Postgres)
- **Row Level Security (RLS) de Postgres mapea directo a tu regla dura de
  privacidad.** "Aprendizaje de descriptores por usuario, sin tabla
  cross-usuario" se puede *forzar a nivel de base de datos* con una política
  RLS (`user_id = auth.uid()`) en `Descriptores_usuario` y
  `Movimientos_usuario` — no depende de que la lógica de la app nunca tenga
  un bug. `Formatos_correos` (la única tabla compartida) lleva una política
  distinta: lectura pública para todo usuario autenticado, escritura
  restringida al rol de servicio.
- **Auth integrado**: Sign in with Apple, Google y email+contraseña ya
  vienen resueltos, con JWT y refresh tokens manejados por la plataforma —
  y su cliente JS está pensado justo para consumirse desde una web app.
- **Postgres real**: para un ledger financiero (montos, sumas, reportes por
  periodo) quieres transacciones ACID y joins normales — no un documento
  NoSQL donde tienes que desnormalizar todo a mano.
- **pg_cron** integrado sirve directo para el borrado de correos con
  colchón de 48h/7 días.
- Tier gratuito/hobby generoso — sin costo real de infra hasta que haya
  usuarios de verdad.

### Bot de correos: servicio separado en Node.js + TypeScript
El bot vive **fuera** de Supabase (en un servicio propio, p.ej. Fly.io o
Railway), porque tiene necesidades distintas a un CRUD normal:
- Mantener vivas las suscripciones OAuth (Gmail API vía Google Cloud
  Pub/Sub `watch()`, Microsoft Graph vía webhooks/subscriptions) y
  renovarlas antes de que expiren — trabajo de background continuo, no
  encaja bien en funciones serverless de vida corta.
- El pipeline de parseo (match contra `Formatos_correos` → extracción →
  normalización de descriptor → categorización por frecuencia →
  detección de reembolso/duplicado) es lógica determinística.
- Escribe directo a la misma Postgres de Supabase (con el rol de servicio,
  que sí puede saltarse RLS cuando corresponde) usando Prisma o Drizzle.

### Cola de trabajos: Redis + BullMQ
Para: fetch de un correo cuando llega el webhook, reintentos si falla el
parseo, el job diario de borrado con colchón, y el cálculo periódico de
"monto recurrente por descriptor".

### Suscripciones: Stripe Billing
Con checkout web ya no depende de StoreKit/App Store — Stripe maneja trial
(1-3 meses), estado de suscripción, y factura mensual/anual directo. Si
más adelante publicas en la App Store, ese es el momento de evaluar
RevenueCat para unificar Stripe (web) + StoreKit (iOS) + Play Billing
(Android) en una sola fuente de verdad de "¿este usuario tiene acceso?".

## Arquitectura a alto nivel

```
┌───────────────────┐        ┌───────────────────────┐
│  Web app (PWA)      │◄──────►│  Supabase              │
│  Next.js + TS        │  REST/ │  - Postgres (RLS)      │
│  iOS/Android (browser)│ Realtime│ - Auth (Apple/Google/  │
└───────────────────┘        │    email)              │
                              │  - Storage (a futuro)   │
                              └──────────┬─────────────┘
                                         │ rol de servicio
                                         │ (bypassa RLS)
                              ┌──────────▼─────────────┐
                              │  Bot de correos           │
                              │  (Node/TS, Fly/Railway)   │
                              │  - Gmail API / MS Graph    │
                              │  - Cola BullMQ + Redis      │
                              │  - Parseo + categorización   │
                              └──────────┬─────────────┘
                                         │
                              ┌──────────▼─────────────┐
                              │  Web Push (VAPID)         │
                              └─────────────────────────┘
```

## Qué NO se eligió, y por qué

- **Swift nativo para v1**: descartado por ahora — decidiste web para
  cubrir iOS y Android con una sola base de código en Beta; queda como
  opción post-Beta si se publica en App Store (vía Capacitor o reescritura).
- **React Native / Flutter**: no aplica — al ser web, ni siquiera hace
  falta un framework "cross-platform de apps", el navegador ya lo es.
- **Firebase/Firestore como base principal**: NoSQL complica reportes y
  sumas financieras que necesitan consistencia fuerte; Postgres es mejor
  ajuste para un ledger.
- **Python/FastAPI para el bot**: válido también (ver comparación arriba),
  pero Node/TS comparte lenguaje con el frontend y tiene mejor soporte de
  SDKs oficiales para Gmail/Graph.

## Preguntas abiertas para ti
1. ¿Next.js te parece bien, o prefieres que exploremos SvelteKit (más
   liviano, ecosistema Supabase más chico)?
2. ¿Supabase te parece bien como base, o prefieres AWS/GCP a medida por
   alguna razón (compliance, costo a escala, etc.)?
3. Sobre push en iOS vía navegador: ¿te parece aceptable el plan de
   "empujar agregar a pantalla de inicio + fallback" para Beta, o
   prefieres que exploremos otra alternativa (ej. una app nativa mínima
   solo para push, manteniendo el resto en web)?
