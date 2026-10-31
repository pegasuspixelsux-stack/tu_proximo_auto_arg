import {
  priceInUsd,
  vehicleReference,
  type Vehicle,
} from "@/app/data/vehicles";

const KM_PER_MILE = 1.60934;

/** Everything the home-page search box and its advanced panel can ask for. */
export interface SearchCriteria {
  q: string;
  make: string;
  bodyType: string;
  transmission: string;
  fuel: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  kmMax: string;
  seller: string;
  location: string;
}

export const EMPTY_CRITERIA: SearchCriteria = {
  q: "",
  make: "",
  bodyType: "",
  transmission: "",
  fuel: "",
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  kmMax: "",
  seller: "",
  location: "",
};

/** Reads the search form's fields (missing ones stay empty). */
export function readCriteria(form: FormData): SearchCriteria {
  const out = { ...EMPTY_CRITERIA };
  for (const key of Object.keys(out) as (keyof SearchCriteria)[])
    out[key] = String(form.get(key) ?? "").trim();
  return out;
}

export const hasCriteria = (c: SearchCriteria) =>
  Object.values(c).some((v) => v !== "");

/** Lowercase and accent-free, so "diesel" finds "Diésel". */
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const FUEL_WORDS: Record<Vehicle["fuelType"], string> = {
  Gasoline: "Nafta",
  Diesel: "Diésel",
  Hybrid: "Híbrido",
  Electric: "Eléctrico",
};

/**
 * Free-text search: every word typed must appear (as a substring, any case)
 * somewhere in the listing's make, model, year, version, badge, color, fuel,
 * transmission, body type, description, location, dealership or reference.
 */
export function matchesText(v: Vehicle, query: string) {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = norm(
    [
      v.make,
      v.model,
      v.year,
      v.specs?.["Versión"],
      // Every technical-sheet value too, so "gnc" or "sin garantía" are findable.
      ...Object.values(v.specs ?? {}),
      v.badge,
      v.color,
      FUEL_WORDS[v.fuelType],
      v.transmission,
      v.bodyType,
      v.description,
      v.location,
      v.dealership?.name,
      vehicleReference(v),
    ]
      .filter((x) => x != null && x !== "")
      .join(" "),
  );
  return words.every((w) => haystack.includes(w));
}

const num = (s: string) => (s === "" ? null : Number(s));

/**
 * The single predicate behind the home page: text search and every advanced
 * filter must all pass. Prices compare in US$ (ARS listings are converted).
 */
export function matchesCriteria(v: Vehicle, c: SearchCriteria, arsRate: number) {
  if (!matchesText(v, c.q)) return false;
  if (c.make && !norm(v.make).includes(norm(c.make))) return false;
  if (c.bodyType && v.bodyType !== c.bodyType) return false;
  if (c.transmission && v.transmission !== c.transmission) return false;
  if (c.fuel && v.fuelType !== c.fuel) return false;
  if (c.seller && v.sellerType !== c.seller) return false;
  if (c.location && !norm(v.location).includes(norm(c.location))) return false;

  const yearMin = num(c.yearMin);
  const yearMax = num(c.yearMax);
  if (yearMin != null && v.year < yearMin) return false;
  if (yearMax != null && v.year > yearMax) return false;

  const usd = priceInUsd(v, arsRate);
  const priceMin = num(c.priceMin);
  const priceMax = num(c.priceMax);
  if (priceMin != null && usd < priceMin) return false;
  if (priceMax != null && usd > priceMax) return false;

  const kmMax = num(c.kmMax);
  if (kmMax != null && v.mileage * KM_PER_MILE > kmMax) return false;
  return true;
}

export type PillId =
  | "all"
  | "gasoline"
  | "diesel"
  | "hybrid"
  | "electric"
  | "private"
  | "dealer";

export interface FilterPill {
  id: PillId;
  label: string;
  test: (v: Vehicle) => boolean;
}

/**
 * Quick-filter pills shared by the home catalog and /autos. The fuel pills
 * mirror the allowed fuel types (Nafta, Diésel, Híbrido, Eléctrico); cars with
 * GNC are stored as Nafta, so they fall under "Nafta".
 */
export const FILTER_PILLS: FilterPill[] = [
  { id: "all", label: "Todos", test: () => true },
  { id: "electric", label: "Eléctricos", test: (v) => v.fuelType === "Electric" },
  { id: "hybrid", label: "Híbridos", test: (v) => v.fuelType === "Hybrid" },
  { id: "gasoline", label: "Nafta", test: (v) => v.fuelType === "Gasoline" },
  { id: "diesel", label: "Diésel", test: (v) => v.fuelType === "Diesel" },
  { id: "private", label: "Particulares", test: (v) => v.sellerType === "private" },
  { id: "dealer", label: "Concesionarias", test: (v) => v.sellerType === "dealer" },
];

export const isPillId = (value: string): value is PillId =>
  FILTER_PILLS.some((p) => p.id === value);

/** How many listings each pill would show given the current search criteria. */
export function pillCounts(
  vehicles: Vehicle[],
  criteria: SearchCriteria,
  arsRate: number,
): Record<PillId, number> {
  const matching = vehicles.filter((v) => matchesCriteria(v, criteria, arsRate));
  return Object.fromEntries(
    FILTER_PILLS.map((p) => [p.id, matching.filter(p.test).length]),
  ) as Record<PillId, number>;
}
