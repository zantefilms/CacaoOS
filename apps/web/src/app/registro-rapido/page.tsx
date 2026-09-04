import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearMovimiento } from "./actions";

export default async function RegistroRapidoPage({
  searchParams,
}: PageProps<"/registro-rapido">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: categorias } = await supabase
    .from("categorias")
    .select("id, nombre")
    .eq("es_especial", false)
    .order("nombre");

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl">Registro rápido</div>
          <p className="mt-1 text-sm text-text-muted">
            Gasto en efectivo o ingreso adicional — sin pasar por el bot.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">
            {error}
          </p>
        )}

        <form action={crearMovimiento}>
          <fieldset className="mb-4 flex rounded-2xl border border-border p-1">
            <label className="flex-1">
              <input
                type="radio"
                name="tipo_movimiento"
                value="gasto"
                defaultChecked
                className="peer sr-only"
              />
              <span className="block cursor-pointer rounded-xl py-2 text-center text-sm font-semibold text-text-muted peer-checked:bg-accent peer-checked:text-white">
                Gasto en efectivo
              </span>
            </label>
            <label className="flex-1">
              <input type="radio" name="tipo_movimiento" value="ingreso" className="peer sr-only" />
              <span className="block cursor-pointer rounded-xl py-2 text-center text-sm font-semibold text-text-muted peer-checked:bg-accent peer-checked:text-white">
                Ingreso adicional
              </span>
            </label>
          </fieldset>

          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Monto (MXN)
            </span>
            <input
              name="monto"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-lg outline-none focus:border-accent"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Categoría
            </span>
            <select
              name="categoria_id"
              required
              defaultValue=""
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Descriptor
            </span>
            <input
              name="descriptor"
              type="text"
              placeholder="Tacos con Ana"
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Fecha
            </span>
            <input
              name="fecha"
              type="date"
              defaultValue={today}
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white"
          >
            Guardar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          <Link href="/movimientos" className="font-medium text-accent">
            Ver movimientos
          </Link>
        </p>
      </div>
    </main>
  );
}
