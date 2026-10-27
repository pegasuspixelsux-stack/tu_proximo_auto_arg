"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  BadgeCheck,
  Camera,
  ClipboardList,
  CreditCard,
  Database,
  MessageCircle,
  ShieldCheck,
  Star,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useId, useState } from "react";

type Mode = "private" | "dealer";

const TABS: { id: Mode; label: string }[] = [
  { id: "private", label: "Vendedor Particular" },
  { id: "dealer", label: "Concesionarias" },
];

interface Step {
  icon: LucideIcon;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    icon: ClipboardList,
    title: "Formulario",
    text: "Completá los datos de tu vehículo: marca, modelo, año, kilometraje, precio y equipamiento.",
  },
  {
    icon: Camera,
    title: "Fotos",
    text: "Subí fotos en alta resolución del exterior y del interior para destacar tu aviso.",
  },
  {
    icon: CreditCard,
    title: "Pago vía link",
    text: "Te enviamos un link de pago por email o WhatsApp. Pagá con tarjeta de crédito, saldo de Mercado Pago o en efectivo en cualquier local de cobranza.",
  },
  {
    icon: BadgeCheck,
    title: "Confirmación y publicación",
    text: "Verificamos el pago automáticamente y tu aviso se publica al instante.",
  },
];

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

const FEATURES: Feature[] = [
  {
    icon: Database,
    title: "Carga e integración masiva",
    text: "Importá todo tu inventario de una vez, por planilla o integración vía API, y mantenelo sincronizado.",
  },
  {
    icon: Star,
    title: "Ubicación Prime y Destacados",
    text: "Posicionamiento prioritario en las búsquedas y espacios destacados para tus unidades.",
  },
  {
    icon: Store,
    title: "Perfil institucional y reseñas",
    text: "Una página propia con tu marca, reseñas de clientes, mapa de ubicación y el catálogo completo de tu showroom.",
  },
];

const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95";
const SECONDARY_BTN =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg transition-[transform,border-color] duration-150 hover:border-fg/40 active:scale-95";

export default function PublishSection() {
  const [mode, setMode] = useState<Mode>("private");
  const reduce = useReducedMotion();
  const baseId = useId();
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <section
      id="publicar"
      data-testid="publish-section"
      aria-labelledby="publish-heading"
      className="-mt-px mx-auto max-w-[1440px] scroll-mt-4 lg:mt-0 lg:px-6 lg:pb-24 lg:pt-10"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="publish-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 border-y border-line px-3 py-4 text-left lg:hidden"
      >
        <span className="block text-xs font-medium uppercase tracking-widest text-fg">
          Publicá tu auto &amp; concesionarias
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={panelId}
        className={`${open ? "block" : "hidden"} px-3 pb-10 pt-6 lg:block lg:px-0 lg:pb-0 lg:pt-0`}
      >
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="hidden lg:block">
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              Publicar
            </p>
            <h2
              id="publish-heading"
              className="mt-2 text-balance text-3xl font-light tracking-[-0.02em] lg:text-4xl"
            >
              Publicá tu Auto &amp; Concesionarias
            </h2>
          </div>

          <LayoutGroup id="publish-tabs">
            <div
              role="tablist"
              aria-label="Tipo de vendedor"
              className="inline-flex w-full rounded-full border border-line bg-surface p-1 sm:w-auto"
            >
              {TABS.map((tab) => {
                const selected = tab.id === mode;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`${baseId}-panel-${tab.id}`}
                    data-testid={`publish-tab-${tab.id}`}
                    onClick={() => setMode(tab.id)}
                    className={`relative flex-1 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-medium transition-[color,transform] duration-150 active:scale-[0.97] sm:flex-none ${
                      selected ? "text-on-inverse" : "text-muted hover:text-fg"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="publish-pill"
                        transition={{
                          type: "spring",
                          duration: 0.4,
                          bounce: 0.15,
                        }}
                        className="absolute inset-0 rounded-full bg-inverse"
                      />
                    )}
                    <span className="relative">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <div className="mt-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              role="tabpanel"
              id={`${baseId}-panel-${mode}`}
              aria-labelledby={`${baseId}-tab-${mode}`}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -8 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              {mode === "private" ? <PrivatePanel /> : <DealerPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function PrivatePanel() {
  return (
    <>
      <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="rounded-xl border border-line bg-surface p-6 shadow-[var(--card-shadow)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg">
                <step.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <span className="text-xs font-medium tabular-nums text-subtle">
                Paso {i + 1}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-medium tracking-tight">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {step.text}
            </p>
          </li>
        ))}
      </ol>

      <div
        data-testid="publish-secure-banner"
        className="mt-4 flex flex-col items-start justify-between gap-5 rounded-xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] md:flex-row md:items-center lg:p-8"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-inverse text-on-inverse">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="text-lg font-medium tracking-tight">
              Pago 100% seguro con Mercado Pago
            </p>
            <p className="mt-1 text-sm text-muted">
              Procesamos tu pago a través de Mercado Pago. Tu aviso se publica
              en cuanto se confirma.
            </p>
          </div>
        </div>
        <a
          href="#"
          data-testid="publish-cta"
          className={`${PRIMARY_BTN} w-full md:w-auto`}
        >
          Publicar mi vehículo
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </a>
      </div>
    </>
  );
}

function DealerPanel() {
  return (
    <>
      <div className="rounded-xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] lg:p-10">
        <h3 className="max-w-3xl text-balance text-2xl font-light tracking-[-0.02em] lg:text-4xl">
          ¿Querés publicar todo tu inventario en Tu Próximo Auto?
        </h3>
        <p className="mt-4 max-w-2xl text-muted">
          Sumá tu concesionaria y llegá a compradores de todo el país con un
          perfil propio y herramientas pensadas para vender más.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#" data-testid="dealer-plan-cta" className={PRIMARY_BTN}>
            Solicitar Plan Concesionaria
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </a>
          <a
            href="#"
            data-testid="dealer-advisor-cta"
            className={SECONDARY_BTN}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Hablar con un asesor
          </a>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <li
            key={feature.title}
            className="rounded-xl border border-line bg-surface p-6 shadow-[var(--card-shadow)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg">
              <feature.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-medium tracking-tight">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {feature.text}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
