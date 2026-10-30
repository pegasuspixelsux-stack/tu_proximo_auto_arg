const PROVINCE = /^(bs\.?\s?as\.?|buenos aires|pba|prov(incia)?\.? de buenos aires|gba|gran buenos aires)$/i;
const CAPITAL = /^(caba|capital federal|c\.?a\.?b\.?a\.?|ciudad aut[oó]noma de buenos aires)$/i;

/**
 * City or zone to show in titles and descriptions, taken from a free-text
 * `location` such as "Av Ialia, Tigre, BsAs". Never returns the street part,
 * and expands abbreviations ("BsAs" -> "Buenos Aires").
 */
export function placeLabel(location: string | undefined): string {
  const parts = (location ?? "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "Buenos Aires";
  const last = parts[parts.length - 1];
  if (CAPITAL.test(last)) return "CABA";
  const province = PROVINCE.test(last);
  // "Street, City, Province" -> City; "City, Province" -> City; "City" -> City.
  const city = province ? (parts.length > 1 ? parts[parts.length - 2] : "") : last;
  if (!city || /\d/.test(city) || /^(av|avda|calle|ruta)\b/i.test(city)) {
    return "Buenos Aires";
  }
  if (CAPITAL.test(city)) return "CABA";
  return province && !PROVINCE.test(city) ? `${city}, Buenos Aires` : city;
}

/** Longest candidate that fits in `max` characters (candidates ordered long to short). */
export function fitText(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1];
}

/** Joins parts in order while the result stays within `max`; cuts at a word boundary only as a last resort. */
export function fitParts(parts: string[], max: number): string {
  let out = "";
  for (const part of parts) {
    const next = out ? `${out} ${part}` : part;
    if (next.length <= max) out = next;
  }
  return out;
}
