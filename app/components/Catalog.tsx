"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  EMPTY_CRITERIA,
  hasCriteria,
  matchesCriteria,
  type SearchCriteria,
} from "@/lib/vehicle-search";
import type { Vehicle } from "../data/vehicles";
import { useArsRate } from "./CurrencyProvider";
import CategoryScroller from "./CategoryScroller";
import HeroSearch from "./HeroSearch";
import VehicleCard from "./VehicleCard";

const PAGE_SIZE = 12; // 4 columns x 3 rows on desktop
const MOBILE_PAGE_SIZE = 6; // 2 columns x 3 rows on mobile

export default function Catalog({ vehicles }: { vehicles: Vehicle[] }) {
  const [criteria, setCriteria] = useState<SearchCriteria>(EMPTY_CRITERIA);
  // Bumping this remounts the search box, which empties its inputs.
  const [searchKey, setSearchKey] = useState(0);
  const [page, setPage] = useState(1);
  // Category pills ("" = Todos), same on mobile and desktop.
  const [category, setCategory] = useState("");
  const arsRate = useArsRate();

  const visible = useMemo(
    () =>
      vehicles.filter(
        (v) =>
          (!category || v.bodyType === category) &&
          matchesCriteria(v, criteria, arsRate),
      ),
    [vehicles, category, criteria, arsRate],
  );

  const filtering = category !== "" || hasCriteria(criteria);

  function clearFilters() {
    setCategory("");
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
      className="mx-auto max-w-[1440px] scroll-mt-4 px-3 pb-1 pt-2 md:pb-12 md:pt-10 lg:px-6 lg:pb-12 lg:pt-5"
    >
      <h2 className="sr-only">Autos usados en venta</h2>
      <div className="mb-2 md:mb-10 lg:mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center md:gap-6">
        <div className="min-w-0 md:max-w-[50%]">
          <CategoryScroller
            value={category}
            onChange={(next) => {
              setCategory(next);
              setPage(1);
            }}
          />
        </div>
        <div className="relative hidden w-full items-start gap-2 md:flex md:w-[32rem] md:max-w-[50%] lg:w-[42rem]">
          <div className="hidden min-w-0 flex-1 md:block">
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
      </div>

      {visible.length > 0 && (
        <div className="sm:hidden">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-[-0.02em]">
              Destacados
            </h2>
            <Link
              href="/autos"
              className="shrink-0 text-xs text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
            >
              Ver todo el inventario →
            </Link>
          </div>
          <ul
            aria-label="Vehículos destacados"
            className="-mx-[10px] grid grid-cols-2 gap-[2px]"
          >
            {visible.slice(0, MOBILE_PAGE_SIZE).map((vehicle) => (
              <li key={vehicle.id} className="flex">
                <VehicleCard vehicle={vehicle} compact hideLocation />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-xs tabular-nums text-subtle">
              {Math.min(visible.length, MOBILE_PAGE_SIZE)}{" "}
              {Math.min(visible.length, MOBILE_PAGE_SIZE) === 1
                ? "vehículo"
                : "vehículos"}
            </p>
            <Link
              href="/autos"
              data-testid="see-all-inventory"
              className="shrink-0 text-xs text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
            >
              Ver todo el inventario →
            </Link>
          </div>
        </div>
      )}

      {/* Tablet and desktop: 12 cards per page (3 columns on tablet, 4 on desktop), with pagination. */}
      {visible.length > 0 && (
        <>
          <ul className="hidden grid-cols-3 gap-6 sm:grid lg:grid-cols-4">
            {pageItems.map((vehicle) => (
              <li key={vehicle.id} className="flex">
                <VehicleCard vehicle={vehicle} hideLocation />
              </li>
            ))}
          </ul>
        </>
      )}

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

      {/* Desktop: count on the left, pagination in the middle, full inventory on the right. */}
      <div className="mt-10 hidden grid-cols-[1fr_auto_1fr] items-center gap-4 sm:grid">
        <p
          data-testid="result-count"
          aria-live="polite"
          className="text-xs tabular-nums text-subtle"
        >
          {visible.length} {visible.length === 1 ? "vehículo" : "vehículos"}
        </p>
        {pageCount > 1 ? (
          <nav
            aria-label="Paginación"
            data-testid="pagination"
            className="flex items-center justify-center gap-2"
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
        ) : (
          <span />
        )}
        <Link
          href="/autos"
          className="justify-self-end text-xs text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
        >
          Ver todo el inventario →
        </Link>
      </div>
    </section>
  );
}
