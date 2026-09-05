-- Marca si un usuario ya pasó por el onboarding, para que (app)/layout.tsx
-- lo mande ahí antes de dejarlo entrar al resto de la app.

alter table public.users
  add column onboarding_completado boolean not null default false;
