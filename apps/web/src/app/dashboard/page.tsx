import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { lastNMonths } from "@/lib/period";
import { signOut } from "./actions";

const FREE_MONEY_CATEGORIAS = ["Cashback", "Intereses Financieros"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("corte_tipo")
    .eq("id", user.id)
    .single();

  const meses = lastNMonths(5);
  const periodoActual = meses[meses.length - 1];

  const { data: rows, error } = await supabase
    .from("movimientos")
    .select("monto, fecha_operacion, reembolsado, categorias(nombre, es_especial)")
    .gte("fecha_operacion", meses[0].start)
    .lte("fecha_operacion", periodoActual.end);

  const movimientos = (rows ?? []).map((m) => {
    const categoria = Array.isArray(m.categorias) ? m.categorias[0] : m.categorias;
    return { ...m, categoria: categoria as { nombre: string; es_especial: boolean } | null };
  });

  function cuentaComoFlujo(m: (typeof movimientos)[number]) {
    return !m.reembolsado && !m.categoria?.es_especial;
  }

  const porMes = meses.map((mes) => {
    const enMes = movimientos.filter(
      (m) => m.fecha_operacion >= mes.start && m.fecha_operacion <= mes.end,
    );
    const ingreso = enMes
      .filter((m) => cuentaComoFlujo(m) && m.monto > 0)
      .reduce((sum, m) => sum + m.monto, 0);
    const gasto = enMes
      .filter((m) => cuentaComoFlujo(m) && m.monto < 0)
      .reduce((sum, m) => sum + Math.abs(m.monto), 0);
    return { ...mes, ingreso, gasto };
  });

  const actual = porMes[porMes.length - 1];
  const tasaAhorro = actual.ingreso > 0 ? (actual.ingreso - actual.gasto) / actual.ingreso : null;

  function enPeriodoActual(m: (typeof movimientos)[number]) {
    return m.fecha_operacion >= periodoActual.start && m.fecha_operacion <= periodoActual.end;
  }

  const freeMoney = movimientos
    .filter((m) => m.categoria && FREE_MONEY_CATEGORIAS.includes(m.categoria.nombre))
    .filter(enPeriodoActual)
    .reduce((sum, m) => sum + m.monto, 0);

  const gastoPorCategoria = new Map<string, number>();
  for (const m of movimientos) {
    if (!enPeriodoActual(m)) continue;
    if (!cuentaComoFlujo(m) || m.monto >= 0 || !m.categoria) continue;
    gastoPorCategoria.set(
      m.categoria.nombre,
      (gastoPorCategoria.get(m.categoria.nombre) ?? 0) + Math.abs(m.monto),
    );
  }
  const categoriaTop = [...gastoPorCategoria.entries()].sort((a, b) => b[1] - a[1])[0];

  const maxBarra = Math.max(1, ...porMes.flatMap((m) => [m.ingreso, m.gasto]));

  const mxn = (n: number) =>
    n.toLocaleString("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

  return (
    <main className="flex-1 px-6 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-text-faint">Hola, {user.email?.split("@")[0]}</div>
            <div className="font-display text-2xl">Dashboard</div>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-xs font-medium text-text-faint underline">
              Cerrar sesión
            </button>
          </form>
        </div>

        {error && (
          <p className="rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">
            {error.message}
          </p>
        )}

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-faint">
            Gasto del periodo (mes calendario — corte: {profile?.corte_tipo ?? "mensual"})
          </div>
          <div className="mt-2 font-display text-3xl">{mxn(actual.gasto)}</div>
          <p className="mt-1 text-xs text-text-faint">
            Presupuesto y calificación de hábitos llegan en el siguiente paso (Metas/Estrategias).
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl border border-border bg-surface p-4">
            <div className="text-xs font-medium text-text-muted">Tasa de ahorro</div>
            <div className="mt-1 font-display text-xl">
              {tasaAhorro === null ? "—" : `${Math.round(tasaAhorro * 100)}%`}
            </div>
          </div>
          <div className="flex-1 rounded-2xl border border-border bg-surface p-4">
            <div className="text-xs font-medium text-text-muted">Free money</div>
            <div className="mt-1 font-display text-xl">{mxn(freeMoney)}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 text-xs font-medium text-text-muted">
            Ingresos vs. gastos — últimos {porMes.length} meses
          </div>
          <div className="flex h-28 items-end gap-3">
            {porMes.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-full items-end gap-1">
                  <div
                    className="w-2.5 rounded bg-positive-soft"
                    style={{ height: `${(m.ingreso / maxBarra) * 100}%` }}
                  />
                  <div
                    className="w-2.5 rounded bg-negative-soft"
                    style={{ height: `${(m.gasto / maxBarra) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-faint">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="text-xs font-medium text-text-muted">Categoría con más gasto</div>
          {categoriaTop ? (
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-semibold">{categoriaTop[0]}</span>
              <span className="text-lg font-semibold">{mxn(categoriaTop[1])}</span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-text-faint">Sin gastos este periodo todavía.</p>
          )}
        </div>

        <div className="flex gap-3 pt-2 text-sm">
          <Link
            href="/registro-rapido"
            className="flex-1 rounded-2xl bg-accent px-4 py-2.5 text-center font-semibold text-white"
          >
            Registro rápido
          </Link>
          <Link
            href="/movimientos"
            className="flex-1 rounded-2xl border border-border bg-surface px-4 py-2.5 text-center font-medium text-text"
          >
            Ver movimientos
          </Link>
        </div>
      </div>
    </main>
  );
}
