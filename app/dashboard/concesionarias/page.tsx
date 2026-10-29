import { getAllVehicles, getDealerships } from "../../data/vehicle-store";
import DealershipsManager from "../DealershipsManager";

// Behind AuthGuard (renders nothing until the session is confirmed), so this
// admin page can't be an instant navigation.
export const instant = false;

export default async function ConcesionariasPage() {
  const [dealerships, vehicles] = await Promise.all([
    getDealerships(),
    getAllVehicles(),
  ]);
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
          Concesionarias
        </h1>
        <p className="mt-2 text-sm text-muted">
          Las concesionarias que publican vehículos en el sitio
        </p>
      </header>
      <DealershipsManager dealerships={dealerships} vehicles={vehicles} />
    </main>
  );
}
