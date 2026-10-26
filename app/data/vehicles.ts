export type FuelType = "Electric" | "Gasoline" | "Hybrid" | "Diesel";
export type BodyType = "Auto" | "SUV" | "Deportivo" | "Clásico" | "Moto";

export type SellerType = "private" | "dealer";

export interface Dealership {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  location: string;
  verified: boolean;
  /** Digits only, with country code, so it can be used in a wa.me link. */
  phone: string;
  rating?: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  /** In miles; the UI converts to km. */
  mileage: number;
  transmission: string;
  fuelType: FuelType;
  bodyType: BodyType;
  image: string;
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
  /** Show on the homepage catalog (capped at HOMEPAGE_LIMIT). Defaults to true for the first listings. */
  homepage?: boolean;
}

export const HOMEPAGE_LIMIT = 12;
