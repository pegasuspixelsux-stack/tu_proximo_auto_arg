"use client";

import { doc, setDoc } from "firebase/firestore";
import { useState, useTransition } from "react";
import { db } from "@/lib/firebase";
import { cleanPhone, formatPhone, isValidPhone } from "../data/site";
import { revalidateSite } from "./actions";

export default function WhatsappSetting({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, start] = useTransition();
  const digits = cleanPhone(value);

  function save() {
    start(async () => {
      if (!isValidPhone(digits))
        return setStatus({
          ok: false,
          msg: "Ingresá entre 8 y 15 dígitos, con código de país (ej. 59899000000).",
        });
      try {
        await setDoc(
          doc(db, "settings", "site"),
          { whatsappNumber: digits },
          { merge: true },
        );
        await revalidateSite();
        setValue(digits);
        setStatus({ ok: true, msg: "Número guardado." });
      } catch {
        setStatus({
          ok: false,
          msg: "No se pudo guardar. Revisá tu sesión y las reglas de Firestore.",
        });
      }
    });
  }

  return (
    <div data-testid="whatsapp-setting" className="mt-6">
      <h3 className="text-base font-medium tracking-tight">
        WhatsApp y teléfono
      </h3>
      <p className="mt-1 text-xs text-muted">
        Un solo número para el pie de página (WhatsApp y llamadas), las fichas de
        vehículos y los botones de contacto.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1.5 sm:w-80">
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
            Número con código de país
          </span>
          <input
            type="tel"
            inputMode="tel"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setStatus(null);
            }}
            placeholder="59899000000"
            className="w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40"
          />
        </label>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          data-testid="whatsapp-save"
          className="rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar número"}
        </button>
      </div>
      <p className="mt-2 text-xs text-subtle">
        Se mostrará como {digits ? formatPhone(digits) : "—"}
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
