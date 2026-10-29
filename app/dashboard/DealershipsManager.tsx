"use client";

import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { Dealership, Vehicle } from "../data/vehicles";
import { revalidateVehicles } from "./actions";
import DealershipModal from "./DealershipModal";

const FIELD =
  "rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

type StatusFilter = "all" | "active" | "inactive";
type Notice = { kind: "success" | "error"; text: string };

const isActive = (d: Dealership) => d.active !== false;

function cityOf(d: Dealership) {
  return d.city || d.location.split(",").pop()?.trim() || "";
}

function Pill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-line bg-surface text-muted"
      }`}
    >
      {active ? "Activa" : "Inactiva"}
    </span>
  );
}

export default function DealershipsManager({
  dealerships,
  vehicles,
}: {
  dealerships: Dealership[];
  vehicles: Vehicle[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<{ dealership?: Dealership } | null>(null);
  const [toDelete, setToDelete] = useState<Dealership | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const searchId = useId();
  const cityId = useId();
  const statusId = useId();
  const confirmId = useId();

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(t);
  }, [notice]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of vehicles) {
      const id = v.dealership?.id;
      if (id) map.set(id, (map.get(id) ?? 0) + 1);
    }
    return map;
  }, [vehicles]);

  const cities = useMemo(
    () =>
      [...new Set(dealerships.map(cityOf).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [dealerships],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dealerships.filter(
      (d) =>
        (status === "all" || (status === "active") === isActive(d)) &&
        (city === "all" || cityOf(d) === city) &&
        (!q ||
          `${d.name} ${d.location} ${d.email ?? ""} ${d.phone}`
            .toLowerCase()
            .includes(q)),
    );
  }, [dealerships, query, city, status]);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true);
    try {
      await action();
      await revalidateVehicles();
      router.refresh();
      setNotice({ kind: "success", text: success });
    } catch {
      setNotice({
        kind: "error",
        text: "No se pudo completar la acción. Revisá tu conexión y los permisos de Firestore.",
      });
    } finally {
      setBusy(false);
      setToDelete(null);
    }
  }

  const remove = (d: Dealership) =>
    run(async () => {
      await deleteDoc(doc(db, "dealerships", d.id));
    }, `Se eliminó la concesionaria ${d.name}.`);

  const deactivate = (d: Dealership) =>
    run(async () => {
      await updateDoc(doc(db, "dealerships", d.id), { active: false });
    }, `${d.name} quedó inactiva y ya no se muestra en el sitio.`);

  const linked = toDelete ? (counts.get(toDelete.id) ?? 0) : 0;

  return (
    <>
      <section aria-labelledby="dealerships-heading" className="mt-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <h2
            id="dealerships-heading"
            className="text-xl font-medium tracking-tight"
          >
            Todas las Concesionarias
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                Buscar concesionaria
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o ubicación"
                data-testid="dealership-search"
                className={`${FIELD} w-full pl-9 sm:w-64`}
              />
            </div>
            <div>
              <label htmlFor={cityId} className="sr-only">
                Filtrar por ciudad
              </label>
              <select
                id={cityId}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                data-testid="dealership-city-filter"
                className={`${FIELD} w-full sm:w-auto`}
              >
                <option value="all">Todas las ciudades</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={statusId} className="sr-only">
                Filtrar por estado
              </label>
              <select
                id={statusId}
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                data-testid="dealership-status-filter"
                className={`${FIELD} w-full sm:w-auto`}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            <button
              type="button"
              data-testid="add-dealership"
              onClick={() => setModal({})}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-inverse px-5 py-2 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Nueva Concesionaria
            </button>
          </div>
        </div>

        <div aria-live="polite">
          {notice && (
            <p
              role={notice.kind === "error" ? "alert" : "status"}
              data-testid="dealership-notice"
              className={`mt-4 flex items-start justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
                notice.kind === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/30 bg-red-500/10 text-red-400"
              }`}
            >
              {notice.text}
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Cerrar aviso"
                className="shrink-0"
              >
                <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface shadow-[var(--card-shadow)]">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-widest text-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  Concesionaria
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Ubicación
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Contacto
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Vehículos
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody data-testid="dealership-rows">
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-bg text-muted">
                        {d.logo ? (
                          <Image
                            src={d.logo}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        ) : (
                          <Building2
                            className="h-4 w-4"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        )}
                      </span>
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="inline-flex items-start gap-1.5">
                      <MapPin
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {d.location}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span className="flex items-center gap-1.5">
                      <Mail
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      {d.email || "—"}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 tabular-nums">
                      <Phone
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      +{d.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {counts.get(d.id) ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <Pill active={isActive(d)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Editar ${d.name}`}
                        onClick={() => setModal({ dealership: d })}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-bg hover:text-fg"
                      >
                        <Pencil
                          className="h-4 w-4"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                      <button
                        type="button"
                        aria-label={`Eliminar ${d.name}`}
                        data-testid={`delete-dealership-${d.id}`}
                        onClick={() => setToDelete(d)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-bg hover:text-red-400"
                      >
                        <Trash2
                          className="h-4 w-4"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted">
              {dealerships.length === 0
                ? "Todavía no hay concesionarias. Creá la primera con “Nueva Concesionaria”."
                : "Ninguna concesionaria coincide con la búsqueda."}
            </p>
          )}
        </div>
        <p className="mt-3 text-xs tabular-nums text-subtle" aria-live="polite">
          Mostrando {filtered.length} de {dealerships.length} concesionarias
        </p>
      </section>

      {modal && (
        <DealershipModal
          key={modal.dealership?.id ?? "new"}
          dealership={modal.dealership}
          dealerships={dealerships}
          vehicles={vehicles}
          onClose={() => setModal(null)}
          onSaved={(text) => {
            setModal(null);
            setNotice({ kind: "success", text });
            router.refresh();
          }}
        />
      )}

      {toDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
          onMouseDown={(e) =>
            e.target === e.currentTarget && !busy && setToDelete(null)
          }
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={confirmId}
            data-testid="delete-dealership-dialog"
            className="w-full max-w-md rounded-t-2xl border border-line bg-bg p-5 text-fg shadow-xl sm:rounded-2xl"
          >
            <h2 id={confirmId} className="text-lg font-medium tracking-tight">
              {linked > 0
                ? `No se puede eliminar ${toDelete.name}`
                : `¿Eliminar ${toDelete.name}?`}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {linked > 0
                ? `Tiene ${linked} ${linked === 1 ? "vehículo publicado" : "vehículos publicados"}. Eliminala solo después de reasignar o borrar esos vehículos. Mientras tanto podés desactivarla: deja de mostrarse en el sitio y conserva sus datos.`
                : "Se va a quitar del sistema y del sitio. Esta acción no se puede deshacer."}
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setToDelete(null)}
                disabled={busy}
                className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 hover:border-fg/40"
              >
                Cancelar
              </button>
              {linked > 0 ? (
                isActive(toDelete) && (
                  <button
                    type="button"
                    onClick={() => deactivate(toDelete)}
                    disabled={busy}
                    data-testid="deactivate-dealership"
                    className="rounded-full bg-inverse px-5 py-2 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95 disabled:opacity-60"
                  >
                    {busy ? "Desactivando…" : "Desactivar"}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => remove(toDelete)}
                  disabled={busy}
                  data-testid="confirm-delete-dealership"
                  className="rounded-full bg-red-600 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95 disabled:opacity-60"
                >
                  {busy ? "Eliminando…" : "Eliminar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
