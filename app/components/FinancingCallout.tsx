import { ArrowRight, MessageCircle } from "lucide-react";
import Image from "next/image";
import WhatsAppLeadButton from "./WhatsAppLeadButton";

const WHATSAPP_MESSAGE =
  "Hola, quiero consultar por el financiamiento de un vehículo en AutoSelect.";

/**
 * Black financing callout shown under the catalog. Pass `imageSrc` to fill the
 * right-hand image slot; without it a gradient placeholder is rendered.
 */
export default function FinancingCallout({
  whatsappNumber,
  imageSrc,
}: {
  whatsappNumber: string;
  imageSrc?: string;
}) {
  return (
    <section
      aria-labelledby="financing-callout-heading"
      data-testid="financing-callout"
      className="px-3 py-6 lg:px-6"
    >
      <div className="grid overflow-hidden rounded-3xl bg-black text-white md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 p-8 md:p-12 lg:p-16">
          <h2
            id="financing-callout-heading"
            className="text-balance text-3xl font-semibold tracking-[-0.02em] lg:text-5xl"
          >
            Financiá tu próximo auto
          </h2>
          <p className="max-w-md text-pretty leading-relaxed text-white/70">
            Elegí un anticipo, repartí el saldo en cuotas y manejá el auto que
            querés hoy. Te asesoramos para encontrar la opción que mejor se
            adapte a tu presupuesto.
          </p>
          <a
            href="#financiacion"
            data-testid="financing-callout-cta"
            className="group inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition-[background-color,transform] duration-150 hover:bg-white/85 active:scale-[0.98]"
          >
            Ver opciones de financiación
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              strokeWidth={1.75}
              aria-hidden
            />
          </a>
        </div>

        <div className="relative min-h-72 md:min-h-full">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          ) : (
            <div
              aria-hidden
              data-testid="financing-callout-placeholder"
              className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black"
            />
          )}
          {/* Fade the image into the black panel (left on desktop, top on mobile). */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-b from-black via-black/30 to-black/60 md:bg-gradient-to-r md:from-black md:via-black/30 md:to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 flex p-6 md:p-8">
            <WhatsAppLeadButton
              targetPhone={whatsappNumber}
              message={WHATSAPP_MESSAGE}
              sourceItem="Financiamiento"
              testId="financing-callout-contact"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white underline-offset-4 transition-colors duration-150 hover:text-white/70 hover:underline"
            >
              <MessageCircle
                className="h-4 w-4"
                strokeWidth={1.75}
                aria-hidden
              />
              Consultar por financiamiento
            </WhatsAppLeadButton>
          </div>
        </div>
      </div>
    </section>
  );
}
