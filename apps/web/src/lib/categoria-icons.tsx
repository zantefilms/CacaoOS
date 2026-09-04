// Ícono + tono por categoría, portado 1:1 de design/RegistroRapido-Categoria.dc.html
// (el canvas de diseño aprobado) para mantener consistencia visual entre el
// mockup y la app real.

import type { ReactNode } from "react";

type CategoriaIcon = { icon: ReactNode; hue: number };

const gastoIcons: Record<string, CategoriaIcon> = {
  "Cafés": {
    hue: 50,
    icon: (
      <>
        <path d="M4 8h13a3 3 0 0 1 0 6h-1" />
        <path d="M4 8v7a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V8" />
      </>
    ),
  },
  Carro: {
    hue: 230,
    icon: (
      <>
        <rect x="3" y="11" width="18" height="6" rx="2" />
        <circle cx="7.5" cy="17" r="1.4" />
        <circle cx="16.5" cy="17" r="1.4" />
        <path d="M5 11l2-5h10l2 5" />
      </>
    ),
  },
  Ejercicio: { hue: 20, icon: <path d="M4 12h16M4 9v6M20 9v6M7 7v10M17 7v10" /> },
  Entretenimiento: {
    hue: 300,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 8 16 12 10 16" />
      </>
    ),
  },
  Salud: {
    hue: 10,
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
  Gasolina: {
    hue: 80,
    icon: (
      <>
        <path d="M6 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
        <path d="M6 20h8" />
        <path d="M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-2-2" />
      </>
    ),
  },
  Mascota: {
    hue: 65,
    icon: (
      <>
        <circle cx="12" cy="15.5" r="3.2" />
        <circle cx="7" cy="9" r="1.5" />
        <circle cx="17" cy="9" r="1.5" />
        <circle cx="9.5" cy="6" r="1.3" />
        <circle cx="14.5" cy="6" r="1.3" />
      </>
    ),
  },
  Random: {
    hue: 265,
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
  },
  Regalos: {
    hue: 345,
    icon: (
      <>
        <rect x="4" y="9" width="16" height="11" rx="1.5" />
        <path d="M4 13h16" />
        <path d="M12 9v11" />
        <path d="M12 9c-1.5-3-5-4-5-1.5S9.5 9 12 9zM12 9c1.5-3 5-4 5-1.5S14.5 9 12 9z" />
      </>
    ),
  },
  Restaurantes: { hue: 35, icon: <path d="M6 2v8M9 2v8M6 6h3M17 2v20M17 2c-2.5 0-4 2-4 5s1.5 5 4 5" /> },
  "Shopping Físico": {
    hue: 285,
    icon: (
      <>
        <path d="M6 8h12l1 12H5z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
  },
  "Shopping Online": {
    hue: 310,
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a4 4 0 0 1 8 0v2" />
      </>
    ),
  },
  Snacks: {
    hue: 55,
    icon: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="9" cy="10" r="0.9" fill="currentColor" />
        <circle cx="14" cy="9" r="0.9" fill="currentColor" />
        <circle cx="15" cy="14" r="0.9" fill="currentColor" />
        <circle cx="10" cy="15" r="0.9" fill="currentColor" />
      </>
    ),
  },
  Social: {
    hue: 210,
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5" />
        <circle cx="17" cy="9" r="2.4" />
        <path d="M15.5 14.2c2.5.3 4.5 2 4.5 5.8" />
      </>
    ),
  },
  Subscripciones: {
    hue: 255,
    icon: (
      <>
        <path d="M4 12a8 8 0 0 1 14-5.3M20 4v4h-4" />
        <path d="M20 12a8 8 0 0 1-14 5.3M4 20v-4h4" />
      </>
    ),
  },
  Super: {
    hue: 95,
    icon: (
      <>
        <path d="M4 10h16l-1.5 8h-13z" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
  },
  "Take-out": {
    hue: 25,
    icon: (
      <>
        <rect x="5" y="9" width="14" height="10" rx="2" />
        <path d="M5 9l2-4h10l2 4" />
        <line x1="9" y1="13" x2="9" y2="16" />
        <line x1="12" y1="13" x2="12" y2="16" />
        <line x1="15" y1="13" x2="15" y2="16" />
      </>
    ),
  },
  Transporte: {
    hue: 220,
    icon: (
      <>
        <rect x="4" y="6" width="16" height="11" rx="2" />
        <circle cx="8" cy="19" r="1.3" />
        <circle cx="16" cy="19" r="1.3" />
        <line x1="4" y1="11" x2="20" y2="11" />
      </>
    ),
  },
  Viajes: { hue: 190, icon: <path d="M3 11l18-8-8 18-2-8-8-2z" /> },
};

const ingresoIcons: Record<string, CategoriaIcon> = {
  Freelance: {
    hue: 150,
    icon: (
      <>
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M2 20h20l-2-4H4z" />
      </>
    ),
  },
  Comisiones: {
    hue: 150,
    icon: (
      <>
        <circle cx="7" cy="7" r="2" />
        <circle cx="17" cy="17" r="2" />
        <line x1="6" y1="18" x2="18" y2="6" />
      </>
    ),
  },
  Venta: {
    hue: 150,
    icon: (
      <>
        <path d="M3 11.5 11.5 3H19a2 2 0 0 1 2 2v7.5L12.5 21 3 11.5z" />
        <circle cx="15.5" cy="8.5" r="1.3" fill="currentColor" />
      </>
    ),
  },
  "Regalo recibido": {
    hue: 150,
    icon: (
      <>
        <path d="M12 3v10" />
        <polyline points="8 9 12 13 16 9" />
        <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
      </>
    ),
  },
  "Otro ingreso": {
    hue: 150,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    ),
  },
};

export function getCategoriaIcon(nombre: string, direccion: "gasto" | "ingreso"): CategoriaIcon {
  const table = direccion === "gasto" ? gastoIcons : ingresoIcons;
  return table[nombre] ?? { hue: direccion === "gasto" ? 45 : 150, icon: <circle cx="12" cy="12" r="8" /> };
}
