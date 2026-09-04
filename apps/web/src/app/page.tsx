import { createClient } from "@/lib/supabase/server";

async function checkSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return { configured: false as const };
  }

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("categorias")
    .select("*", { count: "exact", head: true });

  if (error) {
    return { configured: true as const, ok: false as const, message: error.message };
  }

  return { configured: true as const, ok: true as const, count: count ?? 0 };
}

export default async function Home() {
  const status = await checkSupabase();

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <div className="font-display text-4xl">Cacao</div>
        <p className="mt-2 text-sm text-text-muted">
          Andamiaje del proyecto — no es una pantalla final todavía.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-left">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-faint">
          Conexión a Supabase
        </div>

        {!status.configured && (
          <div className="mt-3 space-y-2 text-sm">
            <p className="font-medium text-accent-strong">No configurada.</p>
            <p className="text-text-muted">
              Define <code className="rounded bg-surface-2 px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              y{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>{" "}
              en <code className="rounded bg-surface-2 px-1 py-0.5">.env.local</code> (ver{" "}
              <code className="rounded bg-surface-2 px-1 py-0.5">.env.local.example</code>).
            </p>
          </div>
        )}

        {status.configured && status.ok && (
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium text-positive-strong">Conectada correctamente.</p>
            <p className="text-text-muted">
              {status.count} categorías visibles en <code className="rounded bg-surface-2 px-1 py-0.5">categorias</code>{" "}
              (esperado: 23, la taxonomía de sistema del seed).
            </p>
          </div>
        )}

        {status.configured && !status.ok && (
          <div className="mt-3 space-y-1 text-sm">
            <p className="font-medium text-negative">Configurada, pero la consulta falló.</p>
            <p className="text-text-muted">{status.message}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-text-faint">
        Ver <code className="rounded bg-surface-2 px-1 py-0.5">docs/db-schema.md</code> y{" "}
        <code className="rounded bg-surface-2 px-1 py-0.5">docs/email-bot-architecture.md</code>{" "}
        para el resto del andamiaje.
      </p>
    </main>
  );
}
