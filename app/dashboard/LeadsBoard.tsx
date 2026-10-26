"use client";

import { LayoutGroup, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import {
  LEAD_STATUSES,
  type Lead,
  type LeadStatus,
} from "../data/leads";
import { setLeadStatus, useLeads } from "./useLeads";

const dateFmt = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const ICON_BTN =
  "flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 hover:text-fg disabled:pointer-events-none disabled:opacity-30";

function LeadCard({
  lead,
  onMove,
}: {
  lead: Lead;
  onMove: (status: LeadStatus) => void;
}) {
  const index = LEAD_STATUSES.findIndex((s) => s.value === lead.status);
  const prev = LEAD_STATUSES[index - 1];
  const next = LEAD_STATUSES[index + 1];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      data-testid="lead-card"
      className="rounded-xl border border-line bg-bg p-3 shadow-[var(--card-shadow)]"
    >
      <p className="truncate text-sm font-medium">{lead.fullName}</p>
      <p className="mt-0.5 truncate text-xs tabular-nums text-muted">
        +{lead.phone}
      </p>
      {lead.sourceItem && (
        <p className="mt-2 truncate rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted">
          {lead.sourceItem}
        </p>
      )}
      {lead.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-subtle">{lead.notes}</p>
      )}
      <p className="mt-2 text-[10px] tabular-nums text-subtle">
        {dateFmt.format(new Date(lead.createdAt))}
      </p>

      <div className="mt-3 flex items-center justify-between gap-1">
        <div className="flex gap-1">
          <a
            href={`tel:+${lead.phone}`}
            aria-label={`Llamar a ${lead.fullName}`}
            className={ICON_BTN}
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </a>
          <a
            href={`https://wa.me/${lead.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp a ${lead.fullName}`}
            className={ICON_BTN}
          >
            <MessageCircle
              className="h-3.5 w-3.5"
              strokeWidth={1.75}
              aria-hidden
            />
          </a>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && onMove(prev.value)}
            aria-label={prev ? `Mover a ${prev.label}` : "Primera etapa"}
            className={ICON_BTN}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && onMove(next.value)}
            aria-label={next ? `Mover a ${next.label}` : "Última etapa"}
            className={ICON_BTN}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </motion.li>
  );
}

/** Five-column pipeline for following up leads by call or WhatsApp. */
export default function LeadsBoard() {
  const { leads, loading, error } = useLeads();
  const [moveError, setMoveError] = useState("");

  async function move(id: string, status: LeadStatus) {
    setMoveError("");
    try {
      await setLeadStatus(id, status);
    } catch {
      setMoveError("No se pudo mover al interesado. Revisá tu conexión y permisos.");
    }
  }

  if (loading)
    return <p className="mt-8 text-sm text-muted">Cargando interesados…</p>;
  if (error)
    return (
      <p role="alert" className="mt-8 text-sm text-red-400">
        {error}
      </p>
    );

  return (
    <>
      {moveError && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {moveError}
        </p>
      )}
      <LayoutGroup>
        <div
          data-testid="leads-board"
          className="mt-6 grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-4 overflow-x-auto pb-4 lg:grid-flow-row lg:grid-cols-5 lg:overflow-visible"
        >
          {LEAD_STATUSES.map(({ value, label }) => {
            const column = leads.filter((l) => l.status === value);
            return (
              <section
                key={value}
                aria-label={label}
                data-testid={`lead-column-${value}`}
                className="min-w-0 rounded-xl border border-line bg-surface p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-widest">
                    {label}
                  </h2>
                  <span className="rounded-full border border-line px-2 py-0.5 text-[10px] tabular-nums text-muted">
                    {column.length}
                  </span>
                </div>
                <ul className="space-y-3">
                  {column.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onMove={(status) => move(lead.id, status)}
                    />
                  ))}
                </ul>
                {column.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-subtle">
                    Sin interesados
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </LayoutGroup>
    </>
  );
}
