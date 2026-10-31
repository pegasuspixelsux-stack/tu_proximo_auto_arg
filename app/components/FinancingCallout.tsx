import { MessageCircle } from "lucide-react";
import Image from "next/image";
import WhatsAppLeadButton from "./WhatsAppLeadButton";

const WHATSAPP_MESSAGE =
  "Hola, quiero consultar por el financiamiento de un vehículo en Tu Próximo Auto.";

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
      id="financiar"
      data-testid="financing-callout"
      className="scroll-mt-4 px-3 py-6 lg:px-6"
    >
      {/* Mobile: a square box, image in the top half and text on black below; md+: two columns. */}
      <div className="relative grid aspect-square overflow-hidden rounded-3xl bg-black text-white md:aspect-auto md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center gap-4 p-6 pb-16 max-md:absolute max-md:inset-x-0 max-md:bottom-0 max-md:h-1/2 max-md:gap-2 max-md:p-5 max-md:pb-14 md:gap-6 md:p-12 lg:p-16">
          <h2
            id="financing-callout-heading"
            className="text-balance text-3xl font-semibold tracking-[-0.02em] max-md:text-2xl lg:text-5xl"
          >
            Financiá tu próximo auto
          </h2>
          <p className="max-w-md text-pretty leading-relaxed text-white/70 max-md:line-clamp-2 max-md:text-sm">
            Elegí un anticipo, repartí el saldo en cuotas y manejá el auto que
            querés hoy. Te asesoramos para encontrar la opción que mejor se
            adapte a tu presupuesto.
          </p>
        </div>

        <div className="absolute inset-0 md:relative md:min-h-full">
          {/* Mobile: the image only fills the top half. */}
          <div className="absolute inset-x-0 top-0 h-1/2 md:inset-0 md:h-full">
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
          </div>
          {/* Mobile: image fades to black at the top-half edge. md+: horizontal, solid black on the text side. */}
          <div
            aria-hidden
            data-testid="financing-callout-overlay"
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-black/20 to-black md:inset-0 md:h-auto md:bg-gradient-to-r md:from-black md:via-black/45 md:to-black/10"
          />
          <div className="absolute inset-x-0 bottom-0 z-10 flex p-6 md:p-8">
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
