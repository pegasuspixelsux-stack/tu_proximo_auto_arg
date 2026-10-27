"use client";

import {
  Banknote,
  ChevronDown,
  CreditCard,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import TrustFeatures from "./TrustFeatures";
import WhatsAppLeadButton from "./WhatsAppLeadButton";

const WHATSAPP_MESSAGE =
  "Hola, quiero consultar por las opciones de financiación y permutas en Tu Próximo Auto.";

const OPTIONS: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
}[] = [
  {
    icon: CreditCard,
    title: "Financiación Hasta el 40%",
    description:
      "Financiá un saldo del vehículo en cuotas fijas utilizando tarjetas de crédito (Visa, Mastercard, Cabal). Combiná múltiples tarjetas en el acto.",
    badge: "Hasta 40% del valor",
  },
  {
    icon: RefreshCw,
    title: "Tomamos tu Usado",
    description:
      "Aceptamos tu vehículo actual como parte de pago. Realizamos la tasación técnica y comercial directa durante tu cita en el salón de ventas.",
    badge: "Tasación en el acto",
  },
  {
    icon: Banknote,
    title: "Mejor Precio de Contado",
    description:
      "Accedé a precios promocionales bonificados y transferencia rápida al abonar de contado o transferencia directa.",
    badge: "Precio Bonificado",
  },
];

export default function FinancingSection({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const [open, setOpen] = useState(false);

  // Expand when a link or the URL points at this section (collapsed on mobile).
  useEffect(() => {
    const expand = () => {
      if (window.location.hash === "#financiacion") setOpen(true);
    };
    expand();
    window.addEventListener("hashchange", expand);
    return () => window.removeEventListener("hashchange", expand);
  }, []);

  return (
    <section
      id="financiacion"
      data-testid="financing-section"
      aria-labelledby="financing-heading"
      className="scroll-mt-4 md:px-3 md:py-12 lg:px-6 lg:py-16"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="financing-content"
        data-testid="financing-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 border-y border-line px-3 py-4 text-left md:hidden"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-fg">
          Opciones de pago
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="financing-content"
        className={open ? "px-3 pb-10 pt-8 md:p-0" : "hidden md:block"}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-muted md:block">
            Opciones de pago
          </p>
          <h2
            id="financing-heading"
            className="text-balance text-3xl font-semibold tracking-[-0.02em] md:mt-2 lg:text-4xl"
          >
            Financiación y Permutas a tu medida
          </h2>
          <p className="mt-3 text-sm font-medium text-muted sm:text-base">
            Elegí la opción que mejor se adapte a tu compra y coordiná tu visita
            al salón de ventas.
          </p>
        </div>

        <ul className="mx-auto mt-8 grid max-w-[1440px] md:mt-10 grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {OPTIONS.map(({ icon: Icon, title, description, badge }) => (
            <li
              key={title}
              className="card-glow flex aspect-[3/2] flex-col md:aspect-square lg:aspect-[11/8] rounded-2xl border border-line bg-surface p-8 md:p-6 shadow-[var(--card-shadow)] backdrop-blur-md motion-safe:hover:scale-[1.02]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-blue-500">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {description}
              </p>
              <span className="mt-5 w-fit rounded-full border border-line px-3 py-1 text-[11px] font-medium text-fg">
                {badge}
              </span>
            </li>
          ))}
        </ul>

        <TrustFeatures />

        <div className="mt-8 flex justify-center md:mt-10">
          <WhatsAppLeadButton
            targetPhone={whatsappNumber}
            message={WHATSAPP_MESSAGE}
            sourceItem="Financiación y citas"
            testId="financing-whatsapp"
            className="inline-flex items-center gap-2 rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[opacity,transform] duration-150 hover:opacity-85 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Consultar Financiación y Citas
          </WhatsAppLeadButton>
        </div>
      </div>
    </section>
  );
}
