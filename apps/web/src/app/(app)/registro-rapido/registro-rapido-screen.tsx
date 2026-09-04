"use client";

import { useState } from "react";
import Link from "next/link";
import { getCategoriaIcon } from "@/lib/categoria-icons";

type Categoria = { id: string; nombre: string };
type Direccion = "gasto" | "ingreso";

const THEME: Record<Direccion, { color: string; soft: string; label: string }> = {
  gasto: { color: "var(--color-negative)", soft: "var(--color-negative-soft)", label: "Gasto en efectivo" },
  ingreso: {
    color: "var(--color-positive-strong)",
    soft: "var(--color-positive-soft)",
    label: "Ingreso adicional",
  },
};

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CategoriaBadge({ nombre, direccion, size = 17 }: { nombre: string; direccion: Direccion; size?: number }) {
  const { icon, hue } = getCategoriaIcon(nombre, direccion);
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-[9px]"
      style={{ background: `oklch(93% 0.05 ${hue})`, width: size + 15, height: size + 15 }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" stroke={`oklch(45% 0.11 ${hue})`} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
    </div>
  );
}

export function RegistroRapidoScreen({
  gastoCategorias,
  ingresoCategorias,
  today,
  action,
  error,
}: {
  gastoCategorias: Categoria[];
  ingresoCategorias: Categoria[];
  today: string;
  action: (formData: FormData) => void;
  error?: string;
}) {
  const [tipo, setTipo] = useState<Direccion>("gasto");
  const [categoriaId, setCategoriaId] = useState("");
  const [view, setView] = useState<"form" | "categoria">("form");

  const categorias = tipo === "gasto" ? gastoCategorias : ingresoCategorias;
  const theme = THEME[tipo];
  const categoriaSeleccionada = categorias.find((c) => c.id === categoriaId);

  function selectTipo(next: Direccion) {
    setTipo(next);
    setCategoriaId("");
  }

  if (view === "categoria") {
    return (
      <main className="flex-1 px-5 py-12">
        <div className="mb-5 flex items-center justify-between">
          <div className="font-display text-2xl">Categoría</div>
          <button
            type="button"
            onClick={() => setView("form")}
            aria-label="Cerrar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoriaId(c.id);
                setView("form");
              }}
              className="flex flex-col items-center gap-1.5 rounded-2xl border p-2 text-center"
              style={
                c.id === categoriaId
                  ? { borderColor: theme.color, backgroundColor: theme.soft, borderWidth: 1.5 }
                  : { borderColor: "var(--color-border)" }
              }
            >
              <CategoriaBadge nombre={c.nombre} direccion={tipo} />
              <span className="text-[10px] font-medium leading-tight text-text">{c.nombre}</span>
            </button>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1 text-center">
            <div className="font-display text-2xl">Registro rápido</div>
            <p className="mt-1 text-sm text-text-muted">
              Gasto en efectivo o ingreso adicional — sin pasar por el bot.
            </p>
          </div>
          <Link
            href="/dashboard"
            aria-label="Cerrar"
            className="-mt-1 -mr-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-2 text-text-muted"
          >
            <CloseIcon />
          </Link>
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">{error}</p>
        )}

        <form action={action}>
          <input type="hidden" name="tipo_movimiento" value={tipo} />
          <input type="hidden" name="categoria_id" value={categoriaId} />

          <fieldset className="mb-4 flex rounded-2xl border border-border p-1">
            {(["gasto", "ingreso"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => selectTipo(t)}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${tipo === t ? "text-white" : "text-text-muted"}`}
                style={tipo === t ? { backgroundColor: THEME[t].color } : undefined}
              >
                {THEME[t].label}
              </button>
            ))}
          </fieldset>

          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Monto (MXN)
            </span>
            <input
              name="monto"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              required
              className="w-full rounded-2xl border-2 bg-surface px-4 py-3 text-lg outline-none transition-colors"
              style={{ borderColor: theme.color }}
            />
          </label>

          <button
            type="button"
            onClick={() => setView("categoria")}
            className="mb-3 flex w-full items-center justify-between rounded-2xl border p-2.5 text-left transition-colors"
            style={
              categoriaSeleccionada
                ? { borderColor: theme.color, backgroundColor: theme.soft }
                : { borderColor: "var(--color-border)" }
            }
          >
            <span className="flex items-center gap-2.5">
              {categoriaSeleccionada ? (
                <>
                  <CategoriaBadge nombre={categoriaSeleccionada.nombre} direccion={tipo} size={15} />
                  <span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                      Categoría
                    </span>
                    <span className="text-sm font-semibold">{categoriaSeleccionada.nombre}</span>
                  </span>
                </>
              ) : (
                <span className="px-1 text-sm text-text-faint">Selecciona una categoría</span>
              )}
            </span>
            <span className="text-text-faint">
              <ChevronRight />
            </span>
          </button>

          <label className="mb-3 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Descriptor
            </span>
            <input
              name="descriptor"
              type="text"
              placeholder={tipo === "gasto" ? "Tacos con Ana" : "Pago cliente X"}
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
              Fecha
            </span>
            <input
              name="fecha"
              type="date"
              defaultValue={today}
              required
              className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
            />
          </label>

          <button
            type="submit"
            disabled={!categoriaId}
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
            style={{ backgroundColor: theme.color }}
          >
            Guardar {tipo === "gasto" ? "gasto" : "ingreso"}
          </button>
        </form>
      </div>
    </main>
  );
}
