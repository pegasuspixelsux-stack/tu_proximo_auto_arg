import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import { DEALERSHIPS, vehiclesByDealer } from "../data/vehicles";

export const metadata: Metadata = {
  title: "Concesionarias | Tu Próximo Auto - Argentina",
  description:
    "Concesionarias verificadas que publican y gestionan su inventario en AUTO SELECT.",
};

export default function ConcesionariasPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-screen w-full max-w-[1440px] bg-bg px-3 py-16 text-fg lg:px-6">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">
          Directorio
        </p>
        <h1 className="mt-2 text-balance text-3xl font-light tracking-[-0.02em] lg:text-5xl">
          Concesionarias
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Concesionarias verificadas que publican su inventario directamente en
          AUTO SELECT.
        </p>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEALERSHIPS.map((dealer) => {
            const count = vehiclesByDealer(dealer.id).length;
            return (
              <li key={dealer.id}>
                <Link
                  href={`/concesionarias/${dealer.slug}`}
                  data-testid={`dealer-${dealer.slug}`}
                  className="group block h-full rounded-xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] transition-[transform,box-shadow,border-color] duration-300 ease-out [:root:not([data-theme=light])_&]:hover:border-brand/50 [:root:not([data-theme=light])_&]:hover:shadow-[0_0_36px_-6px_rgba(255,234,0,0.45)] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-fg/60"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-medium tracking-tight">
                      {dealer.name}
                    </h2>
                    {dealer.verified && (
                      <BadgeCheck
                        className="h-5 w-5 shrink-0 text-muted"
                        strokeWidth={1.75}
                        aria-label="Verificada"
                      />
                    )}
                  </div>
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                    {dealer.location}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
                    <span className="text-muted">
                      {count} {count === 1 ? "vehículo" : "vehículos"}
                    </span>
                    {dealer.rating && (
                      <span className="inline-flex items-center gap-1 tabular-nums text-muted">
                        <Star className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                        {dealer.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <div className="mx-auto w-full max-w-[1440px]">
        <Footer />
      </div>
    </>
  );
}
