"use client";

import { CalendarCheck, ChevronDown, MessageCircle, X } from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { cleanPhone } from "../data/site";
import WhatsAppLeadButton from "./WhatsAppLeadButton";

const GENERIC_MESSAGE = "Hola Tu Próximo Auto! Quiero hacer una consulta.";

const CARS = [
  "Toyota Hilux SRV 2022",
  "Volkswagen Amarok V6 2021",
  "Peugeot 2008 GT 2023",
  "Ford Mustang Fastback 2018",
];
const PAYMENTS = [
  "Contado / Transferencia Directa",
  "Financiación con Tarjeta (Hasta 40%)",
  "Entrego mi usado (Permuta)",
  "Contado + Financiación",
];
const URGENCIES = [
  "Hoy / Mañana (Urgente)",
  "Esta semana",
  "En los próximos 15 días",
];
const TIME_SLOTS = ["10:00 AM - 1:00 PM", "2:00 PM - 6:00 PM"];
const CALLBACKS = ["En el acto", "Por la mañana", "Por la tarde"];

const INPUT =
  "w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-zinc-500 focus:border-emerald-500/70";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Choice({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: string[];
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-widest text-zinc-400">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, i) => (
          <label key={option} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={i === 0}
              className="peer sr-only"
            />
            <span className="block rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition-colors duration-150 peer-checked:border-emerald-500 peer-checked:bg-emerald-500/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500/60">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AppointmentModal({
  onClose,
  whatsappNumber,
}: {
  onClose: () => void;
  whatsappNumber: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const today = new Date().toLocaleDateString("en-CA");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();
    const code = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const text = [
      "Hola Tu Próximo Auto! Quiero agendar cita:",
      `- Vehículo: ${get("car")}`,
      `- Pago: ${get("payment")}`,
      `- Urgencia: ${get("urgency")}`,
      `- Cita: ${get("date")} a las ${get("time")}`,
      `- Contacto preferido: ${get("callback")}`,
      `- Nombre: ${get("name")}`,
      `- Teléfono: ${get("phone")}`,
      `- Código: #AS-${code}`,
    ].join("\n");
    // The form already collects name and phone, so it saves the lead itself.
    // Loaded on submit so the Firebase SDK stays out of the initial bundle.
    import("@/lib/leads").then(({ createLead }) => createLead({
      fullName: get("name"),
      phone: cleanPhone(get("phone")),
      notes: text,
      sourceItem: get("car"),
    })).catch((err) => console.error("No se pudo guardar el lead", err));
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-3 pb-3 pt-6 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-title"
        data-testid="appointment-modal"
        className="max-h-[calc(100svh-2.5rem)] sm:max-h-[92svh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-5 text-white shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 id="appointment-title" className="text-xl font-semibold">
              Agendar cita en el salón de ventas
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              Completá los datos y te respondemos por WhatsApp.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-[color,transform] duration-150 hover:text-white active:scale-95"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <Field label="Vehículo">
            <select
              name="car"
              required
              defaultValue={CARS[0]}
              className={INPUT}
            >
              {CARS.map((car) => (
                <option key={car}>{car}</option>
              ))}
            </select>
          </Field>
          <Choice legend="Método de pago" name="payment" options={PAYMENTS} />
          <Choice
            legend="¿Cuándo querés comprar?"
            name="urgency"
            options={URGENCIES}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha de visita">
              <input
                type="date"
                name="date"
                required
                min={today}
                className={`${INPUT} [color-scheme:dark]`}
              />
            </Field>
            <Field label="Horario">
              <select
                name="time"
                defaultValue={TIME_SLOTS[0]}
                className={INPUT}
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </Field>
          </div>
          <Choice
            legend="Mejor momento para llamarte"
            name="callback"
            options={CALLBACKS}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre completo">
              <input
                type="text"
                name="name"
                required
                autoComplete="name"
                placeholder="Tu nombre"
                className={INPUT}
              />
            </Field>
            <Field label="WhatsApp">
              <input
                type="tel"
                name="phone"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="+598 99 000 000"
                className={INPUT}
              />
            </Field>
          </div>
          <button
            type="submit"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-emerald-400 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Enviar por WhatsApp
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ConversionCTA({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const [open, setOpen] = useState(false);

  // Expand when a link or the URL points at this section (collapsed on mobile).
  useEffect(() => {
    const expand = () => {
      if (window.location.hash === "#contacto") setOpen(true);
    };
    expand();
    window.addEventListener("hashchange", expand);
    return () => window.removeEventListener("hashchange", expand);
  }, []);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section
      id="contacto"
      data-testid="conversion-cta"
      aria-labelledby="cta-heading"
      className="scroll-mt-4 md:px-3 md:py-12 lg:px-6 lg:py-16"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls="cta-content"
        data-testid="cta-toggle"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 border-y border-line px-3 py-4 text-left md:hidden"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-fg">
          Contacto
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="cta-content"
        className={open ? "px-3 pb-10 pt-8 md:p-0" : "hidden md:block"}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-muted md:block">
            Último paso
          </p>
          <h2
            id="cta-heading"
            className="text-balance text-3xl font-semibold tracking-[-0.02em] md:mt-2 lg:text-4xl"
          >
            ¿Listo para manejar tu próximo auto?
          </h2>
          <p className="mt-3 text-sm font-medium text-muted sm:text-base">
            Coordiná tu visita a nuestro salón de ventas en Zona Norte (Tigre)
            para ver la unidad, realizar una prueba de manejo o cerrar la
            compra.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-[1000px] md:mt-10 grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
          <div className="card-glow card-glow-dark flex flex-col rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white motion-safe:hover:scale-[1.02]">
            <h3 className="text-lg font-bold">Consulta Directa</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
              Escribinos directamente para sacarte dudas en el acto.
            </p>
            <WhatsAppLeadButton
              targetPhone={whatsappNumber}
              message={GENERIC_MESSAGE}
              sourceItem="Consulta directa"
              testId="cta-whatsapp"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-950 transition-[background-color,transform] duration-150 hover:bg-emerald-400 active:scale-95"
            >
              <MessageCircle
                className="h-4 w-4"
                strokeWidth={1.75}
                aria-hidden
              />
              Hablar por WhatsApp Ya
            </WhatsAppLeadButton>
          </div>

          <div className="card-glow card-glow-dark flex flex-col rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white motion-safe:hover:scale-[1.02]">
            <h3 className="text-lg font-bold">
              Reserva de Turno &amp; Qualify
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
              Seleccioná la unidad, día, hora y método de pago para reservar tu
              lugar.
            </p>
            <button
              type="button"
              data-testid="cta-open-modal"
              onClick={() => setModalOpen(true)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-[background-color,transform] duration-150 hover:bg-sky-500 active:scale-95"
            >
              <CalendarCheck
                className="h-4 w-4"
                strokeWidth={1.75}
                aria-hidden
              />
              Agendar Cita en el Salón
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <AppointmentModal
          onClose={() => setModalOpen(false)}
          whatsappNumber={whatsappNumber}
        />
      )}
    </section>
  );
}
