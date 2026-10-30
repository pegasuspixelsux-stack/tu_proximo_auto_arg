import Link from "next/link";

/** Plain-text intro for search engines and readers: zones served and how buying works. */
export default function SeoIntro() {
  return (
    <section
      aria-labelledby="seo-intro-heading"
      className="mx-auto max-w-3xl px-3 py-12 lg:px-6 lg:py-16"
    >
      <h2
        id="seo-intro-heading"
        className="text-balance text-2xl font-semibold tracking-[-0.02em] lg:text-3xl"
      >
        Comprá tu auto usado en Tigre, Zona Norte y Buenos Aires
      </h2>
      <p className="mt-4 leading-relaxed text-muted">
        En Tu Próximo Auto Argentina encontrás autos usados en venta,
        seleccionados y verificados, con atención en nuestro salón de ventas de
        Tigre. Recibimos a clientes de Tigre, Nordelta, Don Torcuato, General
        Pacheco, San Fernando y Pilar, y de toda la Zona Norte, el Gran Buenos
        Aires, la Provincia de Buenos Aires y CABA.
      </p>
      <p className="mt-4 leading-relaxed text-muted">
        Cada unidad cuenta con VTV vigente y documentación al día, y nos
        ocupamos de la gestoría y la transferencia. Podés financiar con tarjeta
        de crédito, entregar tu usado como parte de pago (permuta) y probar el
        auto antes de decidir, coordinando una cita previa por WhatsApp.
      </p>
      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
        <Link href="/autos" className="underline underline-offset-4">
          Ver todos los autos usados en venta
        </Link>
        <Link href="/concesionarias" className="underline underline-offset-4">
          Conocé nuestra concesionaria en Tigre
        </Link>
      </p>
    </section>
  );
}
