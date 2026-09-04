import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { lastNMonths, monthRange } from "@/lib/period";
import { crearMeta } from "./actions";
import { NuevaMetaForm } from "./nueva-meta-form";

const TIPO_LABEL: Record<string, string> = {
  periodo: "Ahorro del periodo",
  anual: "Ahorro anual",
  fondo_emergencia: "Fondo de emergencia",
};

export default async function EstrategiasPage({ searchParams }: PageProps<"/estrategias">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const metaCreada = params.meta_creada === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [{ data: metas }, { data: rows }] = await Promise.all([
    supabase
      .from("metas")
      .select("id, tipo, monto_objetivo, gastos_altos_frecuentes, created_at")
      .eq("activa", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("movimientos")
      .select("monto, fecha_operacion, reembolsado, tipo_gasto, categorias(es_especial)")
      .order("fecha_operacion", { ascending: true }),
  ]);

  const movimientos = (rows ?? []).map((m) => {
    const categoria = Array.isArray(m.categorias) ? m.categorias[0] : m.categorias;
    return { ...m, categoria: categoria as { es_especial: boolean } | null };
  });

  function cuentaComoFlujo(m: (typeof movimientos)[number]) {
    return !m.reembolsado && !m.categoria?.es_especial;
  }

  function ahorroEnRango(desde: string, hasta: string) {
    const en = movimientos.filter(
      (m) => m.fecha_operacion >= desde && m.fecha_operacion <= hasta && cuentaComoFlujo(m),
    );
    const ingreso = en.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0);
    const gasto = en.filter((m) => m.monto < 0).reduce((s, m) => s + Math.abs(m.monto), 0);
    return ingreso - gasto;
  }

  const hoy = new Date();
  const hoyStr = hoy.toISOString().slice(0, 10);
  const inicioAnio = `${hoy.getUTCFullYear()}-01-01`;
  const periodoActual = monthRange(hoy.getUTCFullYear(), hoy.getUTCMonth());

  function progresoDeMeta(meta: { tipo: string; created_at: string }) {
    if (meta.tipo === "periodo") return ahorroEnRango(periodoActual.start, periodoActual.end);
    if (meta.tipo === "anual") return ahorroEnRango(inicioAnio, hoyStr);
    return ahorroEnRango(meta.created_at.slice(0, 10), hoyStr); // fondo_emergencia
  }

  // Gasto fijo promedio de los últimos 3 meses, para sugerir el fondo de
  // emergencia (3x sin gastos altos frecuentes, 6x si los tiene).
  const meses3 = lastNMonths(3);
  const gastoFijoPorMes = meses3.map((m) =>
    movimientos
      .filter(
        (x) =>
          x.fecha_operacion >= m.start &&
          x.fecha_operacion <= m.end &&
          cuentaComoFlujo(x) &&
          x.monto < 0 &&
          x.tipo_gasto === "fijo",
      )
      .reduce((s, x) => s + Math.abs(x.monto), 0),
  );
  const promedioGastoFijo = gastoFijoPorMes.reduce((a, b) => a + b, 0) / meses3.length;

  // Gastos por tipo (Fijo/Semi-fijo/Variable) del periodo actual.
  const gastosPeriodo = movimientos.filter(
    (m) =>
      m.fecha_operacion >= periodoActual.start &&
      m.fecha_operacion <= periodoActual.end &&
      cuentaComoFlujo(m) &&
      m.monto < 0,
  );
  const porTipo = { fijo: 0, semi_fijo: 0, variable: 0 } as Record<string, number>;
  for (const m of gastosPeriodo) {
    if (m.tipo_gasto in porTipo) porTipo[m.tipo_gasto] += Math.abs(m.monto);
  }
  const totalGastoPeriodo = porTipo.fijo + porTipo.semi_fijo + porTipo.variable;
  const pct = (n: number) => (totalGastoPeriodo > 0 ? Math.round((n / totalGastoPeriodo) * 100) : 0);

  const mxn = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div>
          <div className="font-display text-2xl">Estrategias</div>
          <p className="text-sm text-text-muted">Periodo: {periodoActual.start} a {periodoActual.end}</p>
        </div>

        {error && (
          <p className="rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">{error}</p>
        )}
        {metaCreada && (
          <p className="rounded-xl bg-positive-soft px-3 py-2 text-sm text-positive-strong">
            Meta guardada.
          </p>
        )}

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
            Metas
          </div>

          {metas?.map((meta) => {
            const progreso = progresoDeMeta(meta);
            const pctMeta = meta.monto_objetivo > 0 ? Math.max(0, Math.min(100, (progreso / meta.monto_objetivo) * 100)) : 0;
            return (
              <div key={meta.id} className="mb-2 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{TIPO_LABEL[meta.tipo] ?? meta.tipo}</span>
                  <span className="text-xs text-text-faint">{Math.round(pctMeta)}%</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-xl">{mxn(Math.max(0, progreso))}</span>
                  <span className="text-xs text-text-faint">de {mxn(meta.monto_objetivo)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pctMeta}%` }}
                  />
                </div>
                {meta.tipo === "fondo_emergencia" && (
                  <p className="mt-2 text-[11px] text-text-faint">
                    Progreso estimado como tu ahorro neto acumulado desde que creaste esta meta —
                    no rastrea un saldo de ahorro real todavía.
                  </p>
                )}
              </div>
            );
          })}

          {metas?.length === 0 && (
            <p className="mb-2 text-sm text-text-faint">Todavía no tienes metas activas.</p>
          )}

          <NuevaMetaForm promedioGastoFijo={promedioGastoFijo} action={crearMeta} />
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-faint">
            Estrategias del periodo
          </div>
          <p className="mt-1.5 text-sm text-text-faint">
            Las 3 recomendaciones del periodo (basadas en tus hábitos) todavía no están
            construidas — quedó pendiente definir esa lógica en detalle antes de programarla.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-faint">
            Gastos por tipo — este periodo
          </div>
          {totalGastoPeriodo === 0 ? (
            <p className="mt-2 text-sm text-text-faint">Sin gastos este periodo todavía.</p>
          ) : (
            <>
              <div className="mt-3 flex h-3.5 overflow-hidden rounded-full">
                <div className="bg-accent" style={{ width: `${pct(porTipo.fijo)}%` }} />
                <div className="bg-[oklch(65%_0.08_45)]" style={{ width: `${pct(porTipo.semi_fijo)}%` }} />
                <div className="bg-surface-2" style={{ width: `${pct(porTipo.variable)}%` }} />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-accent" />
                  Fijo · {mxn(porTipo.fijo)} ({pct(porTipo.fijo)}%)
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-sm bg-[oklch(65%_0.08_45)]" />
                  Semi-fijo · {mxn(porTipo.semi_fijo)} ({pct(porTipo.semi_fijo)}%)
                </span>
                <span>
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-sm border border-border bg-surface-2" />
                  Variable · {mxn(porTipo.variable)} ({pct(porTipo.variable)}%)
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
