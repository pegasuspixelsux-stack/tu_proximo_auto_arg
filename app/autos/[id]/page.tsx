import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Settings2,
  UserRound,
} from "lucide-react";
import Footer from "../../components/Footer";
import SiteHeader from "../../components/SiteHeader";
import WhatsAppLeadButton from "../../components/WhatsAppLeadButton";
import VehicleCard from "../../components/VehicleCard";
import { CAR_FEATURE_LABEL } from "../../data/car-features";
import { getSiteSettings } from "../../data/site-store";
import { getVehicle, getVehicles } from "../../data/vehicle-store";
import type { Vehicle } from "../../data/vehicles";

type Props = { params: Promise<{ id: string }> };

const usd = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("es-UY");
const date = new Intl.DateTimeFormat("es-UY", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const KM_PER_MILE = 1.60934;
const FUEL_LABELS: Record<Vehicle["fuelType"], string> = {
  Electric: "Eléctrico",
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Diesel: "Diésel",
};

export async function generateStaticParams() {
  return (await getVehicles()).map((v) => ({ id: v.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) return {};
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  return {
    title: `${title} | Tu Próximo Auto - Argentina`,
    description: `${title} en ${vehicle.location}. ${usd.format(vehicle.price)}.`,
  };
}

export default async function VehiclePage({ params }: Props) {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) notFound();

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const dealer =
    vehicle.sellerType === "dealer" ? vehicle.dealership : undefined;
  const { whatsappNumber } = await getSiteSettings();
  const whatsappMessage = `Hola, me interesa el ${title} publicado en AUTO SELECT.`;

  const specs = [
    { icon: Calendar, label: "Año", value: String(vehicle.year) },
    {
      icon: Gauge,
      label: "Kilometraje",
      value: `${number.format(Math.round(vehicle.mileage * KM_PER_MILE))} km`,
    },
    { icon: Fuel, label: "Combustible", value: FUEL_LABELS[vehicle.fuelType] },
    { icon: Settings2, label: "Transmisión", value: vehicle.transmission },
    { icon: MapPin, label: "Ubicación", value: vehicle.location },
  ];

  const all = await getVehicles();
  const related = all.filter(
    (v) => v.id !== vehicle.id && v.fuelType === vehicle.fuelType,
  )
    .concat(all.filter((v) => v.fuelType !== vehicle.fuelType))
    .filter((v) => v.id !== vehicle.id)
    .slice(0, 12);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto min-h-screen w-full max-w-[1440px] bg-bg px-3 pb-16 pt-6 text-fg lg:px-6">
        <Link
          href="/#inventory"
          className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted transition-colors duration-150 hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Volver al mercado
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-900 lg:aspect-[16/11]">
            <Image
              src={vehicle.image}
              alt={title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
            {vehicle.badge && (
              <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                {vehicle.badge}
              </span>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {vehicle.year} · {FUEL_LABELS[vehicle.fuelType]}
            </p>
            <h1
              data-testid="vehicle-title"
              className="mt-2 text-balance text-3xl font-semibold tracking-[-0.02em] lg:text-5xl"
            >
              {vehicle.make} {vehicle.model}
            </h1>
            <p
              data-testid="vehicle-price"
              className="mt-4 text-3xl font-light tabular-nums tracking-tight"
            >
              {usd.format(vehicle.price)}
            </p>
            <p className="mt-2 text-xs text-subtle">
              <span data-testid="vehicle-id">
                ID del aviso: {vehicle.id.padStart(4, "0")}
              </span>
              {" · "}
              Publicado el{" "}
              {date.format(new Date(`${vehicle.createdAt}T12:00:00`))}
            </p>

            <section
              aria-label="Vendedor"
              data-testid="seller-card"
              className="mt-8 rounded-xl border border-line bg-surface p-5 shadow-[var(--card-shadow)]"
            >
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted">
                Vendedor
              </p>
              {dealer ? (
                <Link
                  href={`/concesionarias/${dealer.slug}`}
                  className="mt-2 flex items-center gap-2 text-lg font-medium tracking-tight hover:underline hover:underline-offset-4"
                >
                  <Building2
                    className="h-4 w-4 shrink-0 text-muted"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {dealer.name}
                  {dealer.verified && (
                    <BadgeCheck
                      className="h-4 w-4 shrink-0 text-muted"
                      strokeWidth={1.75}
                      aria-label="Verificada"
                    />
                  )}
                </Link>
              ) : (
                <p className="mt-2 flex items-center gap-2 text-lg font-medium tracking-tight">
                  <UserRound
                    className="h-4 w-4 shrink-0 text-muted"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  Vendedor particular
                </p>
              )}
              <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin
                  className="h-3.5 w-3.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
                {vehicle.location}
              </p>

              {whatsappNumber && (
                <WhatsAppLeadButton
                  targetPhone={whatsappNumber}
                  message={whatsappMessage}
                  sourceItem={title}
                  testId="vehicle-contact"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98]"
                >
                  <MessageCircle
                    className="h-4 w-4"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  Contactar por WhatsApp
                </WhatsAppLeadButton>
              )}
            </section>
          </div>
        </div>

        <section aria-labelledby="specs-heading" className="mt-12">
          <h2
            id="specs-heading"
            className="text-2xl font-light tracking-[-0.02em] lg:text-3xl"
          >
            Ficha técnica
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {specs.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <Icon
                  className="h-4 w-4 text-muted"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <dt className="mt-3 text-[10px] font-medium uppercase tracking-widest text-muted">
                  {label}
                </dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {vehicle.description && (
          <section aria-labelledby="description-heading" className="mt-12">
            <h2
              id="description-heading"
              className="text-2xl font-light tracking-[-0.02em] lg:text-3xl"
            >
              Descripción
            </h2>
            <p
              data-testid="vehicle-description"
              className="mt-6 max-w-3xl whitespace-pre-line text-pretty leading-relaxed text-muted"
            >
              {vehicle.description}
            </p>
          </section>
        )}

        {vehicle.features && vehicle.features.length > 0 && (
          <section aria-labelledby="features-heading" className="mt-12">
            <h2
              id="features-heading"
              className="text-2xl font-light tracking-[-0.02em] lg:text-3xl"
            >
              Equipamiento
            </h2>
            <ul
              data-testid="vehicle-features"
              className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {vehicle.features.map((id) => (
                <li key={id} className="flex items-center gap-2 text-sm">
                  <Check
                    className="h-4 w-4 shrink-0 text-muted"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  {CAR_FEATURE_LABEL[id] ?? id}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="related-heading" className="mt-16">
          <h2
            id="related-heading"
            className="text-2xl font-light tracking-[-0.02em] lg:text-3xl"
          >
            Otros avisos
          </h2>
          <ul
            tabIndex={0}
            aria-label="Otros avisos, desplazá horizontalmente"
            data-testid="related-scroller"
            className="-mx-3 mt-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-3 px-3 pb-8 pt-4 [scrollbar-width:thin] lg:-mx-6 lg:scroll-px-6 lg:px-6"
          >
            {related.map((v) => (
              <li
                key={v.id}
                className="flex w-[189px] shrink-0 snap-start sm:w-[214px]"
              >
                <VehicleCard vehicle={v} compact />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <div className="mx-auto w-full max-w-[1440px]">
        <Footer />
      </div>
    </>
  );
}
