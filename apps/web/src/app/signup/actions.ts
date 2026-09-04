"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/signup?error=" + encodeURIComponent("Correo y contraseña son requeridos."));
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  // Con confirmación de correo activada (default en un proyecto nuevo de
  // Supabase), signUp no crea sesión todavía — hay que confirmar por correo.
  if (!data.session) {
    redirect("/signup?check_email=1");
  }

  redirect("/dashboard");
}

export async function signUpWithOAuth(provider: "apple" | "google") {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }
  if (data.url) {
    redirect(data.url);
  }
}
