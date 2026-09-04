# Cacao

Cacao es una app de finanzas personales gamificada, pensada primero para
usuarios en México. Automatiza el tracking de gastos leyendo notificaciones
bancarias por correo (OAuth) y, en v2+, usará mecánicas de juego (moneda,
recompensas, un "Patrimonio" tipo Township) para reforzar buenos hábitos
financieros.

**v1 es 100% financiero: cero UI y cero lógica de juego.** Todo lo de
gamificación queda documentado como placeholder para v2.

## Estado actual

🎨 **Fase de diseño visual + stack técnico en definición.** El diseño de las
pantallas principales (Onboarding, Panel principal, Movimientos,
Estrategias, Mi Patrimonio, Registro rápido) ya tiene una primera vuelta
completa; el stack técnico está en `docs/stack-proposal.md`, pendiente de
confirmación antes de tocar backend o esquema de base de datos. Ver
`DECISIONS.md` para el registro de decisiones de producto y técnicas.

## Documentación

- [`DECISIONS.md`](./DECISIONS.md) — decisiones de producto y técnicas,
  actualizado en cada sesión.
- [`docs/brief.md`](./docs/brief.md) — brief de construcción v1 original
  (visión, alcance, pantallas, modelo de datos, bot de correos).
- [`docs/stack-proposal.md`](./docs/stack-proposal.md) — propuesta de stack
  técnico (frontend, backend, DB), pendiente de confirmación.

## Plataforma

Web app (responsive, iOS y Android por navegador) para v1. Publicarla en
App Store/Play Store queda como decisión post-Beta.
