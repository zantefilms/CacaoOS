import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Adonde llegan los links de confirmación de correo y el redirect de OAuth
// (Apple/Google) después de que Supabase autentica al usuario.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("No se pudo confirmar la sesión, intenta de nuevo.")}`,
  );
}
