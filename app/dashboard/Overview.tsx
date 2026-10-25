"use client";

import {
  CarFront,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState, type FormEvent } from "react";
import {
  LISTINGS,
  TEAM,
  type DashboardListing,
  type ListingStatus,
  type MemberStatus,
  type Role,
  type TeamMember,
} from "./data";
import HeroSlidesEditor from "./HeroSlidesEditor";
import WhatsappSetting from "./WhatsappSetting";
import type { HeroSlide } from "../data/hero";

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

interface Kpi {
  label: string;
  value: string;
  trend: string;
  /** Whether the change is good news. */
  good: boolean;
  up: boolean;
  icon: LucideIcon;
}

const KPIS: Kpi[] = [
  {
    label: "Tiempo promedio en stock",
    value: "24 días",
    trend: "−3 días vs. mes anterior",
    good: true,
    up: false,
    icon: Clock,
  },
  {
    label: "Vehículos ingresados (último mes)",
    value: "18",
    trend: "+4 vs. mes anterior",
    good: true,
    up: true,
    icon: CarFront,
  },
  {
    label: "Vehículos vendidos (último mes)",
    value: "12",
    trend: "+2 vs. mes anterior",
    good: true,
    up: true,
    icon: CheckCircle2,
  },
  {
    label: "Total inventario activo",
    value: "45",
    trend: "+6 vs. mes anterior",
    good: true,
    up: true,
    icon: Layers,
  },
];

const STATUS_STYLES: Record<ListingStatus, string> = {
  Publicado: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "Pendiente de Pago": "border-amber-500/30 bg-amber-500/10 text-amber-400",
  Vendido: "border-line bg-surface text-muted",
};

const MEMBER_STYLES: Record<MemberStatus, string> = {
  Activo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Invitado: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const ROLES: Role[] = ["Super Admin", "Editor", "Soporte"];

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

export default function Overview({
  heroSlides,
  whatsappNumber,
}: {
  heroSlides: HeroSlide[];
  whatsappNumber: string;
}) {
  const [listings, setListings] = useState<DashboardListing[]>(LISTINGS);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [inviting, setInviting] = useState(false);
  const searchId = useId();
  const statusId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (status === "all" || l.status === status) &&
        (!q || `${l.year} ${l.make} ${l.model}`.toLowerCase().includes(q)),
    );
  }, [listings, query, status]);

  function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email) return;
    const name = email.split("@")[0].replace(/[._-]+/g, " ");
    setTeam((t) => [
      ...t,
      {
        id: `t${t.length + 1}-${email}`,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: (form.get("role") as Role) ?? "Soporte",
        status: "Invitado",
      },
    ]);
    setInviting(false);
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
            Panel de Control
          </h1>
          <p className="mt-2 text-sm text-muted">
            Métricas internas y actividad reciente de la plataforma
          </p>
        </div>
        <button
          type="button"
          data-testid="add-vehicle"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-inverse px-5 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Agregar Vehículo
        </button>
      </header>

      <section
        aria-label="Indicadores"
        className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => {
          const Trend = kpi.up ? TrendingUp : TrendingDown;
          return (
            <div
              key={kpi.label}
              data-testid="kpi-card"
              className="rounded-xl border border-line bg-surface p-5 shadow-[var(--card-shadow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-widest text-muted">
                  {kpi.label}
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-fg">
                  <kpi.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-[-0.02em]">
                {kpi.value}
              </p>
              <p
                className={`mt-2 inline-flex items-center gap-1.5 text-xs ${
                  kpi.good ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <Trend className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {kpi.trend}
              </p>
            </div>
          );
        })}
      </section>

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
            Últimos Vehículos Publicados
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
              {filtered.map((l) => (
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
                        onClick={() =>
                          setListings((all) => all.filter((x) => x.id !== l.id))
                        }
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
              Ningún vehículo coincide con la búsqueda.
            </p>
          )}
        </div>
        <p className="mt-3 text-xs tabular-nums text-subtle" aria-live="polite">
          Mostrando {filtered.length} de {listings.length} vehículos
        </p>
      </section>

      <section
        id="equipo"
        aria-labelledby="team-heading"
        className="mt-12 scroll-mt-20 lg:scroll-mt-6"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 id="team-heading" className="text-xl font-medium tracking-tight">
            Gestión de Usuarios del Equipo
          </h2>
          <button
            type="button"
            onClick={() => setInviting((v) => !v)}
            aria-expanded={inviting}
            data-testid="invite-toggle"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition-[transform,border-color] duration-150 hover:border-fg/40 active:scale-95"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Invitar Usuario
          </button>
        </div>

        {inviting && (
          <form
            onSubmit={invite}
            data-testid="invite-form"
            className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="email@autoselect.com"
              aria-label="Email del invitado"
              className={`${FIELD} flex-1`}
            />
            <select
              name="role"
              defaultValue="Soporte"
              aria-label="Rol"
              className={FIELD}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-inverse px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95"
            >
              Enviar invitación
            </button>
          </form>
        )}

        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--card-shadow)]">
          {team.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-inverse text-sm font-semibold text-on-inverse"
              >
                {m.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              <span className="text-xs text-muted">{m.role}</span>
              <Pill className={MEMBER_STYLES[m.status]}>{m.status}</Pill>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="configuracion"
        aria-labelledby="settings-heading"
        className="mt-12 scroll-mt-20 lg:scroll-mt-6"
      >
        <h2
          id="settings-heading"
          className="text-xl font-medium tracking-tight"
        >
          Configuración
        </h2>
        <WhatsappSetting initial={whatsappNumber} />
        <HeroSlidesEditor initial={heroSlides} />
      </section>
    </main>
  );
}
