import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Bike,
  Building2,
  Calendar,
  CalendarCheck,
  Car,
  Check,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  Palette,
  Settings2,
  Zap,
} from "lucide-react";
import Footer from "../../components/Footer";
import SiteHeader from "../../components/SiteHeader";
import WhatsAppLeadButton from "../../components/WhatsAppLeadButton";
import VehicleCard from "../../components/VehicleCard";
import VehicleSlideshow from "../../components/VehicleSlideshow";
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
const usd2 = new Intl.NumberFormat("es-UY", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const number = new Intl.NumberFormat("es-UY");

const DOWN_PAYMENT_RATE = 0.6;
const MONTHLY_RATE = 0.07;
const TERM_MONTHS = 12;

/** Amortized monthly payment, or null when the price is missing or invalid. */
function estimateMonthlyPayment(price: number): number | null {
  if (!Number.isFinite(price) || price <= 0) return null;
  const principal = price * (1 - DOWN_PAYMENT_RATE);
  const growth = (1 + MONTHLY_RATE) ** TERM_MONTHS;
  return (principal * MONTHLY_RATE * growth) / (growth - 1);
}
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

// `params` is request-time data, so the page awaits it behind a Suspense
// boundary; the fallback is what an instant navigation shows meanwhile.
export default function VehiclePage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <main
          aria-busy="true"
          className="mx-auto min-h-screen w-full max-w-[1440px] bg-bg"
        />
      }
    >
      <VehicleDetail params={params} />
    </Suspense>
  );
}

async function VehicleDetail({ params }: Props) {
  const vehicle = await getVehicle((await params).id);
  if (!vehicle) notFound();

  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const { whatsappNumber } = await getSiteSettings();
  const whatsappMessage = `Hola, me interesa el ${title} publicado en Tu Próximo Auto.`;
  const monthlyPayment = estimateMonthlyPayment(vehicle.price);
  const testDriveMessage = `Hola, quisiera agendar una prueba de manejo del ${title} publicado en Tu Próximo Auto.`;

  // Shown when the listing has no description of its own.
  const fallbackDescription = `${title} ${FUEL_LABELS[vehicle.fuelType].toLowerCase()} con transmisión ${vehicle.transmission.toLowerCase()} y ${number.format(Math.round(vehicle.mileage * KM_PER_MILE))} km, disponible en ${vehicle.location}. Es una unidad lista para conocer en persona: podés verla, hacer una prueba de manejo y revisar toda la documentación antes de decidir. Contamos con opciones de financiamiento para que puedas concretar la compra de forma simple y segura, con un anticipo del 60% y el resto en cuotas. Escribinos por WhatsApp para consultar disponibilidad, pedir más fotos o coordinar una visita; te respondemos a la brevedad y te acompañamos en cada paso del proceso.`;

  const highlights = [
    {
      icon: vehicle.fuelType === "Electric" ? Zap : Fuel,
      label: "Combustible",
      value: FUEL_LABELS[vehicle.fuelType],
    },
    {
      icon: Gauge,
      label: vehicle.color ? "Kilometraje y color" : "Kilometraje",
      value: [
        `${number.format(Math.round(vehicle.mileage * KM_PER_MILE))} km`,
        vehicle.color,
      ]
        .filter(Boolean)
        .join(" · "),
    },
    {
      icon: vehicle.bodyType === "Moto" ? Bike : Car,
      label: "Carrocería",
      value: vehicle.bodyType,
    },
  ];

  const specs = [
    { icon: Calendar, label: "Año", value: String(vehicle.year) },
    {
      icon: Gauge,
      label: "Kilometraje",
      value: `${number.format(Math.round(vehicle.mileage * KM_PER_MILE))} km`,
    },
    { icon: Fuel, label: "Combustible", value: FUEL_LABELS[vehicle.fuelType] },
    { icon: Settings2, label: "Transmisión", value: vehicle.transmission },
    ...(vehicle.color
      ? [{ icon: Palette, label: "Color", value: vehicle.color }]
      : []),
    { icon: MapPin, label: "Ubicación", value: vehicle.location },
    ...Object.entries(vehicle.specs ?? {}).map(([label, value]) => ({
      icon: Settings2,
      label,
      value,
    })),
  ];

  // Featured photo first, then the rest; older listings only have `image`.
  const photos = [
    vehicle.image,
    ...(vehicle.images ?? []).filter((src) => src !== vehicle.image),
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
          <div className="flex flex-col gap-6">
            <VehicleSlideshow
              images={photos}
              alt={title}
              badge={vehicle.badge}
            />
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
            {monthlyPayment !== null && (
              <div data-testid="vehicle-monthly-payment" className="mt-2">
                <p className="text-sm font-medium tabular-nums">
                  Estimado: {usd2.format(monthlyPayment)}/mes
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Valor estimado con 60% de anticipo y 12 cuotas al 7% de
                  interés mensual.
                </p>
              </div>
            )}

            <hr className="mt-6 border-line" />
            <ul
              data-testid="vehicle-highlights"
              className="grid grid-cols-3 gap-2 py-5 text-center"
            >
              {highlights.map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex flex-col items-center gap-1.5">
                  <Icon
                    className="h-5 w-5 text-muted"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <span className="sr-only">{label}: </span>
                  <span className="text-sm font-medium">{value}</span>
                </li>
              ))}
            </ul>
            <hr className="border-line" />

            <p className="mt-4 text-xs text-subtle">
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
              <p className="mt-2 flex items-center gap-2 text-lg font-medium tracking-tight">
                <Building2
                  className="h-4 w-4 shrink-0 text-muted"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Tu Próximo Auto
                <BadgeCheck
                  className="h-4 w-4 shrink-0 text-muted"
                  strokeWidth={1.75}
                  aria-label="Verificada"
                />
              </p>
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
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-[background-color,transform] duration-150 hover:bg-emerald-800 active:scale-[0.98]"
                >
                  <MessageCircle
                    className="h-4 w-4"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  Contactar por WhatsApp
                </WhatsAppLeadButton>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(testDriveMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="vehicle-test-drive"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-fg bg-transparent px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg transition-[background-color,transform] duration-150 hover:bg-fg/5 focus-visible:bg-fg/5 active:scale-[0.98]"
                >
                  <CalendarCheck
                    className="h-4 w-4"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  Agendar una prueba de manejo
                </a>
              )}
            </section>
          </div>

          <section aria-labelledby="description-heading">
            <h2
              id="description-heading"
              className="text-2xl font-light tracking-[-0.02em] lg:text-3xl"
            >
              Descripción
            </h2>
            <p
              data-testid="vehicle-description"
              className="mt-4 whitespace-pre-line text-pretty leading-relaxed text-muted"
            >
              {vehicle.description || fallbackDescription}
            </p>
          </section>

          <section aria-labelledby="specs-heading">
            <h2
              id="specs-heading"
              className="text-2xl font-light tracking-[-0.02em] lg:text-3xl"
            >
              Ficha técnica
            </h2>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
        </div>

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
