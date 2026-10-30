const PROVINCE = /^(bs\.?\s?as\.?|buenos aires|pba|prov(incia)?\.? de buenos aires|gba|gran buenos aires)$/i;
const CAPITAL = /^(caba|capital federal|c\.?a\.?b\.?a\.?|ciudad aut[oó]noma de buenos aires|ciudad de buenos aires)$/i;
const COUNTRY = /^(ar|arg|argentina|uy|uruguay)$/i;
const STREET = /^(av|avda|av\.|avenida|calle|ruta|camino|pasaje|pje|diagonal|bv|bulevar)\b/i;

/** Localities of Gran Buenos Aires the dealership serves; a bare name gets ", Buenos Aires". */
const GBA = [
  "tigre", "nordelta", "don torcuato", "general pacheco", "pacheco",
  "san fernando", "pilar", "san isidro", "vicente lópez", "vicente lopez",
  "olivos", "martínez", "martinez", "escobar", "la plata",
];

export const FALLBACK_PLACE = "Buenos Aires";
export const CAPITAL_LABEL = "Ciudad de Buenos Aires";

/**
 * Cleans a free-text `location` ("Av Ialia 123, Tigre, BsAs") into the form used
 * for display, titles, meta and JSON-LD: "Ciudad, Buenos Aires". Street parts and
 * numbers are dropped, abbreviations expanded, and the result is never empty.
 */
export function placeLabel(location: string | null | undefined): string {
  const parts = (location ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  while (parts.length > 1 && COUNTRY.test(parts[parts.length - 1])) parts.pop();
  if (parts.length === 0) return FALLBACK_PLACE;

  const last = parts[parts.length - 1];
  if (CAPITAL.test(last)) {
    const barrio = parts[parts.length - 2];
    const ok = barrio && !/\d/.test(barrio) && !STREET.test(barrio) && !PROVINCE.test(barrio);
    return ok ? `${barrio}, ${CAPITAL_LABEL}` : CAPITAL_LABEL;
  }
  const hasProvince = PROVINCE.test(last);
  const city = hasProvince ? parts[parts.length - 2] : last;
  if (!city || /\d/.test(city) || STREET.test(city) || COUNTRY.test(city)) {
    return FALLBACK_PLACE;
  }
  if (CAPITAL.test(city)) return CAPITAL_LABEL;
  if (PROVINCE.test(city)) return FALLBACK_PLACE;
  if (hasProvince || GBA.includes(city.toLowerCase())) return `${city}, Buenos Aires`;
  return city;
}

/** Whether the raw value already is "Ciudad, Buenos Aires"-style without a street. */
export function isCleanPlace(location: string | null | undefined): boolean {
  const raw = (location ?? "").trim();
  return raw !== "" && raw === placeLabel(raw);
}

/** Longest candidate that fits in `max` characters (candidates ordered long to short). */
export function fitText(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1];
}

/** Joins parts in order while the result stays within `max`. */
export function fitParts(parts: string[], max: number): string {
  let out = "";
  for (const part of parts) {
    const next = out ? `${out} ${part}` : part;
    if (next.length <= max) out = next;
  }
  return out;
}
