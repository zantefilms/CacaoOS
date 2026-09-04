import {
  AuthCard,
  AuthHeader,
  Divider,
  ErrorNote,
  FooterLink,
  OAuthButtons,
  TextField,
} from "@/components/auth-form";
import { signInWithOAuth, signInWithPassword } from "./actions";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <AuthCard>
      <AuthHeader subtitle="Bienvenido de vuelta." />
      <ErrorNote message={error} />
      <OAuthButtons
        appleAction={signInWithOAuth.bind(null, "apple")}
        googleAction={signInWithOAuth.bind(null, "google")}
      />
      <Divider label="o continúa con correo" />

      <form action={signInWithPassword}>
        <TextField label="Correo" name="email" type="email" autoComplete="email" required />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className="mt-1 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white"
        >
          Iniciar sesión
        </button>
      </form>

      <FooterLink prompt="¿Aún no tienes cuenta?" href="/signup" label="Crea una" />
    </AuthCard>
  );
}
