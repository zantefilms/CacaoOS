"use client";

import { useState } from "react";
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

export function RegistroRapidoForm({
  gastoCategorias,
  ingresoCategorias,
  today,
  action,
}: {
  gastoCategorias: Categoria[];
  ingresoCategorias: Categoria[];
  today: string;
  action: (formData: FormData) => void;
}) {
  const [tipo, setTipo] = useState<Direccion>("gasto");
  const [categoriaId, setCategoriaId] = useState("");

  const categorias = tipo === "gasto" ? gastoCategorias : ingresoCategorias;
  const theme = THEME[tipo];

  function selectTipo(next: Direccion) {
    setTipo(next);
    setCategoriaId("");
  }

  return (
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

      <div className="mb-3">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
          Categoría
        </span>
        <div className="grid grid-cols-4 gap-2">
          {categorias.map((c) => {
            const { icon, hue } = getCategoriaIcon(c.nombre, tipo);
            const selected = categoriaId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoriaId(c.id)}
                className="flex flex-col items-center gap-1.5 rounded-2xl border p-2 text-center"
                style={
                  selected
                    ? { borderColor: theme.color, backgroundColor: theme.soft, borderWidth: 1.5 }
                    : { borderColor: "var(--color-border)" }
                }
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{ background: `oklch(93% 0.05 ${hue})` }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    stroke={`oklch(45% 0.11 ${hue})`}
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {icon}
                  </svg>
                </div>
                <span className="text-[10px] font-medium leading-tight text-text">{c.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>

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
  );
}
