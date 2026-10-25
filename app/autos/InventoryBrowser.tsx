"use client";

import { LayoutGroup, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  MapPin,
  Search,
  Settings2,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import type { BodyType, FuelType, SellerType, Vehicle } from "../data/vehicles";

const PAGE_SIZE = 12;
const KM_PER_MILE = 1.60934;

const usd = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("es-UY");

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: "Auto", label: "Autos" },
  { value: "SUV", label: "Camionetas / SUVs" },
  { value: "Deportivo", label: "Deportivos" },
  { value: "Clásico", label: "Clásicos" },
  { value: "Moto", label: "Motos" },
];

const FUELS: { value: FuelType; label: string }[] = [
  { value: "Gasoline", label: "Nafta" },
  { value: "Diesel", label: "Diésel" },
  { value: "Hybrid", label: "Híbrido" },
  { value: "Electric", label: "Eléctrico" },
];
const FUEL_LABEL = Object.fromEntries(
  FUELS.map((f) => [f.value, f.label]),
) as Record<FuelType, string>;

const KM_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "25000", label: "< 25.000 km" },
  { value: "50000", label: "< 50.000 km" },
  { value: "100000", label: "< 100.000 km" },
];

const SORTS = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "km-asc", label: "Menor kilometraje" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

type Pill = "all" | "electric" | "hybrid" | "gasoline" | "private" | "dealer";

const PILLS: { id: Pill; label: string; test: (v: Vehicle) => boolean }[] = [
  { id: "all", label: "Todos", test: () => true },
  { id: "electric", label: "Eléctricos", test: (v) => v.fuelType === "Electric" },
  { id: "hybrid", label: "Híbridos", test: (v) => v.fuelType === "Hybrid" },
  { id: "gasoline", label: "Nafta", test: (v) => v.fuelType === "Gasoline" },
  { id: "private", label: "Particulares", test: (v) => v.sellerType === "private" },
  { id: "dealer", label: "Concesionarias", test: (v) => v.sellerType === "dealer" },
];

const YEARS = Array.from({ length: 2026 - 1960 + 1 }, (_, i) => 2026 - i);

interface Filters {
  q: string;
  types: BodyType[];
  make: string;
  priceMin: string;
  priceMax: string;
  yearMin: string;
  yearMax: string;
  kmMax: string;
  transmission: "" | "Manual" | "Automática";
  fuels: FuelType[];
  location: string;
  sellers: SellerType[];
}

const EMPTY: Filters = {
  q: "",
  types: [],
  make: "",
  priceMin: "",
  priceMax: "",
  yearMin: "",
  yearMax: "",
  kmMax: "",
  transmission: "",
  fuels: [],
  location: "",
  sellers: [],
};

function matches(v: Vehicle, f: Filters) {
  const q = f.q.trim().toLowerCase();
  if (q && !`${v.year} ${v.make} ${v.model}`.toLowerCase().includes(q))
    return false;
  if (f.types.length && !f.types.includes(v.bodyType)) return false;
  if (f.make && v.make !== f.make) return false;
  if (f.priceMin && v.price < Number(f.priceMin)) return false;
  if (f.priceMax && v.price > Number(f.priceMax)) return false;
  if (f.yearMin && v.year < Number(f.yearMin)) return false;
  if (f.yearMax && v.year > Number(f.yearMax)) return false;
  if (f.kmMax && v.mileage * KM_PER_MILE >= Number(f.kmMax)) return false;
  if (f.transmission && v.transmission !== f.transmission) return false;
  if (f.fuels.length && !f.fuels.includes(v.fuelType)) return false;
  if (f.location && v.location !== f.location) return false;
  if (f.sellers.length && !f.sellers.includes(v.sellerType)) return false;
  return true;
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";
const LABEL = "text-[10px] font-medium uppercase tracking-widest text-muted";

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className={`${LABEL} mb-2.5`}>{label}</legend>
      {children}
    </fieldset>
  );
}

function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-muted transition-colors duration-150 hover:text-fg">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-[var(--inverse)]"
      />
      {children}
    </label>
  );
}

