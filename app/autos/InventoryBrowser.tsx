"use client";

import { LayoutGroup, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import {
  EMPTY_CRITERIA,
  FILTER_PILLS,
  hasCriteria,
  matchesCriteria,
  pillCounts,
  type PillId,
  type SearchCriteria,
} from "@/lib/vehicle-search";
import { useArsRate } from "../components/CurrencyProvider";
import HeroSearch from "../components/HeroSearch";
import VehicleCard from "../components/VehicleCard";
import { priceInUsd, type Vehicle } from "../data/vehicles";

const PAGE_SIZE = 12;

const SORTS = [
  { value: "recent", label: "Más recientes" },
  { value: "price-asc", label: "Menor precio" },
  { value: "price-desc", label: "Mayor precio" },
  { value: "km-asc", label: "Menor kilometraje" },
] as const;
type Sort = (typeof SORTS)[number]["value"];

export default function InventoryBrowser({
  vehicles,
}: {
  vehicles: Vehicle[];
}) {
  const [criteria, setCriteria] = useState<SearchCriteria>(EMPTY_CRITERIA);
  // Bumping this remounts the search box, which empties its inputs.
  const [searchKey, setSearchKey] = useState(0);
  const [sort, setSort] = useState<Sort>("recent");
  const [pill, setPill] = useState<PillId>("all");
  const [page, setPage] = useState(1);
  const pillsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sortId = useId();
  const arsRate = useArsRate();

  const counts = useMemo(
    () => pillCounts(vehicles, criteria, arsRate),
    [vehicles, criteria, arsRate],
  );

  const results = useMemo(() => {
    const pillTest = (FILTER_PILLS.find((p) => p.id === pill) ?? FILTER_PILLS[0]).test;
    const list = vehicles.filter(
      (v) => pillTest(v) && matchesCriteria(v, criteria, arsRate),
    );
    const by: Record<Sort, (a: Vehicle, b: Vehicle) => number> = {
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      "price-asc": (a, b) => priceInUsd(a, arsRate) - priceInUsd(b, arsRate),
      "price-desc": (a, b) => priceInUsd(b, arsRate) - priceInUsd(a, arsRate),
      "km-asc": (a, b) => a.mileage - b.mileage,
    };
    return list.sort(by[sort]);
  }, [vehicles, criteria, sort, pill, arsRate]);

  const filtering = pill !== "all" || hasCriteria(criteria);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const items = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function clearFilters() {
    setPill("all");
    setCriteria(EMPTY_CRITERIA);
    setSearchKey((k) => k + 1);
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

  return (
    <>
      <header className="pt-10">
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] lg:text-5xl">
          Autos usados en venta
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Explorá nuestro inventario de autos usados verificados en Tigre, Zona
          Norte y Buenos Aires, y filtrá según tus preferencias.
        </p>
      </header>

      {/* Same search as the home page; "Filtros" opens the advanced search. */}
      <div ref={topRef} className="mt-8 scroll-mt-20">
        <div className="max-w-3xl">
          <HeroSearch
            key={searchKey}
            compact
            onSearch={(next) => {
              setCriteria(next);
              setPage(1);
            }}
          />
        </div>
      </div>

      <section className="mt-8" aria-label="Resultados">
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
              {FILTER_PILLS.map((f) => {
                const selected = f.id === pill;
                const count = counts[f.id];
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
                    } ${count === 0 && !selected ? "opacity-50" : ""}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="filter-pill"
                        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                        className="absolute inset-0 rounded-full bg-inverse"
                      />
                    )}
                    <span className="relative">
                      {f.label}
                      <span className="ml-1.5 tabular-nums opacity-60">{count}</span>
                    </span>
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
          <div
            data-testid="empty-state"
            className="flex flex-col items-center gap-4 py-24 text-center"
          >
            <p className="text-sm text-muted">
              Ningún vehículo coincide con los filtros. Probá con otros o
              limpialos.
            </p>
            {filtering && (
              <button
                type="button"
                onClick={clearFilters}
                data-testid="clear-search"
                className="rounded-full border border-line px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition-[border-color,transform] duration-150 hover:border-fg/40 active:scale-95"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          // Same cards and grid as the home page catalog.
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {items.map((v) => (
              <li key={v.id} className="flex">
                <VehicleCard vehicle={v} animateIn={false} />
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
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
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
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </nav>
        )}
      </section>
    </>
  );
}
