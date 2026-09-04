// Aritmética de periodos mensuales para el dashboard. Todavía asume
// "mensual, mes calendario" para todos los usuarios — la lógica real de
// corte_dia / quincenal se conecta cuando el onboarding capture esa
// preferencia (pendiente, ver DECISIONS.md).

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function monthRange(year: number, monthIndex0: number) {
  const start = new Date(Date.UTC(year, monthIndex0, 1));
  const end = new Date(Date.UTC(year, monthIndex0 + 1, 0));
  return { start: toISODate(start), end: toISODate(end) };
}

export function lastNMonths(n: number, from: Date = new Date()) {
  const months: { start: string; end: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - i, 1));
    const { start, end } = monthRange(d.getUTCFullYear(), d.getUTCMonth());
    months.push({ start, end, label: d.toLocaleDateString("es-MX", { month: "short", timeZone: "UTC" }) });
  }
  return months;
}
