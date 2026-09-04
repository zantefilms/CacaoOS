"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/dashboard",
    label: "Inicio",
    icon: (
      <path d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    ),
  },
  {
    href: "/movimientos",
    label: "Movimientos",
    icon: <path d="M4 7h16M4 12h16M4 17h10" />,
  },
] as const;

const itemsRight = [
  {
    href: "/estrategias",
    label: "Estrategias",
    icon: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
  },
  {
    href: "/patrimonio",
    label: "Patrimonio",
    icon: (
      <>
        <path d="M12 20V10" />
        <path d="M12 10c-4 0-6-3-6-6 4 0 6 2 6 6z" />
        <path d="M12 10c4 0 6-3 6-6-4 0-6 2-6 6z" />
      </>
    ),
  },
] as const;

function TabLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 text-[9.5px] font-medium ${active ? "text-accent" : "text-text-faint"}`}
    >
      <svg width="21" height="21" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {icon}
      </svg>
      {label}
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 flex items-start justify-around border-t border-border bg-surface pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      {items.map((item) => (
        <TabLink key={item.href} {...item} active={pathname === item.href} />
      ))}
      <Link
        href="/registro-rapido"
        aria-label="Registro rápido"
        className="-mt-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>
      {itemsRight.map((item) => (
        <TabLink key={item.href} {...item} active={pathname === item.href} />
      ))}
    </nav>
  );
}
