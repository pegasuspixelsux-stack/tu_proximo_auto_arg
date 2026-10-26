"use client";

import { deleteDoc, doc } from "firebase/firestore";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import type { Dealership, Vehicle } from "../data/vehicles";
import { revalidateVehicles } from "./actions";
import type { DashboardListing, ListingStatus } from "./data";
import VehicleModal from "./VehicleModal";

const usd = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("es-UY", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const STATUS_STYLES: Record<ListingStatus, string> = {
  Publicado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Pendiente de Pago": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Vendido: "border-line bg-surface text-muted",
};

const FIELD =
  "rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

function Pill({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}

/** Vehicle table with search, add/edit modal and delete. `limit` shows only the newest N. */
export default function VehiclesSection({
  vehicles,
  dealerships,
  title,
  limit,
}: {
  vehicles: Vehicle[];
  dealerships: Dealership[];
  title: string;
  limit?: number;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<{ vehicle?: Vehicle } | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const searchId = useId();
  const statusId = useId();

  const listings = useMemo<DashboardListing[]>(
    () =>
      [...vehicles]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((v) => ({
          id: v.id,
          make: v.make,
          model: v.model,
          year: v.year,
          price: v.price,
          publishedAt: v.createdAt,
          status: "Publicado",
          image: v.image,
        })),
    [vehicles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (status === "all" || l.status === status) &&
        (!q || `${l.year} ${l.make} ${l.model}`.toLowerCase().includes(q)),
    );
  }, [listings, query, status]);
  const shown = limit ? filtered.slice(0, limit) : filtered;

  async function remove(l: DashboardListing) {
    if (
      !window.confirm(
        `¿Eliminar ${l.year} ${l.make} ${l.model}? No se puede deshacer.`,
      )
    )
      return;
    try {
      await deleteDoc(doc(db, "vehicles", l.id));
      await revalidateVehicles();
      router.refresh();
    } catch {
      window.alert("No se pudo eliminar. Revisá los permisos de Firestore.");
    }
  }

  return (
    <>
      <section
        id="vehiculos"
        aria-labelledby="listings-heading"
        className="mt-10 scroll-mt-20 lg:scroll-mt-6"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2
            id="listings-heading"
            className="text-xl font-medium tracking-tight"
          >
            {title}
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <label htmlFor={searchId} className="sr-only">
                Buscar vehículo
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
                placeholder="Buscar marca o modelo"
                data-testid="listing-search"
                className={`${FIELD} w-full pl-9 sm:w-64`}
              />
            </div>
            <div>
              <label htmlFor={statusId} className="sr-only">
                Filtrar por estado
              </label>
              <select
                id={statusId}
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as ListingStatus | "all")
                }
                data-testid="listing-status-filter"
                className={`${FIELD} w-full sm:w-auto`}
              >
                <option value="all">Todos los estados</option>
                <option value="Publicado">Publicado</option>
                <option value="Pendiente de Pago">Pendiente de Pago</option>
                <option value="Vendido">Vendido</option>
              </select>
            </div>
            <button
              type="button"
              data-testid="add-vehicle"
              onClick={() => setModal({})}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-inverse px-5 py-2 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              Agregar Vehículo
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface shadow-[var(--card-shadow)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-widest text-muted">
                <th scope="col" className="px-4 py-3 font-medium">
                  Vehículo
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Precio
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Fecha de Publicación
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody data-testid="listing-rows">
              {shown.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-900">
                        <Image
                          src={l.image}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </span>
                      <span className="font-medium">
                        {l.year} {l.make} {l.model}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {usd.format(l.price)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted">
                    {dateFmt.format(new Date(l.publishedAt))}
                  </td>
                  <td className="px-4 py-3">
                    <Pill className={STATUS_STYLES[l.status]}>{l.status}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/autos/${l.id}`}
                        aria-label={`Ver ${l.make} ${l.model}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-bg hover:text-fg"
                      >
                        <Eye
                          className="h-4 w-4"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </Link>
                      <button
                        type="button"
                        aria-label={`Editar ${l.make} ${l.model}`}
                        onClick={() =>
                          setModal({ vehicle: vehicles.find((v) => v.id === l.id) })
                        }
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
                        aria-label={`Eliminar ${l.make} ${l.model}`}
                        onClick={() => remove(l)}
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
          {shown.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted">
              Ningún vehículo coincide con la búsqueda.
            </p>
          )}
        </div>
        <p className="mt-3 text-xs tabular-nums text-subtle" aria-live="polite">
          Mostrando {shown.length} de {listings.length} vehículos
          {limit && listings.length > limit && (
            <>
              {" · "}
              <Link
                href="/dashboard/vehiculos"
                className="text-fg underline-offset-4 hover:underline"
              >
                Ver todos
              </Link>
            </>
          )}
        </p>
      </section>

      {modal && (
        <VehicleModal
          key={modal.vehicle?.id ?? "new"}
          vehicle={modal.vehicle}
          dealerships={dealerships}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
