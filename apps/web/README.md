# Cacao — web app

Next.js (App Router) + TypeScript + Tailwind, cliente de Supabase vía
`@supabase/ssr`. Ver [`../../docs/stack-proposal.md`](../../docs/stack-proposal.md)
para la justificación del stack.

## Correr en desarrollo

1. Copia el archivo de entorno:

   ```bash
   cp .env.local.example .env.local
   ```

2. Levanta una base de datos, con **una** de estas dos opciones:

   - **Local (requiere Docker corriendo)**, desde la raíz del repo:

     ```bash
     npx supabase start   # aplica supabase/migrations/0001_init.sql automático
     npx supabase status  # imprime la anon key — pégala en .env.local
     ```

   - **Supabase Cloud** (sin Docker): crea un proyecto gratis en
     [supabase.com](https://supabase.com/dashboard), copia URL y anon key desde
     *Project Settings → API* a `.env.local`, y aplica la migración con
     `npx supabase db push` (o pega el contenido de
     `supabase/migrations/0001_init.sql` en el SQL Editor del dashboard).

3. Instala dependencias y corre el servidor:

   ```bash
   npm install
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000). Sin `.env.local`
   configurado, la página igual carga y te lo dice explícitamente (no truena)
   — así se puede tocar el resto del andamiaje sin tener una base a la mano.

## Estructura

```
src/
  app/                # rutas (App Router)
  lib/supabase/
    client.ts           # cliente de navegador
    server.ts            # cliente de Server Components / Route Handlers
    middleware.ts          # refresco de sesión, usado por src/proxy.ts
  proxy.ts             # antes "middleware.ts" — renombrado en Next.js 16
```
