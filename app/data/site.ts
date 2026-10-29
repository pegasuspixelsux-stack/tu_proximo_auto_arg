export interface SiteSettings {
  /** Digits only, with country code, so it can be used in a wa.me link. */
  whatsappNumber: string;
  /** Pesos per US dollar. Only used to compare ARS and USD listings (filters, sorting). */
  arsRate: number;
  /** Currency the home-page financing calculator works in. */
  calculatorCurrency: Currency;
}

export type Currency = "USD" | "ARS";

export const DEFAULT_SITE: SiteSettings = {
  whatsappNumber: "59899000000",
  arsRate: 1000,
  calculatorCurrency: "USD",
};

const FORMATTERS: Record<Currency, Record<0 | 2, Intl.NumberFormat>> = {
  USD: {
    0: new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    2: new Intl.NumberFormat("es-UY", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  },
  ARS: {
    0: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }),
    2: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  },
};

/** Formats an amount in the currency it was listed in. */
export function formatPrice(
  amount: number,
  currency: Currency = "USD",
  digits: 0 | 2 = 0,
) {
  return FORMATTERS[currency][digits].format(amount);
}

/** Strips everything but digits. */
export const cleanPhone = (raw: string) => raw.replace(/\D/g, "");

export const isValidPhone = (digits: string) => /^\d{8,15}$/.test(digits);

/** "59899000000" -> "+598 99 000 000" (Uruguay); anything else -> "+digits". */
export function formatPhone(digits: string) {
  const uy = /^598(\d{2})(\d{3})(\d{3})$/.exec(digits);
  return uy ? `+598 ${uy[1]} ${uy[2]} ${uy[3]}` : `+${digits}`;
}
