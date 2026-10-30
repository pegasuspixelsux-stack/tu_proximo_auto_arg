// DRAFT: this text must be reviewed by a lawyer before launch.
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection, Todo } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Política de cookies",
  description:
    "Qué cookies y almacenamiento local usa Tu Próximo Auto Argentina, para qué sirven y cómo desactivarlos desde tu navegador cuando quieras.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      path="/cookies"
      title="Política de cookies"
      intro="Las cookies son pequeños archivos que el navegador guarda cuando visitás un sitio. Acá te contamos qué usamos nosotros y cómo podés controlarlo."
    >
      <LegalSection title="Qué usamos hoy">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Preferencia de tema (claro u oscuro):</strong> se guarda en el
            almacenamiento local de tu navegador para recordar tu elección. No contiene datos personales ni se
            envía a terceros.
          </li>
          <li>
            <strong className="text-fg">Funcionamiento técnico del sitio:</strong> el servicio de alojamiento
            puede registrar datos técnicos básicos de cada visita (como la dirección IP y el navegador) para
            garantizar la seguridad y la entrega de las páginas.
          </li>
        </ul>
        <p>
          Hoy el sitio no usa cookies publicitarias ni de seguimiento entre sitios.
        </p>
      </LegalSection>
      <LegalSection title="Analítica">
        <p>
          Podemos incorporar herramientas de medición de visitas, como Google Analytics o Vercel Analytics, para
          entender cómo se usa el sitio y mejorarlo. Si se activan, esta página se actualizará con el detalle de
          las cookies y los datos que recolectan. Estado actual: <Todo>indicar si hay analítica activa</Todo>.
        </p>
      </LegalSection>
      <LegalSection title="Cómo desactivarlas">
        <p>
          Podés bloquear o borrar cookies y datos del sitio desde la configuración de tu navegador (Chrome,
          Safari, Firefox y Edge tienen una sección de privacidad para eso). Si las bloqueás, el sitio sigue
          funcionando, aunque puede olvidarse tu preferencia de tema.
        </p>
      </LegalSection>
      <LegalSection title="Más información">
        <p>
          Para saber cómo tratamos tus datos personales, leé la{" "}
          <Link className="underline underline-offset-4" href="/privacidad">política de privacidad</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
