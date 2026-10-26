import { getDealerships, getVehicles } from "../../data/vehicle-store";
import VehiclesSection from "../VehiclesSection";

// Behind AuthGuard (renders nothing until the session is confirmed), so this
// admin page can't be an instant navigation.
export const instant = false;

export default async function VehiculosPage() {
  const [vehicles, dealerships] = await Promise.all([
    getVehicles(),
    getDealerships(),
  ]);
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
          Listado de Vehículos
        </h1>
        <p className="mt-2 text-sm text-muted">
          Todos los vehículos publicados en el sitio
        </p>
      </header>
      <VehiclesSection
        vehicles={vehicles}
        dealerships={dealerships}
        title="Todos los Vehículos"
      />
    </main>
  );
}
