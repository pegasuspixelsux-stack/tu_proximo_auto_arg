"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useId,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { cleanPhone, isValidPhone } from "../data/site";

const INPUT =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-zinc-500 focus:border-emerald-500/70";

interface Props {
  /** WhatsApp number the chat opens with (digits only, with country code). */
  targetPhone: string;
  /** Pre-filled, editable message sent in the chat. */
  message: string;
  /** Item or service the visitor clicked, stored with the lead. */
  sourceItem?: string;
  className?: string;
  testId?: string;
  children: ReactNode;
}

function LeadModal({
  targetPhone,
  message,
  sourceItem,
  onClose,
}: Pick<Props, "targetPhone" | "message" | "sourceItem"> & {
  onClose: () => void;
}) {
  const titleId = useId();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const fullName = String(f.get("fullName") ?? "").trim();
    const phone = cleanPhone(String(f.get("phone") ?? ""));
    const notes = String(f.get("notes") ?? "").trim();
    if (!fullName) return setError("Ingresá tu nombre.");
    if (!isValidPhone(phone))
      return setError("Ingresá un teléfono válido, con código de país.");

    setSubmitting(true);
    setError("");
    const text = [notes || message, `— ${fullName}`].join("\n\n");
    // Start the save, then open WhatsApp in the same click so browsers don't
    // treat the new tab as a blocked pop-up.
    // Loaded on submit so the Firebase SDK stays out of the initial bundle.
    const saved = import("@/lib/leads").then(({ createLead }) =>
      createLead({ fullName, phone, notes, sourceItem }),
    );
    window.open(
      `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    try {
      await saved;
    } catch (err) {
      // The visitor already reached WhatsApp; don't block them on a save error.
      console.error("No se pudo guardar el lead", err);
    }
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="lead-modal"
        className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl sm:rounded-2xl sm:p-6"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 32, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 34 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold tracking-tight">
              Antes de abrir WhatsApp
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Dejanos tus datos y te atendemos más rápido.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors duration-150 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
              Nombre completo
            </span>
            <input
              name="fullName"
              required
              autoFocus
              autoComplete="name"
              placeholder="Juan Pérez"
              data-testid="lead-name"
              className={`${INPUT} mt-1.5`}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
              WhatsApp / Teléfono
            </span>
            <input
              name="phone"
              type="tel"
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="59899123456"
              data-testid="lead-phone"
              className={`${INPUT} mt-1.5`}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
              Mensaje (opcional)
            </span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={message}
              data-testid="lead-notes"
              className={`${INPUT} mt-1.5 resize-none`}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="lead-submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-emerald-400 active:scale-[0.98] disabled:opacity-60"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {submitting ? "Abriendo…" : "Continuar a WhatsApp"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/** A WhatsApp CTA that asks for the visitor's details before opening the chat. */
export default function WhatsAppLeadButton({
  targetPhone,
  message,
  sourceItem,
  className,
  testId,
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid={testId}
        className={className}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <AnimatePresence>
            <LeadModal
              targetPhone={targetPhone}
              message={message}
              sourceItem={sourceItem}
              onClose={() => setOpen(false)}
            />
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
