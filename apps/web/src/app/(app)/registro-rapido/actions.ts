"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function crearMovimiento(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const tipoMovimiento = String(formData.get("tipo_movimiento")); // "gasto" | "ingreso"
  const montoRaw = Number(formData.get("monto"));
  const categoriaId = String(formData.get("categoria_id") ?? "");
  const descriptor = String(formData.get("descriptor") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "");

  if (
    !montoRaw ||
    montoRaw <= 0 ||
    !categoriaId ||
    !descriptor ||
    !fecha ||
    (tipoMovimiento !== "gasto" && tipoMovimiento !== "ingreso")
  ) {
    redirect("/registro-rapido?error=" + encodeURIComponent("Faltan campos, o el monto no es válido."));
  }

  // El tipo_gasto se toma del default de la categoría en el servidor —
  // nunca se confía en un valor que mande el cliente. También se valida
  // que la categoría elegida sea de la misma dirección (gasto/ingreso)
  // que el usuario seleccionó, aunque el picker del cliente ya filtre
  // por dirección — un ingreso nunca debe poder quedar clasificado con
  // una categoría de gasto ni viceversa.
  const { data: categoria, error: categoriaError } = await supabase
    .from("categorias")
    .select("tipo_default, direccion")
    .eq("id", categoriaId)
    .single();

  if (categoriaError || !categoria || categoria.direccion !== tipoMovimiento) {
    redirect("/registro-rapido?error=" + encodeURIComponent("Categoría inválida para ese tipo de movimiento."));
  }

  const monto = tipoMovimiento === "ingreso" ? Math.abs(montoRaw) : -Math.abs(montoRaw);

  const { error: insertError } = await supabase.from("movimientos").insert({
    user_id: user.id,
    categoria_id: categoriaId,
    monto,
    fecha_operacion: fecha,
    nombre_limpio: descriptor,
    tipo_gasto: categoria.tipo_default,
    medio: "fisico",
    origen: "manual",
    estado: "ok",
  });

  if (insertError) {
    redirect("/registro-rapido?error=" + encodeURIComponent(insertError.message));
  }

  redirect("/movimientos?created=1");
}
