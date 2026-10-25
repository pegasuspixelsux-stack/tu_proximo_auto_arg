export interface SiteSettings {
  /** Digits only, with country code, so it can be used in a wa.me link. */
  whatsappNumber: string;
}

export const DEFAULT_SITE: SiteSettings = { whatsappNumber: "59899000000" };

/** Strips everything but digits. */
export const cleanPhone = (raw: string) => raw.replace(/\D/g, "");

export const isValidPhone = (digits: string) => /^\d{8,15}$/.test(digits);

/** "59899000000" -> "+598 99 000 000" (Uruguay); anything else -> "+digits". */
export function formatPhone(digits: string) {
  const uy = /^598(\d{2})(\d{3})(\d{3})$/.exec(digits);
  return uy ? `+598 ${uy[1]} ${uy[2]} ${uy[3]}` : `+${digits}`;
}
