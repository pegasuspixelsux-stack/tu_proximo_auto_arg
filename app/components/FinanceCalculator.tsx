"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { calculateFinancing, TERMS, type Term } from "@/lib/finance";
import { formatPrice, type Currency } from "../data/site";

export default function FinanceCalculator({
  defaultPrice = 40000,
  defaultCurrency = "USD",
}: {
  defaultPrice?: number;
  /** Set in the dashboard under Configuración. */
  defaultCurrency?: Currency;
}) {
  const priceId = useId();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(defaultPrice);
  const currency = defaultCurrency;
  const [term, setTerm] = useState<Term>(12);

  const plan = calculateFinancing(price, term);
  const money = (n: number, digits: 0 | 2 = 0) =>
    formatPrice(n, currency, digits);

  return (
    <section
      id="calculadora"
      data-testid="finance-calculator"
      aria-labelledby="calculator-heading"
      className="scroll-mt-4 md:px-3 md:py-12 lg:px-6 lg:py-16"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="calc-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 border-y border-line px-3 py-4 text-left md:hidden"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-fg">
          Financiación
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div id={panelId} className={open ? "" : "hidden md:block"}>
        <div className="mx-auto max-w-3xl px-3 pb-6 pt-8 text-center md:px-0 md:pb-0 md:pt-0">
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-muted md:block">
            Financiación
          </p>
          <h2
            id="calculator-heading"
            className="text-balance text-3xl font-semibold tracking-[-0.02em] md:mt-2 lg:text-4xl"
          >
            Calculá tu cuota
          </h2>
          <p className="mt-3 text-sm font-medium text-muted sm:text-base">
            60% de entrega inicial y el 40% restante en 12 o 24 cuotas iguales,
            sin interés.
          </p>
        </div>

        <div className="grid gap-0 md:mt-10 md:gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-none border-x-0 border-b border-t-0 border-line bg-surface px-5 py-8 shadow-none card-glow md:rounded-xl md:border md:p-8 md:shadow-[var(--card-shadow)]">
            <div className="space-y-8">
              <div>
                <label
                  htmlFor={priceId}
                  className="text-xs font-medium uppercase tracking-widest text-muted"
                >
                  Precio del vehículo ({currency === "ARS" ? "ARS" : "US$"})
                </label>
                <input
                  id={priceId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={currency === "ARS" ? 100000 : 500}
                  value={price}
                  onChange={(e) =>
                    setPrice(Math.max(0, Number(e.target.value) || 0))
                  }
                  data-testid="calc-price"
                  className="mt-3 w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-base tabular-nums text-fg outline-none transition-colors duration-150 focus:border-fg/40"
                />
              </div>

              <fieldset>
                <legend className="text-xs font-medium uppercase tracking-widest text-muted">
                  Plazo
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {TERMS.map((t) => (
                    <label
                      key={t}
                      className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-fg/60 ${
                        term === t
                          ? "border-fg bg-inverse text-on-inverse"
                          : "border-line text-fg hover:border-fg/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="calc-term"
                        value={t}
                        checked={term === t}
                        onChange={() => setTerm(t)}
                        data-testid={`calc-term-${t}`}
                        className="sr-only"
                      />
                      {t} cuotas
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="text-sm text-muted">
                Entrega inicial fija del 60% · Tasa de interés 0%
              </p>
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex flex-col justify-between rounded-none border-x-0 border-b border-t-0 border-line bg-surface px-5 py-8 shadow-none card-glow md:rounded-xl md:border md:p-8 md:shadow-[var(--card-shadow)]"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Valor de cuota ({term} meses)
              </p>
              <p
                data-testid="calc-monthly"
                className="mt-3 text-5xl font-semibold tabular-nums tracking-[-0.02em]"
              >
                {money(plan.monthly, 2)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {term} cuotas mensuales iguales, sin interés
              </p>
            </div>

            <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Precio total</dt>
                <dd
                  data-testid="calc-total"
                  className="font-medium tabular-nums"
                >
                  {money(plan.price)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Entrega inicial (60%)</dt>
                <dd
                  data-testid="calc-down"
                  className="font-medium tabular-nums"
                >
                  {money(plan.downPayment)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Saldo a financiar (40%)</dt>
                <dd
                  data-testid="calc-financed"
                  className="font-medium tabular-nums"
                >
                  {money(plan.financed)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Valor de cuota ({term} meses)</dt>
                <dd className="font-medium tabular-nums">
                  {money(plan.monthly, 2)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-xs text-subtle">
              Cálculo estimativo. No constituye una oferta de crédito; las
              condiciones finales se confirman al concretar la compra.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
