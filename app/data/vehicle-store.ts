import { cacheTag } from "next/cache";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HOMEPAGE_LIMIT, type Dealership, type Vehicle } from "./vehicles";

export const VEHICLES_TAG = "vehicles";

type VehicleDoc = Vehicle & { order: number };

export async function getVehicles(): Promise<Vehicle[]> {
  "use cache";
  cacheTag(VEHICLES_TAG);
  const snap = await getDocs(collection(db, "vehicles"));
  return snap.docs
    .map((d) => d.data() as VehicleDoc)
    .sort((a, b) => a.order - b.order)
    .map((v) => {
      const vehicle: Partial<VehicleDoc> = { ...v };
      delete vehicle.order;
      return vehicle as Vehicle;
    });
}

export async function getDealerships(): Promise<Dealership[]> {
  "use cache";
  cacheTag(VEHICLES_TAG);
  const snap = await getDocs(collection(db, "dealerships"));
  return snap.docs
    .map((d) => d.data() as Dealership)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

export async function getHomepageVehicles(): Promise<Vehicle[]> {
  const vehicles = await getVehicles();
  return vehicles.filter((v) => v.homepage).slice(0, HOMEPAGE_LIMIT);
}

export async function getVehicle(id: string): Promise<Vehicle | undefined> {
  const vehicles = await getVehicles();
  return vehicles.find((v) => v.id === id);
}

export async function getDealership(
  slug: string,
): Promise<Dealership | undefined> {
  const dealerships = await getDealerships();
  return dealerships.find((d) => d.slug === slug);
}

export async function vehiclesByDealer(dealershipId: string): Promise<Vehicle[]> {
  const vehicles = await getVehicles();
  return vehicles.filter((v) => v.dealership?.id === dealershipId);
}
