export interface SiteSettings {
  /** Digits only, with country code, so it can be used in a wa.me link. */
  whatsappNumber: string;
  /** Currency prices are shown in on the public site. Prices are stored in USD. */
  currency: Currency;
  /** Pesos per US dollar, used when `currency` is "ARS". */
  arsRate: number;
}

export type Currency = "USD" | "ARS";

export const DEFAULT_SITE: SiteSettings = {
  whatsappNumber: "59899000000",
  currency: "USD",
  arsRate: 1000,
};

export type PriceSettings = Pick<SiteSettings, "currency" | "arsRate">;

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

/** Formats a USD amount in the site's currency (converting when it is ARS). */
export function formatPrice(
  usd: number,
  { currency, arsRate }: PriceSettings,
  digits: 0 | 2 = 0,
) {
  const useArs = currency === "ARS" && arsRate > 0;
  return FORMATTERS[useArs ? "ARS" : "USD"][digits].format(
    useArs ? usd * arsRate : usd,
  );
}

/** Strips everything but digits. */
export const cleanPhone = (raw: string) => raw.replace(/\D/g, "");

export const isValidPhone = (digits: string) => /^\d{8,15}$/.test(digits);

/** "59899000000" -> "+598 99 000 000" (Uruguay); anything else -> "+digits". */
export function formatPhone(digits: string) {
  const uy = /^598(\d{2})(\d{3})(\d{3})$/.exec(digits);
  return uy ? `+598 ${uy[1]} ${uy[2]} ${uy[3]}` : `+${digits}`;
}
