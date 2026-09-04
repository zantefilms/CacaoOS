# Cacao

Cacao es una app de finanzas personales gamificada, pensada primero para
usuarios en México. Automatiza el tracking de gastos leyendo notificaciones
bancarias por correo (OAuth) y, en v2+, usará mecánicas de juego (moneda,
recompensas, un "Patrimonio" tipo Township) para reforzar buenos hábitos
financieros.

**v1 es 100% financiero: cero UI y cero lógica de juego.** Todo lo de
gamificación queda documentado como placeholder para v2.

## Estado actual

🛠️ **Andamiaje del proyecto.** Diseño, stack técnico, esquema de base de
datos y arquitectura del bot de correos ya están definidos y aprobados (ver
`docs/`). La web app (`apps/web`) es un esqueleto que corre y compila, con
el cliente de Supabase ya conectado — todavía sin pantallas completas, esa
es la siguiente etapa. Ver `DECISIONS.md` para el registro de decisiones.

## Estructura del repo

```
apps/
  web/                        # Next.js (App Router) + TypeScript + Tailwind
                                 — ver apps/web/README.md para correrla
supabase/
  migrations/0001_init.sql     # esquema completo, con RLS
  config.toml                  # config de `supabase start` (requiere Docker)
design/                       # canvas de diseño (.dc.html) — fuente de las pantallas
docs/                         # stack, esquema de DB, arquitectura del bot
assets/                       # logo temporal, etc.
```

Pendiente (no construido todavía): `apps/bot`, el servicio Node/TypeScript
del bot de correos (ver `docs/email-bot-architecture.md`).

## Documentación

- [`DECISIONS.md`](./DECISIONS.md) — decisiones de producto y técnicas,
  actualizado en cada sesión.
- [`docs/brief.md`](./docs/brief.md) — brief de construcción v1 original.
- [`docs/stack-proposal.md`](./docs/stack-proposal.md) — stack técnico
  confirmado (frontend, backend, DB) y por qué.
- [`docs/db-schema.md`](./docs/db-schema.md) — esquema completo de base de
  datos.
- [`docs/email-bot-architecture.md`](./docs/email-bot-architecture.md) —
  arquitectura del bot de correos y detección de monto recurrente.

## Plataforma

Web app (responsive, iOS y Android por navegador) para v1. Publicarla en
App Store/Play Store queda como decisión post-Beta.
