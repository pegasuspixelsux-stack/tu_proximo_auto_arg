import HeroSearch from "./HeroSearch";
import type { Vehicle } from "../data/vehicles";
import VehicleCard from "./VehicleCard";

export default function NewListings({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <section
      id="new-listings"
      data-testid="new-listings"
      aria-labelledby="new-listings-heading"
      className="scroll-mt-4 pb-10 pt-5 lg:pb-14"
    >
      <HeroSearch />
      <div className="mx-auto mt-10 max-w-[1440px] px-3 lg:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="new-listings-heading"
            className="text-balance text-3xl font-light tracking-[-0.02em] lg:text-4xl"
          >
            Últimos ingresos
          </h2>
          <a
            href="/autos"
            data-testid="see-all-inventory"
            className="shrink-0 text-xs text-muted underline-offset-4 transition-colors duration-150 hover:text-fg hover:underline"
          >
            Ver todo el inventario →
          </a>
        </div>
      </div>

      <ul
        tabIndex={0}
        aria-label="Últimos autos ingresados, desplazá horizontalmente"
        className="mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-0 px-0 pb-8 pt-4 [scrollbar-width:thin] lg:scroll-px-6 lg:px-6"
      >
        {vehicles.map((vehicle) => (
          <li
            key={vehicle.id}
            className="flex w-[189px] shrink-0 snap-start sm:w-[214px]"
          >
            <VehicleCard vehicle={vehicle} compact hideLocation />
          </li>
        ))}
      </ul>
    </section>
  );
}
