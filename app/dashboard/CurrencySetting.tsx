"use client";

import { doc, setDoc } from "firebase/firestore";
import { useState, useTransition } from "react";
import { db } from "@/lib/firebase";
import { formatPrice, type Currency } from "../data/site";
import { revalidateSite } from "./actions";

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

export default function CurrencySetting({
  initialCurrency,
  initialRate,
}: {
  initialCurrency: Currency;
  initialRate: number;
}) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [rate, setRate] = useState(String(initialRate));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, start] = useTransition();
  const parsed = Number(rate.replace(",", "."));
  const validRate = Number.isFinite(parsed) && parsed > 0;

  function save() {
    start(async () => {
      if (currency === "ARS" && !validRate)
        return setStatus({
          ok: false,
          msg: "Ingresá una cotización mayor a 0 (pesos por dólar).",
        });
      try {
        await setDoc(
          doc(db, "settings", "site"),
          {
            currency,
            ...(validRate && { arsRate: parsed }),
          },
          { merge: true },
        );
        await revalidateSite();
        setStatus({ ok: true, msg: "Moneda guardada." });
      } catch {
        setStatus({
          ok: false,
          msg: "No se pudo guardar. Revisá tu sesión y las reglas de Firestore.",
        });
      }
    });
  }

  return (
    <div data-testid="currency-setting" className="mt-10">
      <h3 className="text-base font-medium tracking-tight">Moneda de precios</h3>
      <p className="mt-1 text-xs text-muted">
        Los vehículos se cargan en dólares. Si elegís pesos argentinos, el sitio
        público los convierte con la cotización que indiques abajo.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1.5 sm:w-56">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
            Moneda
          </span>
          <select
            value={currency}
            onChange={(e) => {
              setCurrency(e.target.value as Currency);
              setStatus(null);
            }}
            data-testid="currency-select"
            className={FIELD}
          >
            <option value="USD">Dólares (USD)</option>
            <option value="ARS">Pesos argentinos (ARS)</option>
          </select>
        </label>
        {currency === "ARS" && (
          <label className="flex flex-col gap-1.5 sm:w-56">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
              Cotización (ARS por US$ 1)
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={(e) => {
                setRate(e.target.value);
                setStatus(null);
              }}
              placeholder="1000"
              data-testid="currency-rate"
              className={FIELD}
            />
          </label>
        )}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          data-testid="currency-save"
          className="rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar moneda"}
        </button>
      </div>
      <p className="mt-2 text-xs text-subtle">
        Un auto de US$ 10.000 se mostrará como{" "}
        {formatPrice(10000, {
          currency,
          arsRate: validRate ? parsed : initialRate,
        })}
        . Los filtros de precio y la calculadora de financiación siguen en US$.
      </p>
      {status && (
        <p
          role="status"
          className={`mt-2 text-sm ${status.ok ? "text-muted" : "text-red-400"}`}
        >
          {status.msg}
        </p>
      )}
    </div>
  );
}
