import type { Metadata } from "next";
import { Instrument_Serif, Work_Sans } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Cacao",
  description: "Entiende en qué se te va el dinero.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${workSans.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface-2 font-sans text-text sm:py-6">
        {/* Marco tipo iPhone 16 Pro (393x852pt) — a ancho completo en un
            teléfono real, centrado con borde sutil en pantallas anchas
            para simular el layout mientras se desarrolla. */}
        <div className="relative mx-auto flex min-h-dvh w-full max-w-[393px] flex-col overflow-hidden bg-bg sm:min-h-[852px] sm:rounded-[40px] sm:border sm:border-border sm:shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
