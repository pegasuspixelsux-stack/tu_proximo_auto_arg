import { FileCheck2, Handshake, KeyRound, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Wrench,
    title: "Inspección de 100 puntos",
    description:
      "Cada vehículo pasa por una revisión técnica y mecánica rigurosa antes de publicarse.",
  },
  {
    icon: Handshake,
    title: "Compra sin presión",
    description:
      "Tomate tu tiempo para ver, probar y decidir. Te asesoramos sin apuros ni insistencias.",
  },
  {
    icon: FileCheck2,
    title: "Documentación al día",
    description:
      "Verificamos la titularidad y los papeles de cada auto para una transferencia sin sorpresas.",
  },
  {
    icon: KeyRound,
    title: "Entrega inmediata",
    description:
      "Elegí tu auto, coordiná la visita y llevátelo sin demoras ni trámites innecesarios.",
  },
];

/** Four trust highlights shown above the financing callout on the home page. */
export default function TrustFeatures() {
  return (
    <section
      aria-label="Por qué comprar con nosotros"
      data-testid="trust-features"
      className="mt-4 lg:mt-6"
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="card-glow flex aspect-[3/2] flex-col sm:aspect-square rounded-2xl border border-line bg-surface p-6 shadow-[var(--card-shadow)] backdrop-blur-md motion-safe:hover:scale-[1.02] lg:p-8"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-line text-blue-500">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
