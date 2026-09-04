import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { crearMovimiento } from "./actions";
import { RegistroRapidoForm } from "./registro-rapido-form";

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
    .select("id, nombre, direccion")
    .eq("es_especial", false)
    .order("nombre");

  const gastoCategorias = categorias?.filter((c) => c.direccion === "gasto") ?? [];
  const ingresoCategorias = categorias?.filter((c) => c.direccion === "ingreso") ?? [];

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1 text-center">
            <div className="font-display text-2xl">Registro rápido</div>
            <p className="mt-1 text-sm text-text-muted">
              Gasto en efectivo o ingreso adicional — sin pasar por el bot.
            </p>
          </div>
          <Link
            href="/dashboard"
            aria-label="Cerrar"
            className="-mt-1 -mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">
            {error}
          </p>
        )}

        <RegistroRapidoForm
          gastoCategorias={gastoCategorias}
          ingresoCategorias={ingresoCategorias}
          today={today}
          action={crearMovimiento}
        />
      </div>
    </main>
  );
}
