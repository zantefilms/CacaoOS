"use client";

import { useState } from "react";

type Cuenta = { banco: string; nombre: string; tipo: string; terminacion: string };

const BANCOS = [
  { value: "santander", label: "Santander" },
  { value: "nu", label: "Nu" },
  { value: "plata", label: "Plata" },
  { value: "bbva", label: "BBVA" },
  { value: "otro", label: "Otro" },
];

const NOTIF_TIPOS = [
  {
    tipo: "limite_presupuesto",
    titulo: "Límite de presupuesto semanal",
    sub: "Te avisamos en cuanto te acerques al tope que pusiste por categoría.",
  },
  {
    tipo: "cierre_periodo",
    titulo: "Cierre de periodo positivo",
    sub: "Un mensaje cuando cumples tus metas al cierre del periodo.",
  },
  {
    tipo: "transaccion_desconocida",
    titulo: "Transacción desconocida",
    sub: "Para clasificarla al momento, con un par de toques.",
  },
  {
    tipo: "recomendaciones_app",
    titulo: "Recomendaciones de la app",
    sub: "Cuando vas muy bien con tus hábitos, o si detectamos algo raro como un cargo duplicado.",
  },
];

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-surface-2"}`}
        />
      ))}
    </div>
  );
}

export function OnboardingWizard({
  action,
  error,
}: {
  action: (formData: FormData) => void;
  error?: string;
}) {
  const [step, setStep] = useState(0);

  const [salarioFijo, setSalarioFijo] = useState("");
  const [ingresoNoFijo, setIngresoNoFijo] = useState("");
  const [categoriasIngreso, setCategoriasIngreso] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [cuentas, setCuentas] = useState<Cuenta[]>([
    { banco: "santander", nombre: "", tipo: "debito", terminacion: "" },
  ]);
  const [corteTipo, setCorteTipo] = useState<"mensual" | "quincenal">("mensual");
  const [trackingEmail, setTrackingEmail] = useState("");
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_TIPOS.map((n) => [n.tipo, true])),
  );

  function agregarCategoria() {
    const nombre = nuevaCategoria.trim();
    if (!nombre || categoriasIngreso.includes(nombre)) return;
    setCategoriasIngreso([...categoriasIngreso, nombre]);
    setNuevaCategoria("");
  }

  function quitarCategoria(nombre: string) {
    setCategoriasIngreso(categoriasIngreso.filter((c) => c !== nombre));
  }

  function actualizarCuenta(i: number, campo: keyof Cuenta, valor: string) {
    setCuentas(cuentas.map((c, idx) => (idx === i ? { ...c, [campo]: valor } : c)));
  }

  function agregarCuenta() {
    setCuentas([...cuentas, { banco: "santander", nombre: "", tipo: "debito", terminacion: "" }]);
  }

  function quitarCuenta(i: number) {
    setCuentas(cuentas.filter((_, idx) => idx !== i));
  }

  const salarioValido = Number(salarioFijo) > 0;

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <ProgressDots step={step} total={3} />

        {error && (
          <p className="mb-4 rounded-xl bg-negative-soft px-3 py-2 text-sm text-negative">{error}</p>
        )}

        <form action={action}>
          {/* Campos que persisten aunque cambies de paso — el estado vive
              aquí arriba, así que ningún dato se pierde al navegar. */}
          <input type="hidden" name="salario_fijo_mensual" value={salarioFijo} />
          <input type="hidden" name="ingreso_no_fijo_aproximado" value={ingresoNoFijo} />
          <input type="hidden" name="categorias_ingreso" value={JSON.stringify(categoriasIngreso)} />
          <input type="hidden" name="cuentas" value={JSON.stringify(cuentas)} />
          <input type="hidden" name="corte_tipo" value={corteTipo} />
          <input type="hidden" name="tracking_email" value={trackingEmail} />
          {Object.entries(notifs)
            .filter(([, on]) => on)
            .map(([tipo]) => (
              <input key={tipo} type="hidden" name="notif_tipo" value={tipo} />
            ))}

          {step === 0 && (
            <div>
              <h1 className="font-display text-2xl">Cuéntanos de tus finanzas</h1>
              <p className="mt-1 mb-5 text-sm text-text-muted">
                Esto nos ayuda a armar tu presupuesto y tus metas.
              </p>

              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Salario fijo mensual
              </label>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={salarioFijo}
                onChange={(e) => setSalarioFijo(e.target.value)}
                className="mb-1 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-lg outline-none focus:border-accent"
              />
              <p className="mb-4 text-[11px] text-text-faint">
                Lo que recibes cada mes de forma segura (nómina, honorarios fijos).
              </p>

              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Ingreso aproximado no fijo (opcional)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={ingresoNoFijo}
                onChange={(e) => setIngresoNoFijo(e.target.value)}
                className="mb-1 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-accent"
              />
              <p className="mb-4 text-[11px] text-text-faint">
                Solo como referencia para tu presupuesto — cada ingreso extra real lo registras en
                Registro rápido, o lo confirmas cuando el bot lo detecte.
              </p>

              {Number(ingresoNoFijo) > 0 && (
                <div className="mb-4 rounded-2xl border border-border bg-surface p-3">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                    ¿De qué tipo son? (ej. Freelance, comisiones, renta)
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarCategoria();
                        }
                      }}
                      placeholder="Escribe y agrega"
                      className="flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={agregarCategoria}
                      className="rounded-xl bg-accent-soft px-3 text-sm font-semibold text-accent"
                    >
                      Agregar
                    </button>
                  </div>
                  {categoriasIngreso.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {categoriasIngreso.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1.5 rounded-full bg-positive-soft px-3 py-1 text-xs font-medium text-positive-strong"
                        >
                          {c}
                          <button type="button" onClick={() => quitarCategoria(c)} aria-label={`Quitar ${c}`}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Cuentas a rastrear
              </p>
              {cuentas.map((c, i) => (
                <div key={i} className="mb-2 flex items-center gap-1.5">
                  <select
                    value={c.banco}
                    onChange={(e) => actualizarCuenta(i, "banco", e.target.value)}
                    className="rounded-lg border border-border bg-surface px-2 py-2 text-xs outline-none"
                  >
                    {BANCOS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={c.nombre}
                    onChange={(e) => actualizarCuenta(i, "nombre", e.target.value)}
                    className="w-0 flex-1 rounded-lg border border-border bg-surface px-2 py-2 text-xs outline-none"
                  />
                  <select
                    value={c.tipo}
                    onChange={(e) => actualizarCuenta(i, "tipo", e.target.value)}
                    className="rounded-lg border border-border bg-surface px-2 py-2 text-xs outline-none"
                  >
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito</option>
                  </select>
                  <input
                    type="text"
                    placeholder="0000"
                    maxLength={4}
                    value={c.terminacion}
                    onChange={(e) => actualizarCuenta(i, "terminacion", e.target.value.replace(/\D/g, ""))}
                    className="w-12 rounded-lg border border-border bg-surface px-2 py-2 text-xs outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => quitarCuenta(i)}
                    aria-label="Quitar cuenta"
                    className="flex-shrink-0 text-text-faint"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={agregarCuenta}
                className="mb-4 text-sm font-semibold text-accent"
              >
                + Agregar cuenta
              </button>

              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Día de corte del periodo
              </p>
              <div className="mb-6 flex rounded-2xl border border-border p-1">
                {(["mensual", "quincenal"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCorteTipo(t)}
                    className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize ${corteTipo === t ? "bg-accent text-white" : "text-text-muted"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={!salarioValido}
                onClick={() => setStep(1)}
                className="w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="font-display text-2xl">Tu correo de rastreo</h1>
              <p className="mt-1 mb-5 text-sm text-text-muted">
                Cacao lo usa solo para leer alertas bancarias — recomendamos uno dedicado,
                distinto al que usas para iniciar sesión.
              </p>

              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-text-faint">
                Correo a rastrear (opcional por ahora)
              </label>
              <input
                type="email"
                value={trackingEmail}
                onChange={(e) => setTrackingEmail(e.target.value)}
                placeholder="tu.alertas@gmail.com"
                className="mb-4 w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-accent"
              />

              <div className="mb-6 rounded-2xl bg-positive-soft p-4">
                <p className="mb-2 text-xs font-bold text-positive-strong">
                  Por qué te recomendamos uno dedicado
                </p>
                <ul className="space-y-1.5 text-xs text-text">
                  <li>• Más seguro: Cacao solo abre correos que coincidan con tu banco.</li>
                  <li>• Tu bandeja personal queda fuera — nunca mezclamos correos.</li>
                  <li>• Revocas el acceso cuando quieras, sin afectar tu correo principal.</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-text-muted"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 rounded-2xl bg-accent py-3 text-sm font-semibold text-white"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-2xl">¿Qué te gustaría que te avisemos?</h1>
              <p className="mt-1 mb-4 text-sm text-text-muted">
                Puedes cambiar esto después desde Ajustes.
              </p>

              {NOTIF_TIPOS.map((n) => (
                <div key={n.tipo} className="flex items-start gap-3 border-b border-border py-3.5 last:border-none">
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{n.titulo}</div>
                    <div className="mt-0.5 text-xs text-text-faint">{n.sub}</div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifs[n.tipo]}
                    onClick={() => setNotifs({ ...notifs, [n.tipo]: !notifs[n.tipo] })}
                    className={`mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors ${notifs[n.tipo] ? "bg-accent" : "bg-surface-2 border border-border"}`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${notifs[n.tipo] ? "translate-x-[22px]" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              ))}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-border py-3 text-sm font-semibold text-text-muted"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-accent py-3 text-sm font-semibold text-white"
                >
                  Finalizar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
