import {
  AuthCard,
  AuthHeader,
  Divider,
  ErrorNote,
  FooterLink,
  OAuthButtons,
  TextField,
} from "@/components/auth-form";
import { signUpWithOAuth, signUpWithPassword } from "./actions";

export default async function SignUpPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const checkEmail = params.check_email === "1";

  return (
    <AuthCard>
      <AuthHeader subtitle="Entiende en qué se te va el dinero." />

      {checkEmail ? (
        <div className="rounded-2xl border border-border bg-surface p-5 text-center text-sm">
          <p className="font-medium">Revisa tu correo</p>
          <p className="mt-1.5 text-text-muted">
            Te mandamos un link de confirmación. Ábrelo para activar tu cuenta.
          </p>
        </div>
      ) : (
        <>
          <ErrorNote message={error} />
          <OAuthButtons
            appleAction={signUpWithOAuth.bind(null, "apple")}
            googleAction={signUpWithOAuth.bind(null, "google")}
          />
          <Divider label="o continúa con correo" />

          <form action={signUpWithPassword}>
            <TextField label="Correo" name="email" type="email" autoComplete="email" required />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              type="submit"
              className="mt-1 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white"
            >
              Crear cuenta
            </button>
          </form>

          <FooterLink prompt="¿Ya tienes cuenta?" href="/login" label="Inicia sesión" />
        </>
      )}
    </AuthCard>
  );
}
