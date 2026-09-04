export default function PatrimonioPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-10 text-center">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-accent">
        <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
        Próximamente
      </div>

      <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-accent-soft">
        <svg width="46" height="46" viewBox="0 0 24 24" stroke="var(--color-accent)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21V11" />
          <path d="M12 11c-4.5 0-7-3.2-7-7 4.5 0 7 2.2 7 7z" />
          <path d="M12 11c4.5 0 7-3.2 7-7-4.5 0-7 2.2-7 7z" />
          <path d="M6 21h12" />
        </svg>
      </div>

      <div>
        <div className="text-lg font-semibold">Aquí va a crecer tu Patrimonio</div>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-muted">
          Estamos diseñando una forma visual de ver los resultados de tus buenos hábitos a
          largo plazo. Por ahora seguimos enfocados en que tu tracking financiero sea
          impecable.
        </p>
      </div>
    </main>
  );
}
