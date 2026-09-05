"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Cuenta = { banco: string; nombre: string; tipo: string; terminacion: string };

export async function completarOnboarding(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const salarioFijo = Number(formData.get("salario_fijo_mensual"));
  const ingresoNoFijoRaw = formData.get("ingreso_no_fijo_aproximado");
  const ingresoNoFijo = ingresoNoFijoRaw ? Number(ingresoNoFijoRaw) : 0;
  const corteTipo = String(formData.get("corte_tipo"));
  const trackingEmail = String(formData.get("tracking_email") ?? "").trim();
  const cuentasRaw = String(formData.get("cuentas") ?? "[]");
  const categoriasIngresoRaw = String(formData.get("categorias_ingreso") ?? "[]");
  const notifTipos = formData.getAll("notif_tipo").map(String);

  if (
    !salarioFijo ||
    salarioFijo <= 0 ||
    (corteTipo !== "mensual" && corteTipo !== "quincenal") ||
    !trackingEmail
  ) {
    redirect("/onboarding");
  }

  let cuentas: Cuenta[] = [];
  let categoriasIngreso: string[] = [];
  try {
    cuentas = JSON.parse(cuentasRaw);
    categoriasIngreso = JSON.parse(categoriasIngresoRaw);
  } catch {
    redirect("/onboarding?error=" + encodeURIComponent("Datos inválidos, intenta de nuevo."));
  }

  const { error: userError } = await supabase
    .from("users")
    .update({
      salario_fijo_mensual: salarioFijo,
      ingreso_no_fijo_aproximado: ingresoNoFijo > 0 ? ingresoNoFijo : null,
      corte_tipo: corteTipo,
      tracking_email: trackingEmail || null,
      onboarding_completado: true,
    })
    .eq("id", user.id);

  if (userError) {
    redirect("/onboarding?error=" + encodeURIComponent(userError.message));
  }

  if (cuentas.length > 0) {
    const { error: cuentasError } = await supabase.from("cuentas").insert(
      cuentas
        .filter((c) => c.nombre.trim())
        .map((c) => ({
          user_id: user.id,
          banco: c.banco,
          nombre: c.nombre.trim(),
          tipo: c.tipo,
          terminacion: c.terminacion.trim() || null,
        })),
    );
    if (cuentasError) {
      redirect("/onboarding?error=" + encodeURIComponent(cuentasError.message));
    }
  }

  // Categorías de ingreso propias del usuario (ver DECISIONS.md: se
  // preguntan aquí en el onboarding, no hay que esperar a Registro rápido).
  if (categoriasIngreso.length > 0) {
    const { error: catError } = await supabase.from("categorias").insert(
      categoriasIngreso.map((nombre) => ({
        user_id: user.id,
        nombre,
        tipo_default: "na" as const,
        es_especial: false,
        direccion: "ingreso" as const,
      })),
    );
    if (catError) {
      redirect("/onboarding?error=" + encodeURIComponent(catError.message));
    }
  }

  if (notifTipos.length > 0) {
    const { error: notifError } = await supabase
      .from("notificacion_preferencias")
      .insert(notifTipos.map((tipo) => ({ user_id: user.id, tipo, activo: true })));
    if (notifError) {
      redirect("/onboarding?error=" + encodeURIComponent(notifError.message));
    }
  }

  redirect("/dashboard");
}
