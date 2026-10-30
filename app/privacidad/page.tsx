// DRAFT: this text must be reviewed by a lawyer before launch.
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection, Todo } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Tu Próximo Auto Argentina trata tus datos personales: qué información recopilamos, para qué la usamos y cómo ejercer tus derechos según la Ley 25.326.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <LegalPage
      path="/privacidad"
      title="Política de privacidad"
      intro="Tu privacidad nos importa. Esta política explica qué datos personales recopilamos cuando usás el sitio, para qué los usamos y qué derechos tenés sobre ellos."
    >
      <LegalSection title="Responsable del tratamiento">
        <p>
          El responsable de la base de datos es <Todo>razón social</Todo>, CUIT <Todo>CUIT</Todo>, con
          domicilio en <Todo>domicilio legal</Todo>. Contacto para consultas sobre datos personales:{" "}
          <Todo>email de contacto</Todo>.
        </p>
      </LegalSection>
      <LegalSection title="Qué datos recopilamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-fg">Formularios de contacto y de cita:</strong> nombre, teléfono, el
            vehículo que te interesa, fecha y hora de la visita, medio de contacto preferido y los comentarios
            que escribas.
          </li>
          <li>
            <strong className="text-fg">Datos técnicos y de uso:</strong> información básica de navegación y
            estadísticas agregadas de visitas, si activamos herramientas de analítica (ver la{" "}
            <Link className="underline underline-offset-4" href="/cookies">política de cookies</Link>).
          </li>
        </ul>
        <p>No pedimos datos bancarios ni de tarjetas a través del sitio.</p>
      </LegalSection>
      <LegalSection title="Para qué usamos tus datos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Responder tu consulta y coordinar la visita o la prueba de manejo.</li>
          <li>Pasar tu contacto a la concesionaria del vehículo por el que consultaste.</li>
          <li>Mejorar el sitio y entender qué avisos y secciones se usan más.</li>
        </ul>
        <p>No vendemos tus datos. Solo los compartimos con la concesionaria involucrada y con proveedores que alojan o procesan la información para operar el sitio, como los servicios de infraestructura y base de datos.</p>
      </LegalSection>
      <LegalSection title="Tus derechos (Ley 25.326)">
        <p>
          Conforme a la Ley 25.326 de Protección de los Datos Personales, podés acceder a tus datos,
          rectificarlos, actualizarlos y solicitar su supresión. El acceso es gratuito a intervalos no
          inferiores a seis meses, salvo que acredites un interés legítimo.
        </p>
        <p>
          Para ejercer estos derechos escribinos a <Todo>email de contacto</Todo> indicando tu nombre y el
          teléfono con el que nos contactaste. La Agencia de Acceso a la Información Pública es el órgano de
          control de la Ley 25.326 y atiende denuncias y reclamos por incumplimientos en materia de datos
          personales.
        </p>
      </LegalSection>
      <LegalSection title="Conservación y seguridad">
        <p>
          Conservamos tus datos el tiempo necesario para atender tu consulta y cumplir obligaciones legales, y
          aplicamos medidas razonables para protegerlos. Ningún sistema es infalible, por lo que no podemos
          garantizar seguridad absoluta.
        </p>
      </LegalSection>
      <LegalSection title="Cambios en esta política">
        <p>Si la modificamos, publicaremos la versión actualizada en esta página.</p>
      </LegalSection>
    </LegalPage>
  );
}
