"use client";

import { doc, setDoc } from "firebase/firestore";
import { useState, useTransition } from "react";
import { db } from "@/lib/firebase";
import { revalidateSite } from "./actions";

export default function CurrencySetting({ initialRate }: { initialRate: number }) {
  const [rate, setRate] = useState(String(initialRate));
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, start] = useTransition();
  const parsed = Number(rate.replace(",", "."));

  function save() {
    start(async () => {
      if (!Number.isFinite(parsed) || parsed <= 0)
        return setStatus({
          ok: false,
          msg: "Ingresá una cotización mayor a 0 (pesos por dólar).",
        });
      try {
        await setDoc(
          doc(db, "settings", "site"),
          { arsRate: parsed },
          { merge: true },
        );
        await revalidateSite();
        setStatus({ ok: true, msg: "Cotización guardada." });
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
      <h3 className="text-base font-medium tracking-tight">
        Cotización del dólar
      </h3>
      <p className="mt-1 text-xs text-muted">
        Cada vehículo se publica en la moneda en que se cargó (dólares o pesos).
        Esta cotización solo se usa para comparar precios en pesos y en dólares
        al filtrar y ordenar el listado.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1.5 sm:w-56">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
            Pesos por US$ 1
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
            className="w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          data-testid="currency-save"
          className="rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar cotización"}
        </button>
      </div>
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
