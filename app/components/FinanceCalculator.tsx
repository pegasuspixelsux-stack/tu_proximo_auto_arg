"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { calculatePlan, DOWN_PAYMENT_RATE } from "@/lib/finance";
import { formatPrice, type Currency } from "../data/site";

/** Inventory tops out around 50,000 dollars, so a dollar trade-in is capped there. */
const TRADE_IN_MAX_USD = 50000;
/** Example price per currency; amounts are never converted between them. */
const DEFAULT_PRICE: Record<Currency, number> = { USD: 40000, ARS: 40000000 };
const SLIDER_STEP: Record<Currency, number> = { USD: 500, ARS: 100000 };
const MAX_TERM = 24;

interface SliderProps {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
  testId: string;
}

function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  minLabel,
  maxLabel,
  testId,
}: SliderProps) {
  const id = useId();
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-widest text-muted"
        >
          {label}
        </label>
        <output
          htmlFor={id}
          data-testid={`${testId}-value`}
          className="text-lg font-medium tabular-nums tracking-tight"
        >
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        data-testid={testId}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, var(--inverse) ${pct}%, var(--line) ${pct}%)`,
        }}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[var(--inverse)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--inverse)] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--inverse)] [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_var(--bg)]"
      />
      <div className="mt-2 flex justify-between text-[10px] tabular-nums text-subtle">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function FinanceCalculator({
  defaultCurrency = "USD",
}: {
  /** Pesos or dollars, set in the dashboard under Configuración. */
  defaultCurrency?: Currency;
}) {
  const priceId = useId();
  const panelId = useId();
  const currency = defaultCurrency;
  const defaultPrice = DEFAULT_PRICE[currency];
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(defaultPrice);
  // Start from a valid plan: 60% in cash, 12 installments.
  const [tradeInRaw, setTradeIn] = useState(0);
  const [cashRaw, setCash] = useState(
    Math.round(defaultPrice * DOWN_PAYMENT_RATE),
  );
  const [term, setTerm] = useState(12);

  const step = SLIDER_STEP[currency];
  const money = (n: number, digits: 0 | 2 = 0) =>
    formatPrice(n, currency, digits);

  // Sliders can never push the initial payment past the price.
  const safePrice = Math.max(0, price);
  const tradeInMax =
    currency === "USD" ? Math.min(safePrice, TRADE_IN_MAX_USD) : safePrice;
  const tradeIn = Math.min(tradeInRaw, tradeInMax);
  const cashMax = Math.max(0, safePrice - tradeIn);
  const cash = Math.min(cashRaw, cashMax);

  const plan = calculatePlan(safePrice, tradeIn, cash, term);
  const shortfall = Math.max(0, plan.minInitial - plan.totalInitial);
  const initialPct = safePrice ? Math.round((plan.totalInitial / safePrice) * 100) : 0;

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
            Entregá al menos el 60% entre tu permuta y efectivo, y repartí el
            saldo en hasta 24 cuotas iguales, sin interés.
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
                  step={step}
                  value={price}
                  onChange={(e) =>
                    setPrice(Math.max(0, Number(e.target.value) || 0))
                  }
                  data-testid="calc-price"
                  className="mt-3 w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-base tabular-nums text-fg outline-none transition-colors duration-150 focus:border-fg/40"
                />
              </div>

              <Slider
                label="Valor de permuta"
                testId="calc-tradein"
                value={tradeIn}
                display={money(tradeIn)}
                min={0}
                max={tradeInMax}
                step={step}
                onChange={setTradeIn}
                minLabel={money(0)}
                maxLabel={money(tradeInMax)}
              />
              <Slider
                label="Entrega de efectivo"
                testId="calc-cash"
                value={cash}
                display={money(cash)}
                min={0}
                max={cashMax}
                step={step}
                onChange={setCash}
                minLabel={money(0)}
                maxLabel={money(cashMax)}
              />
              <Slider
                label="Plazo de cuotas"
                testId="calc-term"
                value={term}
                display={term === 0 ? "Contado" : `${term} meses`}
                min={0}
                max={MAX_TERM}
                step={1}
                onChange={setTerm}
                minLabel="Contado"
                maxLabel={`${MAX_TERM} meses`}
              />

              {!plan.meetsMinimum && (
                <div
                  role="alert"
                  data-testid="calc-warning"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                >
                  <p>
                    La permuta y la entrega inicial deben cubrir al menos el 60%
                    del valor del vehículo. Te faltan {money(shortfall)}.
                  </p>
                  <button
                    type="button"
                    data-testid="calc-fix"
                    onClick={() =>
                      setCash(Math.min(cashMax, cash + Math.ceil(shortfall)))
                    }
                    className="mt-2 text-xs font-semibold uppercase tracking-wider underline underline-offset-4"
                  >
                    Completar con efectivo
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex flex-col justify-between rounded-none border-x-0 border-b border-t-0 border-line bg-surface px-5 py-8 shadow-none card-glow md:rounded-xl md:border md:p-8 md:shadow-[var(--card-shadow)]"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Cuota mensual
              </p>
              <p
                data-testid="calc-monthly"
                className="mt-3 text-5xl font-semibold tabular-nums tracking-[-0.02em]"
              >
                {money(plan.monthly, 2)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {term === 0
                  ? "Pago de contado, sin cuotas"
                  : `${term} cuotas sin interés`}
              </p>
            </div>

            <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Precio del vehículo</dt>
                <dd
                  data-testid="calc-total"
                  className="font-medium tabular-nums"
                >
                  {money(plan.price)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Valor de permuta (−)</dt>
                <dd className="font-medium tabular-nums">{money(tradeIn)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Efectivo inicial (−)</dt>
                <dd className="font-medium tabular-nums">{money(cash)}</dd>
              </div>
              <div
                className={`flex justify-between gap-4 rounded-lg px-3 py-2 font-semibold ${
                  plan.meetsMinimum
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                <dt>Total inicial (permuta + efectivo)</dt>
                <dd data-testid="calc-initial" className="tabular-nums">
                  {money(plan.totalInitial)} · {initialPct}%
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Saldo a financiar</dt>
                <dd
                  data-testid="calc-financed"
                  className="font-medium tabular-nums"
                >
                  {money(plan.financed)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  Cuota mensual ({term === 0 ? "contado" : `${term} cuotas`})
                </dt>
                <dd className="font-medium tabular-nums">
                  {money(plan.monthly, 2)}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-xs text-subtle">
              Cálculo estimativo. La permuta se confirma con la tasación del
              vehículo en el salón de ventas. No constituye una oferta de
              crédito.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
