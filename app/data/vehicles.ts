export type FuelType = "Electric" | "Gasoline" | "Hybrid" | "Diesel";
export type BodyType = "Auto" | "SUV" | "Deportivo" | "Clásico" | "Moto";

export type SellerType = "private" | "dealer";

export interface Dealership {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  /** Display location; built from address, city and province when edited in the dashboard. */
  location: string;
  address?: string;
  city?: string;
  province?: string;
  email?: string;
  /** Inactive dealerships are hidden from the public site. Missing means active. */
  active?: boolean;
  verified: boolean;
  /** Digits only, with country code, so it can be used in a wa.me link. */
  phone: string;
  rating?: number;
}

/** Listing price in USD, converting ARS listings with the given rate (for filters and sorting). */
export const priceInUsd = (
  v: Pick<Vehicle, "price" | "priceCurrency">,
  arsRate: number,
) => (v.priceCurrency === "ARS" && arsRate > 0 ? v.price / arsRate : v.price);

/** Reference number shown on the listing: the saved one, or the padded legacy id. */
export const vehicleReference = (v: Pick<Vehicle, "id" | "reference">) =>
  v.reference || v.id.padStart(4, "0");

export interface Vehicle {
  id: string;
  /** Human-friendly reference number (e.g. "0012"), unique per listing. */
  reference?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  /** Currency `price` was listed in; missing means USD. */
  priceCurrency?: "USD" | "ARS";
  /** In miles; the UI converts to km. */
  mileage: number;
  transmission: string;
  fuelType: FuelType;
  bodyType: BodyType;
  /** Featured photo: used on cards and as the first slide on the detail page. */
  image: string;
  /** Every photo of the listing (includes `image`); older listings only have `image`. */
  images?: string[];
  color?: string;
  /** Extra technical-sheet rows, label → value. */
  specs?: Record<string, string>;
  location: string;
  sellerType: SellerType;
  /** Set when sellerType === "dealer". */
  dealership?: Dealership;
  /** WhatsApp number (digits only) for private sellers. */
  sellerPhone?: string;
  /** ISO date the listing was published. */
  createdAt: string;
  badge?: string;
  /** Free-text description shown on the detail page. */
  description?: string;
  /** Equipment ids from COMMON_CAR_FEATURES. */
  features?: string[];
  /** Show on the homepage catalog (capped at HOMEPAGE_LIMIT, newest first). Shown unless set to false. */
  homepage?: boolean;
}

export const HOMEPAGE_LIMIT = 12;

const KM_PER_MILE = 1.60934;

/**
 * Mileage in km for display. It is stored in miles, so a plain conversion turns
 * 127.000 km into 126.999; rounding to the nearest 10 km hides that artifact.
 */
export const mileageKm = (miles: number) =>
  Math.round((miles * KM_PER_MILE) / 10) * 10;
