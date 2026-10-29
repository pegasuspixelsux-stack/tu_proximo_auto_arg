"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, MapPin, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Vehicle } from "../data/vehicles";
import { usePrice } from "./CurrencyProvider";

const km = new Intl.NumberFormat("es-UY");
const KM_PER_MILE = 1.60934;
const FUEL_LABELS: Record<Vehicle["fuelType"], string> = {
  Electric: "Eléctrico",
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Diesel: "Diésel",
};

/** Class for compact (true), full (false), or compact-on-mobile ("mobile"). */
function pick(
  compact: boolean | "mobile",
  compactCls: string,
  fullCls: string,
  mobileCls: string,
) {
  if (compact === true) return compactCls;
  if (compact === "mobile") return `${compactCls} ${mobileCls}`;
  return fullCls;
}

export default function VehicleCard({
  vehicle,
  compact = false,
}: {
  vehicle: Vehicle;
  /** `true` always compact; `"mobile"` compact below the sm breakpoint only. */
  compact?: boolean | "mobile";
}) {
  const reduce = useReducedMotion();
  const price = usePrice();
  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;

  return (
    <motion.article
      layout
      data-testid={`vehicle-card-${vehicle.id}`}
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      whileHover={reduce ? undefined : { y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
      className={`card-glow group relative w-full min-w-0 cursor-pointer overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--card-shadow)] backdrop-blur-xl focus-within:ring-2 focus-within:ring-fg/60 ${compact === true ? "flex h-full flex-col" : compact ? "flex h-full flex-col sm:block sm:h-auto" : ""}`}
    >
      <div
        className={`relative w-full overflow-hidden bg-neutral-900 ${pick(compact, "h-36", "h-52", "sm:h-52")}`}
      >
        {imageFailed ? (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950" />
        ) : (
          <Image
            src={vehicle.image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={() => setImageFailed(true)}
            className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover:scale-[1.06]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {vehicle.sellerType === "dealer" && vehicle.dealership?.logo && !logoFailed ? (
            <span
              data-testid={`seller-badge-${vehicle.id}`}
              className="relative block h-8 w-24 overflow-hidden rounded-full border border-white/20 bg-white/90 shadow-sm backdrop-blur-md"
            >
              <Image
                src={vehicle.dealership.logo}
                alt={vehicle.dealership.name}
                fill
                sizes="96px"
                onError={() => setLogoFailed(true)}
                className="object-contain p-1.5"
              />
            </span>
          ) : (
            <span
              data-testid={`seller-badge-${vehicle.id}`}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md"
            >
              {vehicle.sellerType === "dealer" ? (
                <Building2
                  className="h-3 w-3 shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
              ) : (
                <UserRound
                  className="h-3 w-3 shrink-0"
                  strokeWidth={2}
                  aria-hidden
                />
              )}
              <span className="truncate">
                {vehicle.sellerType === "dealer" && vehicle.dealership
                  ? vehicle.dealership.name
                  : "Particular"}
              </span>
            </span>
          )}
          {vehicle.badge && (
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur-md">
              {vehicle.badge}
            </span>
          )}
        </div>
      </div>

      <div
        className={pick(
          compact,
          "flex flex-1 flex-col p-3.5",
          "p-5",
          "sm:block sm:p-5",
        )}
      >
        <div className="flex items-baseline justify-between gap-4">
          <span
            className={`font-medium uppercase tracking-widest text-muted ${pick(compact, "text-[10px]", "text-xs", "sm:text-xs")}`}
          >
            {vehicle.year} · {FUEL_LABELS[vehicle.fuelType]}
          </span>
          <span
            className={`font-mono tabular-nums text-muted ${pick(compact, "text-[10px]", "text-xs", "sm:text-xs")}`}
          >
            {km.format(Math.round(vehicle.mileage * KM_PER_MILE))} km
          </span>
        </div>

        <h3
          className={`mt-1 font-medium tracking-tight text-fg ${pick(compact, "text-base", "text-xl", "sm:text-xl")}`}
        >
          <Link
            href={`/autos/${vehicle.id}`}
            className="outline-none after:absolute after:inset-0"
          >
            {vehicle.make} {vehicle.model}
          </Link>
        </h3>
        <p
          className={`mt-1 text-subtle ${pick(compact, "mb-3 text-[10px]", "text-xs", "sm:mb-0 sm:text-xs")}`}
        >
          <span className="inline-flex items-center gap-1">
            <MapPin
              className="h-3 w-3 shrink-0"
              strokeWidth={1.75}
              aria-hidden
            />
            {vehicle.location}
          </span>
        </p>

        <div
          className={`flex items-center justify-between border-t border-line ${pick(compact, "mt-auto pt-3", "mt-4 pt-4", "sm:mt-4 sm:pt-4")}`}
        >
          <p
            className={`font-light tabular-nums tracking-tight text-fg ${pick(compact, "text-base", "text-xl", "sm:text-xl")}`}
          >
            {price(vehicle)}
          </p>
          <Link
            href={`/autos/${vehicle.id}`}
            aria-label={`Ver la ficha del ${title}`}
            data-testid={`open-${vehicle.id}`}
            className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-[color,transform,border-color] duration-150 hover:border-fg/40 hover:text-fg group-hover:translate-x-0.5 active:scale-95"
          >
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
