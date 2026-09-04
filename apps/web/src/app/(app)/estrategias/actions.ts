"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TIPOS = ["periodo", "anual", "fondo_emergencia"] as const;

export async function crearMeta(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const tipo = String(formData.get("tipo"));
  const monto = Number(formData.get("monto_objetivo"));
  const gastosAltosRaw = formData.get("gastos_altos_frecuentes");

  if (!TIPOS.includes(tipo as (typeof TIPOS)[number]) || !monto || monto <= 0) {
    redirect("/estrategias?error=" + encodeURIComponent("Revisa el tipo de meta y el monto."));
  }

  // Solo una meta activa por tipo a la vez — una meta nueva del mismo tipo
  // reemplaza a la anterior en vez de acumularlas.
  await supabase
    .from("metas")
    .update({ activa: false })
    .eq("user_id", user.id)
    .eq("tipo", tipo)
    .eq("activa", true);

  const { error } = await supabase.from("metas").insert({
    user_id: user.id,
    tipo,
    monto_objetivo: monto,
    gastos_altos_frecuentes: tipo === "fondo_emergencia" ? gastosAltosRaw === "si" : null,
  });

  if (error) {
    redirect("/estrategias?error=" + encodeURIComponent(error.message));
  }

  redirect("/estrategias?meta_creada=1");
}
