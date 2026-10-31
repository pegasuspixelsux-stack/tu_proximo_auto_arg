"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/**
 * Plain-text intro for search engines and readers: zones served and how buying
 * works. On mobile it collapses behind a bar, like the payment-options section.
 */
export default function SeoIntro() {
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby="seo-intro-heading"
      data-testid="seo-intro"
      className="mx-auto max-w-5xl md:px-3 md:py-12 lg:px-6 lg:py-16"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="seo-intro-content"
        data-testid="seo-intro-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 border-y border-line px-3 py-4 text-left md:hidden"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-fg">
          Comprá tu auto
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="seo-intro-content"
        className={open ? "px-3 pb-10 pt-8 md:p-0" : "hidden md:block"}
      >
        <h2
          id="seo-intro-heading"
          className="text-balance text-2xl font-semibold tracking-[-0.02em] lg:text-3xl"
        >
          Comprá tu auto usado en Tigre, Zona Norte y Buenos Aires
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 md:gap-10">
          <p className="leading-relaxed text-muted">
            En Tu Próximo Auto Argentina encontrás autos usados en venta,
            seleccionados y verificados, con atención en nuestro salón de ventas
            de Tigre. Recibimos a clientes de Tigre, Nordelta, Don Torcuato,
            General Pacheco, San Fernando y Pilar, y de toda la Zona Norte, el
            Gran Buenos Aires, la Provincia de Buenos Aires y CABA.
          </p>
          <p className="leading-relaxed text-muted">
            Cada unidad cuenta con VTV vigente y documentación al día, y nos
            ocupamos de la gestoría y la transferencia. Podés financiar con
            tarjeta de crédito, entregar tu usado como parte de pago (permuta) y
            probar el auto antes de decidir, coordinando una cita previa por
            WhatsApp.
          </p>
        </div>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
          <Link href="/autos" className="underline underline-offset-4">
            Ver todos los autos usados en venta
          </Link>
        </p>
      </div>
    </section>
  );
}
