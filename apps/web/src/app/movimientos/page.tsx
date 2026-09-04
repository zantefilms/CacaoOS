import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function MovimientosPage({ searchParams }: PageProps<"/movimientos">) {
  const params = await searchParams;
  const justCreated = params.created === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: rows, error } = await supabase
    .from("movimientos")
    .select("id, monto, fecha_operacion, nombre_limpio, tipo_gasto, estado, categorias(nombre)")
    .order("fecha_operacion", { ascending: false })
    .order("created_at", { ascending: false });

  // categoria_id -> categorias es una relación a-uno; PostgREST la
  // devuelve como objeto (no arreglo) en runtime, pero sin tipos
  // generados desde el esquema real, el cliente la infiere como
  // arreglo. Se corrige aquí en vez de silenciar el chequeo de tipos.
  const movimientos = rows?.map((m) => ({
    ...m,
    categorias: (Array.isArray(m.categorias) ? m.categorias[0] : m.categorias) as
      | { nombre: string }
      | null,
  }));

  return (
    <main className="flex-1 px-6 py-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div className="font-display text-2xl">Movimientos</div>
          <Link
            href="/registro-rapido"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            + Registro rápido
          </Link>
        </div>

        {justCreated && (
          <p className="mb-4 rounded-xl bg-positive-soft px-3 py-2 text-sm text-positive-strong">
            Movimiento guardado.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">
            {error.message}
          </p>
        )}

        {movimientos?.length === 0 && (
          <p className="text-sm text-text-muted">
            Todavía no hay movimientos — crea uno desde Registro rápido.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {movimientos?.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"
            >
              <div>
                <div className="text-sm font-semibold">{m.nombre_limpio}</div>
                <div className="text-xs text-text-faint">
                  {new Date(m.fecha_operacion + "T00:00:00").toLocaleDateString("es-MX")} ·{" "}
                  {m.categorias?.nombre} · {m.tipo_gasto}
                  {m.estado === "necesita_revision" && " · necesita revisión"}
                </div>
              </div>
              <div
                className={`text-sm font-bold ${m.monto < 0 ? "text-negative" : "text-positive-strong"}`}
              >
                {m.monto < 0 ? "-" : "+"}$
                {Math.abs(m.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
