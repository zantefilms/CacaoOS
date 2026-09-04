import Link from "next/link";

export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}

export function AuthHeader({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-8 text-center">
      <div className="font-display text-3xl">Cacao</div>
      <p className="mt-1.5 text-sm text-text-muted">{subtitle}</p>
    </div>
  );
}

type OAuthAction = (formData: FormData) => void | Promise<void>;

export function OAuthButtons({
  appleAction,
  googleAction,
}: {
  appleAction: OAuthAction;
  googleAction: OAuthAction;
}) {
  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <button
        formAction={appleAction}
        className="flex items-center justify-center gap-2 rounded-2xl bg-[oklch(20%_0_0)] px-4 py-3 text-sm font-semibold text-white"
      >
        <svg width="14" height="18" viewBox="0 0 384 512" fill="white" aria-hidden>
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
        </svg>
        Continuar con Apple
      </button>
      <button
        formAction={googleAction}
        className="flex items-center justify-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-text"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.3c0-.85-.08-1.66-.22-2.44H12v4.62h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.94H1.28v3.1C3.25 21.3 7.31 24 12 24z" />
          <path fill="#FBBC05" d="M5.28 14.31A7.2 7.2 0 0 1 4.9 12c0-.8.14-1.58.38-2.31v-3.1H1.28A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.28 5.41z" />
          <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.28 6.59l4 3.1c.95-2.83 3.6-4.94 6.72-4.94z" />
        </svg>
        Continuar con Google
      </button>
    </div>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-text-faint">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

export function TextField(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
        {label}
      </span>
      <input
        {...rest}
        className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-accent"
      />
    </label>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mb-4 rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">{message}</p>
  );
}

export function FooterLink({ prompt, href, label }: { prompt: string; href: string; label: string }) {
  return (
    <p className="mt-6 text-center text-sm text-text-muted">
      {prompt} <Link href={href} className="font-medium text-accent">{label}</Link>
    </p>
  );
}
