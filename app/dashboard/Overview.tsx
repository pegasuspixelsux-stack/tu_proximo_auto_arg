import {
  CarFront,
  CheckCircle2,
  Clock,
  Layers,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import LatestLeads from "./LatestLeads";
import VehiclesSection from "./VehiclesSection";
import type { Dealership, Vehicle } from "../data/vehicles";

interface Kpi {
  label: string;
  value: string;
  trend: string;
  /** Whether the change is good news. */
  good: boolean;
  up: boolean;
  icon: LucideIcon;
}

const KPIS: Kpi[] = [
  {
    label: "Tiempo promedio en stock",
    value: "24 días",
    trend: "−3 días vs. mes anterior",
    good: true,
    up: false,
    icon: Clock,
  },
  {
    label: "Vehículos ingresados (último mes)",
    value: "18",
    trend: "+4 vs. mes anterior",
    good: true,
    up: true,
    icon: CarFront,
  },
  {
    label: "Vehículos vendidos (último mes)",
    value: "12",
    trend: "+2 vs. mes anterior",
    good: true,
    up: true,
    icon: CheckCircle2,
  },
  {
    label: "Total inventario activo",
    value: "45",
    trend: "+6 vs. mes anterior",
    good: true,
    up: true,
    icon: Layers,
  },
];

export default function Overview({
  vehicles,
  dealerships,
}: {
  vehicles: Vehicle[];
  dealerships: Dealership[];
}) {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
            Panel de Control
          </h1>
          <p className="mt-2 text-sm text-muted">
            Métricas internas y actividad reciente de la plataforma
          </p>
        </div>
      </header>

      <section
        aria-label="Indicadores"
        className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {KPIS.map((kpi) => {
          const Trend = kpi.up ? TrendingUp : TrendingDown;
          return (
            <div
              key={kpi.label}
              data-testid="kpi-card"
              className="rounded-xl border border-line bg-surface p-5 shadow-[var(--card-shadow)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-widest text-muted">
                  {kpi.label}
                </p>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-fg">
                  <kpi.icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold tabular-nums tracking-[-0.02em]">
                {kpi.value}
              </p>
              <p
                className={`mt-2 inline-flex items-center gap-1.5 text-xs ${
                  kpi.good ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <Trend className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {kpi.trend}
              </p>
            </div>
          );
        })}
      </section>

      <LatestLeads />

      <VehiclesSection
        vehicles={vehicles}
        dealerships={dealerships}
        limit={6}
        title="Últimos 6 Vehículos Publicados"
      />
    </main>
  );
}
