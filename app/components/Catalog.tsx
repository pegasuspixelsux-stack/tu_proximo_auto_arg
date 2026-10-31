"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  EMPTY_CRITERIA,
  FILTER_PILLS,
  hasCriteria,
  isPillId,
  matchesCriteria,
  pillCounts,
  type PillId,
  type SearchCriteria,
} from "@/lib/vehicle-search";
import type { Vehicle } from "../data/vehicles";
import { useArsRate } from "./CurrencyProvider";
import GridToggle, { useGridCols } from "./GridToggle";
import HeroSearch from "./HeroSearch";
import VehicleCard from "./VehicleCard";

const PAGE_SIZE = 12;

export default function Catalog({ vehicles }: { vehicles: Vehicle[] }) {
  const [filter, setFilter] = useState<PillId>("all");
  const [page, setPage] = useState(1);
  const [criteria, setCriteria] = useState<SearchCriteria>(EMPTY_CRITERIA);
  // Bumping this remounts the search box, which empties its inputs.
  const [searchKey, setSearchKey] = useState(0);
  const [gridCols, setGridCols] = useGridCols();
  const arsRate = useArsRate();
  const pillsRef = useRef<HTMLDivElement>(null);

  function scrollPills(direction: -1 | 1) {
    const el = pillsRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  }

  // The selected pill lives in the URL (?filtro=diesel) so it can be shared.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("filtro");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once after hydration
    if (fromUrl && isPillId(fromUrl)) setFilter(fromUrl);
  }, []);

  function selectPill(id: PillId) {
    setFilter(id);
    setPage(1);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("filtro");
    else url.searchParams.set("filtro", id);
    window.history.replaceState(null, "", url);
  }

  const counts = useMemo(
    () => pillCounts(vehicles, criteria, arsRate),
    [vehicles, criteria, arsRate],
  );

  const visible = useMemo(() => {
    const active = FILTER_PILLS.find((f) => f.id === filter) ?? FILTER_PILLS[0];
    return vehicles.filter(
      (v) => active.test(v) && matchesCriteria(v, criteria, arsRate),
    );
  }, [vehicles, filter, criteria, arsRate]);

  const filtering = filter !== "all" || hasCriteria(criteria);

  function clearFilters() {
    selectPill("all");
    setCriteria(EMPTY_CRITERIA);
    setSearchKey((k) => k + 1);
    setPage(1);
  }

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageItems = visible.slice(
    (current - 1) * PAGE_SIZE,
    current * PAGE_SIZE,
  );

  function goTo(next: number) {
    setPage(next);
    document
      .getElementById("inventory")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="inventory"
      data-testid="catalog"
      className="mx-auto max-w-[1440px] scroll-mt-4 px-3 pb-10 pt-4 md:pb-12 md:pt-12 lg:px-6 lg:pb-16 lg:pt-16"
    >
      <h2 className="sr-only">Autos usados en venta</h2>
      <div className="mb-5 md:mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <LayoutGroup id="inventory-filters">
          <div className="hidden min-w-0 items-center gap-2 md:flex md:max-w-[50%]">
            <button
              type="button"
              aria-label="Desplazar filtros a la izquierda"
              onClick={() => scrollPills(-1)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95"
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
                const selected = f.id === filter;
                const count = counts[f.id];
                return (
                  <button
                    key={f.id}
                    type="button"
                    data-testid={`filter-${f.id}`}
                    aria-pressed={selected}
                    onClick={() => selectPill(f.id)}
                    className={`relative shrink-0 snap-start whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-[color,border-color,transform] duration-150 active:scale-[0.97] ${
                      selected
                        ? "border-transparent text-on-inverse"
                        : "border-line text-muted hover:border-fg/40 hover:text-fg"
                    } ${count === 0 && !selected ? "opacity-50" : ""}`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="filter-pill"
                        transition={{
                          type: "spring",
                          duration: 0.4,
                          bounce: 0.15,
                        }}
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </LayoutGroup>
        <div className="w-full md:w-[32rem] md:max-w-[50%] lg:w-[42rem]">
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

      <GridToggle cols={gridCols} onChange={setGridCols} />
      <motion.div
        layout
        className={`grid gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 ${gridCols === 2 ? "grid-cols-2" : "grid-cols-1"}`}
      >
        <AnimatePresence mode="popLayout">
          {pageItems.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              compact={gridCols === 2 ? "mobile" : false}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <div
          data-testid="empty-state"
          className="flex flex-col items-center gap-4 py-16 text-center"
        >
          <p className="text-sm text-muted">
            No se encontraron vehículos que coincidan con tu búsqueda.
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
      )}

      {pageCount > 1 && (
        <nav
          aria-label="Paginación"
          data-testid="pagination"
          className="mt-12 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            aria-label="Página anterior"
            disabled={current === 1}
            onClick={() => goTo(current - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
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
            aria-label="Página siguiente"
            disabled={current === pageCount}
            onClick={() => goTo(current + 1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-[color,transform] duration-150 hover:text-fg active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </nav>
      )}

      {/* Count on the left, advanced search in the middle, full inventory on the right. */}
      <div className="mt-10 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <p
          data-testid="result-count"
          aria-live="polite"
          className="text-center text-xs tabular-nums text-subtle sm:text-left"
        >
          {visible.length} {visible.length === 1 ? "vehículo" : "vehículos"}
        </p>
        <Link
          href="/autos"
          data-testid="advanced-search-link"
          className="group inline-flex items-center justify-center gap-2 justify-self-center rounded-full border border-line px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg transition-[border-color,transform] duration-150 hover:border-fg/40 active:scale-95"
        >
          <SlidersHorizontal
            className="h-4 w-4"
            strokeWidth={1.75}
            aria-hidden
          />
          Búsqueda avanzada
          <ArrowRight
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={1.75}
            aria-hidden
          />
        </Link>
        <Link
          href="/autos"
          data-testid="see-all-inventory"
          className="text-center text-xs text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline sm:text-right"
        >
          Ver todo el inventario →
        </Link>
      </div>
    </section>
  );
}
