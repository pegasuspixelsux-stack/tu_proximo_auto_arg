"use client";

import { LayoutGroup, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
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
import CategoryScroller from "../components/CategoryScroller";
import GridToggle, { useGridCols } from "../components/GridToggle";
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
  // Mobile category pills ("" = Todos), same as the home page.
  const [category, setCategory] = useState("");
  const [gridCols, setGridCols] = useGridCols();
  const [initial, setInitial] = useState<Partial<SearchCriteria>>();
  const pillsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const sortId = useId();
  const arsRate = useArsRate();

  // The mobile search modal sends its query as URL params; apply them once on arrival.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = { ...EMPTY_CRITERIA };
    for (const key of Object.keys(fromUrl) as (keyof SearchCriteria)[])
      fromUrl[key] = (params.get(key) ?? "").trim();
    // The body type is shown by the category pills instead of the filter panel.
    const urlCategory = fromUrl.bodyType;
    fromUrl.bodyType = "";
    if (!hasCriteria(fromUrl) && !urlCategory) return;
    // Deferred so the first (server-matching) render stays untouched.
    queueMicrotask(() => {
      setInitial(fromUrl);
      setCategory(urlCategory);
      setCriteria(fromUrl);
      setSearchKey((k) => k + 1);
    });
  }, []);

  const counts = useMemo(
    () => pillCounts(vehicles, criteria, arsRate),
    [vehicles, criteria, arsRate],
  );

  const results = useMemo(() => {
    const pillTest = (FILTER_PILLS.find((p) => p.id === pill) ?? FILTER_PILLS[0]).test;
    const list = vehicles.filter(
      (v) =>
        pillTest(v) &&
        (!category || v.bodyType === category) &&
        matchesCriteria(v, criteria, arsRate),
    );
    const by: Record<Sort, (a: Vehicle, b: Vehicle) => number> = {
      recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
      "price-asc": (a, b) => priceInUsd(a, arsRate) - priceInUsd(b, arsRate),
      "price-desc": (a, b) => priceInUsd(b, arsRate) - priceInUsd(a, arsRate),
      "km-asc": (a, b) => a.mileage - b.mileage,
    };
    return list.sort(by[sort]);
  }, [vehicles, criteria, sort, pill, category, arsRate]);

  const filtering = pill !== "all" || category !== "" || hasCriteria(criteria);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const items = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function clearFilters() {
    setPill("all");
    setCategory("");
    setCriteria(EMPTY_CRITERIA);
    setInitial(undefined);
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
      <header className="pt-[10px] lg:pt-5">
        <h1 className="sr-only">
          Autos usados en venta
        </h1>
        <p className="mt-1 max-w-2xl text-center text-muted sm:text-left">
          Explorá nuestro inventario de autos usados.
        </p>
      </header>

      {/* Search lives in the top nav; this is just the scroll anchor. */}
      <div ref={topRef} className="scroll-mt-20" />

      <section className="mt-2 md:mt-4 lg:mt-3" aria-label="Resultados">
        <div className="mb-2 md:hidden">
          <CategoryScroller
            value={category}
            onChange={(next) => {
              setCategory(next);
              setPage(1);
            }}
          />
        </div>
        <LayoutGroup id="inventory-filters">
          <div className="mb-2 hidden min-w-0 md:flex items-center gap-2">
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
          <div className="flex w-full items-center justify-between gap-3 sm:justify-end">
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
            <GridToggle cols={gridCols} onChange={setGridCols} />
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
          <ul className={`mt-3 grid sm:mx-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 ${gridCols === 2 ? "-mx-[10px] grid-cols-2 gap-[2px]" : "grid-cols-1 gap-3"}`}>
            {items.map((v) => (
              <li key={v.id} className="flex">
                <VehicleCard
                  vehicle={v}
                  animateIn={false}
                  compact={gridCols === 2 ? "mobile" : false}
                  hideLocation={gridCols === 2}
                />
              </li>
            ))}
          </ul>
        )}

        <p
          data-testid="results-count"
          aria-live="polite"
          className="mt-4 text-left text-sm tabular-nums text-muted"
        >
          Mostrando {items.length} de {results.length}{" "}
          {results.length === 1 ? "vehículo" : "vehículos"}
        </p>

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
