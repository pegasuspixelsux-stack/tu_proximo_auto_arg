"use client";

import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

const usd = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Fixed monthly payment for an amortized loan; handles a 0% rate. */
export function monthlyPayment(
  principal: number,
  annualRatePct: number,
  months: number,
) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

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
  defaultPrice = 40000,
}: {
  defaultPrice?: number;
}) {
  const priceId = useId();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(defaultPrice);
  const [down, setDown] = useState(Math.round(defaultPrice * 0.2));
  const [rate, setRate] = useState(9.5);
  const [months, setMonths] = useState(48);

  const safePrice = Math.max(0, price);
  const downPayment = Math.min(down, safePrice);
  const financed = safePrice - downPayment;
  const monthly = monthlyPayment(financed, rate, months);
  const totalPaid = monthly * months;
  const totalInterest = totalPaid - financed;

  const downMax = Math.max(safePrice, 1000);

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
        </div>

        <div className="grid gap-0 md:mt-10 md:gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-none border-x-0 border-b border-t-0 border-line bg-surface px-5 py-8 shadow-none card-glow md:rounded-xl md:border md:p-8 md:shadow-[var(--card-shadow)]">
            <div className="space-y-8">
              <div>
                <label
                  htmlFor={priceId}
                  className="text-xs font-medium uppercase tracking-widest text-muted"
                >
                  Precio del vehículo (US$)
                </label>
                <input
                  id={priceId}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={500}
                  value={price}
                  onChange={(e) => {
                    const next = Math.max(0, Number(e.target.value) || 0);
                    setPrice(next);
                    setDown((d) => Math.min(d, next));
                  }}
                  data-testid="calc-price"
                  className="mt-3 w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-base tabular-nums text-fg outline-none transition-colors duration-150 focus:border-fg/40"
                />
              </div>

              <Slider
                label="Entrega inicial"
                value={downPayment}
                display={`${usd.format(downPayment)} · ${safePrice ? Math.round((downPayment / safePrice) * 100) : 0}%`}
                min={0}
                max={downMax}
                step={500}
                onChange={setDown}
                minLabel={usd.format(0)}
                maxLabel={usd.format(downMax)}
              />
              <Slider
                label="Tasa de interés anual"
                value={rate}
                display={`${rate.toFixed(1).replace(".", ",")}%`}
                min={0}
                max={30}
                step={0.5}
                onChange={setRate}
                minLabel="0%"
                maxLabel="30%"
              />
              <Slider
                label="Plazo"
                value={months}
                display={`${months} meses`}
                min={6}
                max={84}
                step={6}
                onChange={setMonths}
                minLabel="6 meses"
                maxLabel="84 meses"
              />
            </div>
          </div>

          <div
            aria-live="polite"
            className="flex flex-col justify-between rounded-none border-x-0 border-b border-t-0 border-line bg-surface px-5 py-8 shadow-none card-glow md:rounded-xl md:border md:p-8 md:shadow-[var(--card-shadow)]"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted">
                Cuota mensual estimada
              </p>
              <p
                data-testid="calc-monthly"
                className="mt-3 text-5xl font-semibold tabular-nums tracking-[-0.02em]"
              >
                {usd.format(Math.round(monthly))}
              </p>
              <p className="mt-1 text-sm text-muted">durante {months} meses</p>
            </div>

            <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Monto a financiar</dt>
                <dd
                  data-testid="calc-financed"
                  className="font-medium tabular-nums"
                >
                  {usd.format(financed)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Intereses totales</dt>
                <dd className="font-medium tabular-nums">
                  {usd.format(Math.round(totalInterest))}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Total a pagar (con entrega)</dt>
                <dd className="font-medium tabular-nums">
                  {usd.format(Math.round(totalPaid + downPayment))}
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-xs text-subtle">
              Cálculo estimativo con cuotas fijas. No constituye una oferta de
              crédito; las condiciones reales dependen de la entidad financiera.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
