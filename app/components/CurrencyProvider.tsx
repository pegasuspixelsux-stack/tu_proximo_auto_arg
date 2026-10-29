"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SITE, formatPrice } from "../data/site";
import type { Vehicle } from "../data/vehicles";

const RateContext = createContext<number>(DEFAULT_SITE.arsRate);

export function CurrencyProvider({
  arsRate,
  children,
}: {
  arsRate: number;
  children: ReactNode;
}) {
  return <RateContext value={arsRate}>{children}</RateContext>;
}

/** Pesos per dollar, for comparing ARS and USD listings. */
export const useArsRate = () => useContext(RateContext);

/** Formats a vehicle's price in the currency it was listed in. */
export function usePrice() {
  return (v: Pick<Vehicle, "price" | "priceCurrency">) =>
    formatPrice(v.price, v.priceCurrency);
}
