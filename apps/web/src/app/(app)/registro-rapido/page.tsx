import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { crearMovimiento } from "./actions";
import { RegistroRapidoScreen } from "./registro-rapido-screen";

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
    <RegistroRapidoScreen
      gastoCategorias={gastoCategorias}
      ingresoCategorias={ingresoCategorias}
      today={today}
      action={crearMovimiento}
      error={error}
    />
  );
}
