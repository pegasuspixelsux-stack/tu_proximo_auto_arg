"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const QUICK_LINKS = [
  { label: "Comprar un auto", href: "#inventory" },
  { label: "Vender mi auto", href: "#" },
];
const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function HeroSearch({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div
      className={
        compact
          ? "relative w-full shrink-0"
          : "mx-auto w-full max-w-xl px-3 text-center lg:max-w-3xl lg:px-6"
      }
    >
      <form
        role="search"
        action="#inventory"
        data-testid="hero-search"
        className={compact ? "" : "mt-2.5 sm:mt-4"}
      >
        <div className="flex items-center gap-3 rounded-full border border-line bg-surface [:root:not([data-theme=light])_&]:border-white [:root:not([data-theme=light])_&]:bg-white py-2 pl-5 pr-2 shadow-[0_10px_30px_-6px_rgba(0,0,0,0.45)] transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.55)] focus-within:border-fg/40 motion-reduce:transition-none">
          <Search
            className="h-4 w-4 shrink-0 text-muted [:root:not([data-theme=light])_&]:text-zinc-500"
            strokeWidth={1.5}
          />
          <input
            type="search"
            name="q"
            aria-label="Buscar en el inventario"
            placeholder={
              compact
                ? "Buscar marca o modelo"
                : "Buscá por marca, modelo o palabra clave"
            }
            className="w-full bg-transparent text-sm text-fg [:root:not([data-theme=light])_&]:text-black outline-none placeholder:text-subtle [:root:not([data-theme=light])_&]:placeholder:text-zinc-500"
          />
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="advanced-search"
            data-testid="hero-filters-toggle"
            onClick={() => setFiltersOpen((open) => !open)}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted [:root:not([data-theme=light])_&]:text-zinc-600 transition-[color,transform] duration-150 hover:text-fg [:root:not([data-theme=light])_&]:hover:text-black active:scale-95"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.75} />
            <span className="hidden sm:inline">Filtros</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
              strokeWidth={1.75}
            />
          </button>
          <button
            type="submit"
            aria-label="Buscar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-inverse text-on-inverse [:root:not([data-theme=light])_&]:bg-black [:root:not([data-theme=light])_&]:text-white transition-[transform,opacity] duration-150 ease-out hover:opacity-85 active:scale-95"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {filtersOpen && (
            <motion.div
              id="advanced-search"
              data-testid="hero-advanced-search"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.3, ease: EASE_OUT }}
              className={
                compact
                  ? "absolute right-0 top-full z-30 w-[min(92vw,26rem)] overflow-hidden"
                  : "overflow-hidden"
              }
            >
              <div
                className={`mt-3 grid grid-cols-2 gap-3 rounded-xl border border-line p-4 ${compact ? "bg-bg shadow-2xl" : "bg-surface"} text-left backdrop-blur-md`}
              >
                <Field label="Marca">
                  <input
                    type="text"
                    name="make"
                    placeholder="Ej. Audi"
                    className={FIELD}
                  />
                </Field>
                <Field label="Combustible">
                  <select name="fuel" defaultValue="" className={FIELD}>
                    <option value="">Todos</option>
                    <option value="Electric">Eléctrico</option>
                    <option value="Hybrid">Híbrido</option>
                    <option value="Gasoline">Nafta</option>
                  </select>
                </Field>
                <Field label="Año desde">
                  <input
                    type="number"
                    name="yearMin"
                    inputMode="numeric"
                    min={1990}
                    placeholder="2020"
                    className={FIELD}
                  />
                </Field>
                <Field label="Año hasta">
                  <input
                    type="number"
                    name="yearMax"
                    inputMode="numeric"
                    min={1990}
                    placeholder="2025"
                    className={FIELD}
                  />
                </Field>
                <Field label="Precio máx. (US$)">
                  <input
                    type="number"
                    name="priceMax"
                    inputMode="numeric"
                    min={0}
                    placeholder="100000"
                    className={FIELD}
                  />
                </Field>
                <Field label="Kilometraje máx.">
                  <input
                    type="number"
                    name="kmMax"
                    inputMode="numeric"
                    min={0}
                    placeholder="50000"
                    className={FIELD}
                  />
                </Field>
                <Field label="Vendedor">
                  <select name="seller" defaultValue="" className={FIELD}>
                    <option value="">Todos</option>
                    <option value="private">Particulares</option>
                    <option value="dealer">Concesionarias</option>
                  </select>
                </Field>
                <Field label="Ubicación">
                  <input
                    type="text"
                    name="location"
                    placeholder="Ej. Montevideo"
                    className={FIELD}
                  />
                </Field>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      {!compact && (
        <nav
          aria-label="Accesos rápidos"
          className="mt-3 flex flex-wrap items-center justify-center sm:mt-5 gap-x-6 gap-y-2 text-sm"
        >
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
