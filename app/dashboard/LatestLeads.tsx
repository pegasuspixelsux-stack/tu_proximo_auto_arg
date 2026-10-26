"use client";

import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { LEAD_STATUS_LABEL } from "../data/leads";
import { useLeads } from "./useLeads";

const LIMIT = 5;

const dateFmt = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** The newest leads still waiting for a first contact. */
export default function LatestLeads() {
  const { leads, loading, error } = useLeads();
  const fresh = leads.filter((l) => l.status === "new");

  return (
    <section aria-labelledby="latest-leads-heading" className="mt-10">
      <div className="flex items-end justify-between gap-4">
        <h2
          id="latest-leads-heading"
          className="text-xl font-medium tracking-tight"
        >
          Últimos Interesados Nuevos
        </h2>
        <Link
          href="/dashboard/interesados"
          className="text-xs text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
        >
          Ver pipeline →
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--card-shadow)]">
        {loading ? (
          <p className="px-4 py-8 text-center text-sm text-muted">Cargando…</p>
        ) : error ? (
          <p role="alert" className="px-4 py-8 text-center text-sm text-red-400">
            {error}
          </p>
        ) : fresh.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No hay interesados nuevos por contactar.
          </p>
        ) : (
          <ul data-testid="latest-leads" className="divide-y divide-line">
            {fresh.slice(0, LIMIT).map((l) => (
              <li
                key={l.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
              >
                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate text-sm font-medium">{l.fullName}</p>
                  <p className="truncate text-xs text-muted">
                    {l.sourceItem ?? "Consulta general"} · +{l.phone}
                  </p>
                </div>
                <span className="text-xs tabular-nums text-subtle">
                  {dateFmt.format(new Date(l.createdAt))}
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                  {LEAD_STATUS_LABEL[l.status]}
                </span>
                <div className="flex gap-1">
                  <a
                    href={`tel:+${l.phone}`}
                    aria-label={`Llamar a ${l.fullName}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-bg hover:text-fg"
                  >
                    <Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </a>
                  <a
                    href={`https://wa.me/${l.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp a ${l.fullName}`}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-bg hover:text-fg"
                  >
                    <MessageCircle
                      className="h-4 w-4"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
