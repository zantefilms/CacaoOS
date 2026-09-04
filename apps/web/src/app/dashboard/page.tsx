import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Esta fila la crea el trigger on_auth_user_created (0002) — si no
  // existe, es la primera señal de que algo se rompió entre el signup y
  // el perfil.
  const { data: profile, error } = await supabase
    .from("users")
    .select("corte_tipo, subscription_status, trial_ends_at, created_at")
    .eq("id", user.id)
    .single();

  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div>
        <div className="font-display text-4xl">Cacao</div>
        <p className="mt-2 text-sm text-text-muted">
          Sesión real, contra Supabase Auth — todavía no es el dashboard final.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-left">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-faint">
          Sesión
        </div>
        <p className="mt-2 text-sm">
          <span className="text-text-muted">Correo: </span>
          {user.email}
        </p>
        <p className="text-sm">
          <span className="text-text-muted">User ID: </span>
          <code className="rounded bg-surface-2 px-1 py-0.5 text-xs">{user.id}</code>
        </p>

        <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-text-faint">
          Perfil (public.users)
        </div>
        {error ? (
          <p className="mt-2 text-sm text-negative">
            No se encontró fila de perfil — revisa que el trigger
            on_auth_user_created (migración 0002) esté aplicado. {error.message}
          </p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-text-muted">
            <li>Día de corte: {profile.corte_tipo}</li>
            <li>Suscripción: {profile.subscription_status}</li>
            <li>Creado: {new Date(profile.created_at).toLocaleString("es-MX")}</li>
          </ul>
        )}
      </div>

      <div className="flex gap-3 text-sm">
        <Link
          href="/registro-rapido"
          className="rounded-2xl bg-accent px-5 py-2.5 font-semibold text-white"
        >
          Registro rápido
        </Link>
        <Link
          href="/movimientos"
          className="rounded-2xl border border-border bg-surface px-5 py-2.5 font-medium text-text"
        >
          Ver movimientos
        </Link>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-muted"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
