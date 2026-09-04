# Cacao — Propuesta de stack técnico (v1)

Estado: **propuesta, pendiente de tu confirmación.** Una vez la ajustemos y la
apruebes, se registra como decisión final en `DECISIONS.md`.

## Resumen

| Capa | Elección | Alternativa considerada |
|---|---|---|
| Cliente iOS | Swift + SwiftUI (nativo) | React Native / Flutter |
| Backend-as-a-service (Auth + DB + API) | Supabase (Postgres) | Firebase, AWS a medida |
| Base de datos | PostgreSQL (vía Supabase) | Firestore / Mongo |
| Bot de correos (workers) | Node.js + TypeScript, servicio separado | Python + FastAPI/Celery |
| Cola de trabajos en background | Redis + BullMQ | Cron simple, SQS |
| Notificaciones push | APNs directo (o vía Firebase Cloud Messaging) | OneSignal |
| Suscripciones / IAP | RevenueCat (sobre StoreKit) | StoreKit directo |
| ORM (workers) | Prisma o Drizzle | Knex, raw SQL |

## Por qué cada elección

### Cliente: Swift + SwiftUI nativo
- v1 es iOS-only — no hay ninguna ventaja de un framework cross-platform
  (React Native / Flutter) todavía, solo overhead extra (bridges, builds,
  actualizaciones de versión).
- Una app de finanzas personales depende de confianza: Face ID / Touch ID
  para desbloquear montos, Sign in with Apple nativo, notificaciones push
  confiables, se siente "de Apple" — todo esto es más simple y más pulido en
  nativo que en un wrapper.
- Mejor integración con Background App Refresh / Background Tasks si en
  algún momento el bot necesita un empujón desde el cliente.

### Backend-as-a-service: Supabase (Postgres)
Es la pieza que más apalanca todo lo demás, así que la justifico con más
detalle:
- **Row Level Security (RLS) de Postgres mapea directo a tu regla dura de
  privacidad.** "Aprendizaje de descriptores por usuario, sin tabla
  cross-usuario" se puede *forzar a nivel de base de datos* con una política
  RLS (`user_id = auth.uid()`) en `Descriptores_usuario` y
  `Movimientos_usuario` — no depende de que la lógica de la app nunca tenga
  un bug. `Formatos_correos` (la única tabla compartida) lleva una política
  distinta: lectura pública para todo usuario autenticado, escritura
  restringida al rol de servicio.
- **Auth integrado**: Sign in with Apple, Google y email+contraseña ya
  vienen resueltos (tal como pide el brief), con JWT y refresh tokens
  manejados por la plataforma — no hay que construir ese flujo desde cero.
- **Postgres real**: para un ledger financiero (montos, sumas, reportes por
  periodo) quieres transacciones ACID y joins normales — no un documento
  NoSQL donde tienes que desnormalizar todo a mano. Esto también hace mucho
  más fácil el cálculo del dashboard (gasto del periodo, tasa de ahorro,
  Free money) con queries SQL normales.
- **pg_cron** integrado sirve directo para el borrado de correos con
  colchón de 48h/7 días.
- Tiene un tier gratuito/hobby generoso, así que no hay costo de infra real
  hasta que haya usuarios de verdad — importante para una v1/Beta.

### Bot de correos: servicio separado en Node.js + TypeScript
El bot vive **fuera** de Supabase (en un servicio propio, p.ej. Fly.io o
Railway), porque tiene necesidades distintas a un CRUD normal:
- Mantener vivas las suscripciones OAuth (Gmail API vía Google Cloud
  Pub/Sub `watch()`, Microsoft Graph vía webhooks/subscriptions) y renovarlas
  antes de que expiren — esto es trabajo de background continuo, no encaja
  bien en funciones serverless de vida corta.
- Node/TypeScript tiene los SDKs más maduros para ambas APIs (`googleapis`
  oficial de Google, `@microsoft/microsoft-graph-client` para Outlook), y
  comparte lenguaje con cualquier función edge que uses en Supabase — un
  solo stack de tipos para todo el backend.
