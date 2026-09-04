"use client";

import { useState } from "react";

type Tipo = "periodo" | "anual" | "fondo_emergencia";

const TIPO_LABEL: Record<Tipo, string> = {
  periodo: "Ahorro del periodo",
  anual: "Ahorro anual",
  fondo_emergencia: "Fondo de emergencia",
};

export function NuevaMetaForm({
  promedioGastoFijo,
  action,
}: {
  promedioGastoFijo: number;
  action: (formData: FormData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tipo, setTipo] = useState<Tipo>("periodo");
  const [gastosAltos, setGastosAltos] = useState<"si" | "no" | null>(null);
  const [monto, setMonto] = useState("");

  function elegirGastosAltos(valor: "si" | "no") {
    setGastosAltos(valor);
    const meses = valor === "si" ? 6 : 3;
    setMonto(String(Math.round(promedioGastoFijo * meses)));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-2 w-full rounded-2xl border border-dashed border-border py-3 text-sm font-semibold text-accent"
      >
        + Nueva meta
      </button>
    );
  }

  return (
    <form action={action} className="mb-2 rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Nueva meta</span>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-faint underline">
          Cancelar
        </button>
      </div>

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
          Tipo de meta
        </span>
        <select
          name="tipo"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as Tipo);
            setGastosAltos(null);
            setMonto("");
          }}
          className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        >
          {(Object.keys(TIPO_LABEL) as Tipo[]).map((t) => (
            <option key={t} value={t}>
              {TIPO_LABEL[t]}
            </option>
          ))}
        </select>
      </label>

      {tipo === "fondo_emergencia" && (
        <div className="mb-3">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
            ¿Tienes gastos altos inesperados con frecuencia? (salud, mantenimiento de carro, etc.)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => elegirGastosAltos("si")}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${gastosAltos === "si" ? "border-accent bg-accent-soft text-accent" : "border-border text-text-muted"}`}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => elegirGastosAltos("no")}
              className={`flex-1 rounded-xl border py-2 text-sm font-semibold ${gastosAltos === "no" ? "border-accent bg-accent-soft text-accent" : "border-border text-text-muted"}`}
            >
              No
            </button>
          </div>
          {gastosAltos && (
            <p className="mt-2 text-xs text-text-faint">
              Sugerido: {gastosAltos === "si" ? "6" : "3"} meses de tu gasto fijo promedio (
              {promedioGastoFijo > 0
                ? `$${Math.round(promedioGastoFijo).toLocaleString("es-MX")}/mes`
                : "todavía no hay suficiente historial, ajústalo a mano"}
              ). Puedes cambiarlo abajo.
            </p>
          )}
          <input type="hidden" name="gastos_altos_frecuentes" value={gastosAltos ?? ""} />
        </div>
      )}

      <label className="mb-3 block">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
          Monto objetivo (MXN)
        </span>
        <input
          name="monto_objetivo"
          type="number"
          step="1"
          min="1"
          inputMode="decimal"
          required
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
      </label>

      <button type="submit" className="w-full rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-white">
        Guardar meta
      </button>
    </form>
  );
}
