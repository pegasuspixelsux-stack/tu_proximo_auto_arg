"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  DEFAULT_SITE,
  formatPrice,
  type PriceSettings,
} from "../data/site";

const CurrencyContext = createContext<PriceSettings>(DEFAULT_SITE);

export function CurrencyProvider({
  currency,
  arsRate,
  children,
}: PriceSettings & { children: ReactNode }) {
  return (
    <CurrencyContext value={{ currency, arsRate }}>{children}</CurrencyContext>
  );
}

/** Formats a USD amount in the currency chosen in the dashboard settings. */
export function usePrice() {
  const settings = useContext(CurrencyContext);
  return (usd: number, digits: 0 | 2 = 0) => formatPrice(usd, settings, digits);
}