- El pipeline de parseo (match contra `Formatos_correos` → extracción →
  normalización de descriptor → categorización por frecuencia →
  detección de reembolso/duplicado) es lógica determinística, no ML — no
  necesitas Python para esto.
- Este servicio escribe directo a la misma Postgres de Supabase (con el rol
  de servicio, que sí puede saltarse RLS cuando corresponde) usando
  Prisma o Drizzle para mantener el esquema tipado.

### Cola de trabajos: Redis + BullMQ
Para: fetch de un correo cuando llega el webhook, reintentos si falla el
parseo, el job diario de borrado con colchón, y el cálculo periódico de
"monto recurrente por descriptor". BullMQ es el estándar en el ecosistema
Node para esto, con dashboards de monitoreo listos (Bull Board).

### Notificaciones push: APNs
Directo por APNs (con una librería como `node-apn` o vía Supabase Edge
Functions) para los tres tipos de notificación del brief: límite de
presupuesto, cierre de periodo, transacción desconocida — y ahora también
"recomendaciones de la app". Si más adelante quieres analytics de entrega
(open rate, etc.), migrar a Firebase Cloud Messaging es un cambio menor.

### Suscripciones: RevenueCat
Envuelve StoreKit y resuelve trial (1-3 meses), estado de suscripción, y
sirve como fuente de verdad de "¿este usuario tiene acceso?" sin tener que
mantener recibos de Apple a mano. Encaja directo con "todas las features
gratis durante el trial, luego suscripción mensual/anual" de DECISIONS.md.

## Arquitectura a alto nivel

```
┌─────────────────┐        ┌──────────────────────┐
│   iOS (Swift)    │◄──────►│   Supabase            │
│   SwiftUI         │  REST/ │   - Postgres (RLS)    │
│                    │  Realtime│  - Auth (Apple/     │
└─────────────────┘        │    Google/email)      │
                            │  - Storage (si hace    │
                            │    falta a futuro)     │
                            └──────────┬────────────┘
                                       │ rol de servicio
                                       │ (bypassa RLS)
                            ┌──────────▼────────────┐
                            │  Bot de correos         │
                            │  (Node/TS, Fly/Railway) │
                            │  - Gmail API / MS Graph  │
                            │  - Cola BullMQ + Redis   │
                            │  - Parseo + categorización│
                            └──────────┬────────────┘
                                       │
                            ┌──────────▼────────────┐
                            │  APNs (push directo)     │
                            └───────────────────────┘
```

## Qué NO se eligió, y por qué

- **React Native / Flutter**: sin beneficio en v1 (una sola plataforma),
  y una app de finanzas se beneficia más de sentirse 100% nativa.
- **Firebase/Firestore como base principal**: NoSQL complica reportes y
  sumas financieras que necesitan consistencia fuerte; Postgres es mejor
  ajuste para un ledger.
- **Todo en un monolito dentro de Supabase Edge Functions**: las
  suscripciones OAuth de larga duración y el polling/webhooks del bot de
  correos no encajan bien en funciones serverless de vida corta — por eso
  el bot vive en un servicio propio.
- **Python/FastAPI para el bot**: válido también, pero Node/TS comparte
  lenguaje con el resto del backend y tiene mejor soporte de SDKs oficiales
  para Gmail/Graph. Si tu equipo tiene más experiencia en Python, es un
  cambio razonable a discutir.

## Preguntas abiertas para ti
1. ¿Ya tienes preferencia de lenguaje para el backend (Node/TS vs. Python),
   o te sirve la justificación de arriba?
2. ¿Supabase te parece bien como base, o prefieres AWS/GCP a medida por
   alguna razón (compliance, costo a escala, etc.)?
3. ¿Alguien del equipo ya tiene experiencia previa con RevenueCat o prefieres
   StoreKit directo?