interface PanelProps {
  draft: Filters;
  setDraft: (next: Filters) => void;
  makes: string[];
  locations: string[];
  onApply: () => void;
  onClear: () => void;
  idPrefix: string;
}

function FiltersPanel({
  draft,
  setDraft,
  makes,
  locations,
  onApply,
  onClear,
  idPrefix,
}: PanelProps) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
      className="space-y-6"
    >
      <div className="relative">
        <label htmlFor={`${idPrefix}-q`} className="sr-only">
          Buscar por marca o modelo
        </label>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          id={`${idPrefix}-q`}
          type="search"
          value={draft.q}
          onChange={(e) => set("q", e.target.value)}
          placeholder="Marca, modelo…"
          className={`${FIELD} pl-9`}
        />
      </div>

      <Group label="Tipo de vehículo">
        <div className="space-y-2">
          {BODY_TYPES.map((t) => (
            <Check
              key={t.value}
              checked={draft.types.includes(t.value)}
              onChange={() => set("types", toggle(draft.types, t.value))}
            >
              {t.label}
            </Check>
          ))}
        </div>
      </Group>

      <div>
        <label htmlFor={`${idPrefix}-make`} className={LABEL}>
          Marca
        </label>
        <select
          id={`${idPrefix}-make`}
          value={draft.make}
          onChange={(e) => set("make", e.target.value)}
          className={`${FIELD} mt-2`}
        >
          <option value="">Todas las marcas</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <Group label="Precio (US$)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.priceMin}
            onChange={(e) => set("priceMin", e.target.value)}
            placeholder="Mín."
            aria-label="Precio mínimo"
            className={FIELD}
          />
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={draft.priceMax}
            onChange={(e) => set("priceMax", e.target.value)}
            placeholder="Máx."
            aria-label="Precio máximo"
            className={FIELD}
          />
        </div>
      </Group>

      <Group label="Año">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={draft.yearMin}
            onChange={(e) => set("yearMin", e.target.value)}
            aria-label="Año desde"
            className={FIELD}
          >
            <option value="">Desde</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={draft.yearMax}
            onChange={(e) => set("yearMax", e.target.value)}
            aria-label="Año hasta"
            className={FIELD}
          >
            <option value="">Hasta</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </Group>

      <div>
        <label htmlFor={`${idPrefix}-km`} className={LABEL}>
          Kilometraje
        </label>
        <select
          id={`${idPrefix}-km`}
          value={draft.kmMax}
          onChange={(e) => set("kmMax", e.target.value)}
          className={`${FIELD} mt-2`}
        >
          {KM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <Group label="Transmisión">
        <div className="grid grid-cols-2 gap-2" role="group">
          {(["Manual", "Automática"] as const).map((t) => {
            const on = draft.transmission === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => set("transmission", on ? "" : t)}
                className={`rounded-full border px-3 py-2 text-xs font-medium transition-[color,background-color,transform] duration-150 active:scale-95 ${
                  on
                    ? "border-transparent bg-inverse text-on-inverse"
                    : "border-line text-muted hover:text-fg"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Combustible">
        <div className="grid grid-cols-2 gap-2">
          {FUELS.map((f) => (
            <Check
              key={f.value}
              checked={draft.fuels.includes(f.value)}
              onChange={() => set("fuels", toggle(draft.fuels, f.value))}
            >
              {f.label}
            </Check>
          ))}
        </div>
      </Group>

      <div>
        <label htmlFor={`${idPrefix}-loc`} className={LABEL}>
          Ubicación
        </label>
        <select
          id={`${idPrefix}-loc`}
          value={draft.location}
          onChange={(e) => set("location", e.target.value)}
          className={`${FIELD} mt-2`}
        >
          <option value="">Todo el país</option>
          {locations.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <Group label="Vendedor">
        <div className="space-y-2">
          <Check
            checked={draft.sellers.includes("private")}
            onChange={() => set("sellers", toggle(draft.sellers, "private"))}
          >
            Particular
          </Check>
          <Check
            checked={draft.sellers.includes("dealer")}
            onChange={() => set("sellers", toggle(draft.sellers, "dealer"))}
          >
            Concesionaria
          </Check>
        </div>
      </Group>

      <div className="space-y-2 pt-2">
        <button
          type="submit"
          data-testid="apply-filters"
          className="w-full rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98]"
        >
          Aplicar Filtros
        </button>
        <button
          type="button"
          onClick={onClear}
          data-testid="clear-filters"
          className="w-full rounded-full px-6 py-2.5 text-xs font-medium text-muted transition-colors duration-150 hover:text-fg"
        >
          Limpiar Filtros
        </button>
      </div>
    </form>
  );
}

function CarCard({ vehicle }: { vehicle: Vehicle }) {
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const km = number.format(Math.round(vehicle.mileage * KM_PER_MILE));
  return (
    <article
      data-testid={`car-${vehicle.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--card-shadow)] transition-[transform,box-shadow,border-color] duration-300 ease-out [:root:not([data-theme=light])_&]:hover:border-brand/50 [:root:not([data-theme=light])_&]:hover:shadow-[0_0_36px_-6px_rgba(255,234,0,0.45)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:ring-fg/60"
    >
      <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
        <Image
          src={vehicle.image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 30vw"
          className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            {vehicle.sellerType === "dealer" ? (
              <Building2 className="h-3 w-3" strokeWidth={2} aria-hidden />
            ) : (
              <UserRound className="h-3 w-3" strokeWidth={2} aria-hidden />
            )}
            {vehicle.sellerType === "dealer" ? "Concesionaria" : "Particular"}
          </span>
          {vehicle.badge && (
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
              {vehicle.badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-medium tracking-tight">
          <Link
            href={`/autos/${vehicle.id}`}
            className="outline-none after:absolute after:inset-0"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1 text-2xl font-light tabular-nums tracking-tight">
          {usd.format(vehicle.price)}
        </p>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {km} km
          </li>
          <li className="flex items-center gap-1.5">
            <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {vehicle.transmission}
          </li>
          <li className="flex items-center gap-1.5">
            <Fuel className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            {FUEL_LABEL[vehicle.fuelType]}
          </li>
        </ul>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-subtle">
          <MapPin
            className="h-3.5 w-3.5 shrink-0"
            strokeWidth={1.75}
            aria-hidden
          />
          {vehicle.location.replace(", UY", ", Uruguay")}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-xs font-semibold text-muted transition-colors duration-150 group-hover:text-fg">
          Ver ficha completa
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}

export default function InventoryBrowser({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const [sort, setSort] = useState<Sort>("recent");
  const [pill, setPill] = useState<Pill>("all");
  const [page, setPage] = useState(1);
  const pillsRef = useRef<HTMLDivElement>(null);
  const [drawer, setDrawer] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const sortId = useId();

  const makes = useMemo(
    () => [...new Set(vehicles.map((v) => v.make))].sort(),
    [vehicles],
  );
  const locations = useMemo(
    () => [...new Set(vehicles.map((v) => v.location))].sort(),
    [vehicles],
  );

  const results = useMemo(() => {
    const pillTest = (PILLS.find((p) => p.id === pill) ?? PILLS[0]).test;
    const list = vehicles.filter((v) => pillTest(v) && matches(v, applied));
    const by: Record<Sort, (a: Vehicle, b: Vehicle) => number> = {
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "km-asc": (a, b) => a.mileage - b.mileage,
    };
    return list.sort(by[sort]);
  }, [vehicles, applied, sort, pill]);

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const items = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function apply() {
    setApplied(draft);
    setPage(1);
    setDrawer(false);
  }
  function clear() {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  }
  function scrollPills(direction: -1 | 1) {
    const el = pillsRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }
  function goTo(n: number) {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const panel = (idPrefix: string) => (
    <FiltersPanel
      draft={draft}
      setDraft={setDraft}
      makes={makes}
      locations={locations}
      onApply={apply}
      onClear={clear}
      idPrefix={idPrefix}
    />
  );

  return (
    <>
      <header className="pt-10">
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] lg:text-5xl">
          Salón de Ventas
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Explorá nuestro inventario de vehículos verificados y filtrá según tus
          preferencias.
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside
          aria-label="Búsqueda avanzada"
          data-testid="filters-desktop"
          className="hidden lg:col-span-3 lg:block"
        >
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-line bg-surface p-5 shadow-[var(--card-shadow)]">
            {panel("d")}
          </div>
        </aside>

        <section className="lg:col-span-9" aria-label="Resultados">
          <div ref={topRef} className="scroll-mt-20" />
          <LayoutGroup id="inventory-filters">
            <div className="mb-6 flex min-w-0 items-center gap-2">
              <button
                type="button"
                aria-label="Desplazar filtros a la izquierda"
                onClick={() => scrollPills(-1)}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95 md:flex"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <div
                ref={pillsRef}
                role="group"
                aria-label="Filtrar vehículos"
                className="flex min-w-0 flex-1 snap-x gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {PILLS.map((f) => {
                  const selected = f.id === pill;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      data-testid={`filter-${f.id}`}
                      aria-pressed={selected}
                      onClick={() => {
                        setPill(f.id);
                        setPage(1);
                      }}
                      className={`relative shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-[color,border-color,transform] duration-150 active:scale-[0.97] ${
                        selected
                          ? "border-transparent text-on-inverse"
                          : "border-line text-muted hover:border-fg/40 hover:text-fg"
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="filter-pill"
                          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                          className="absolute inset-0 rounded-full bg-inverse"
                        />
                      )}
                      <span className="relative">{f.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                aria-label="Desplazar filtros a la derecha"
                onClick={() => scrollPills(1)}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95 md:flex"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </LayoutGroup>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p
              data-testid="results-count"
              aria-live="polite"
              className="text-sm tabular-nums text-muted"
            >
              Mostrando {items.length} de {results.length}{" "}
              {results.length === 1 ? "vehículo" : "vehículos"}
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor={sortId} className="text-xs text-muted">
                Ordenar por
              </label>
              <select
                id={sortId}
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as Sort);
                  setPage(1);
                }}
                data-testid="sort"
                className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-medium text-fg outline-none focus:border-fg/40"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="py-24 text-center text-sm text-muted">
              Ningún vehículo coincide con los filtros. Probá con otros o
              limpialos.
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((v) => (
                <li key={v.id}>
                  <CarCard vehicle={v} />
                </li>
              ))}
            </ul>
          )}

          {pageCount > 1 && (
            <nav
              aria-label="Paginación"
              data-testid="pagination"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                disabled={current === 1}
                onClick={() => goTo(current - 1)}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-line px-4 text-xs font-medium text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft
                  className="h-4 w-4"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Anterior
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Página ${n}`}
                  aria-current={n === current ? "page" : undefined}
                  onClick={() => goTo(n)}
                  className={`h-9 min-w-9 rounded-full px-3 text-xs font-medium tabular-nums transition-[color,background-color,transform] duration-150 active:scale-95 ${
                    n === current
                      ? "bg-inverse text-on-inverse"
                      : "border border-line text-muted hover:text-fg"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={current === pageCount}
                onClick={() => goTo(current + 1)}
                className="inline-flex h-9 items-center gap-1 rounded-full border border-line px-4 text-xs font-medium text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                Siguiente
                <ChevronRight
                  className="h-4 w-4"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* Mobile and tablet: floating button + filter drawer. */}
      <button
        type="button"
        onClick={() => setDrawer(true)}
        data-testid="open-filters"
        className="fixed bottom-5 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-inverse px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-on-inverse shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)] transition-transform duration-150 active:scale-95 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        Filtrar Búsqueda
      </button>

      {drawer && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filtrar búsqueda"
        >
          <button
            type="button"
            aria-label="Cerrar filtros"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-line bg-bg p-5 pb-8">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-lg font-medium tracking-tight">
                Filtrar Búsqueda
              </p>
              <button
                type="button"
                aria-label="Cerrar filtros"
                onClick={() => setDrawer(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted hover:text-fg"
              >
                <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            {panel("m")}
          </div>
        </div>
      )}
    </>
  );
}
