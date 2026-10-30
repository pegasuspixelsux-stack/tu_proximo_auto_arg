// DRAFT: this text must be reviewed by a lawyer before launch.
import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { LegalSection, Todo } from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Soporte y contacto",
  description:
    "Contactá a Tu Próximo Auto Argentina: cómo escribirnos, coordinar una visita o hacer una consulta sobre un auto usado, financiación, permuta y documentación.",
  alternates: { canonical: "/soporte" },
};

const FAQS = [
  {
    q: "¿Cómo consulto por un auto?",
    a: "Entrá al aviso y escribinos por WhatsApp o dejá tus datos en el formulario. Te respondemos a la brevedad.",
  },
  {
    q: "¿Cómo coordino una visita o una prueba de manejo?",
    a: "Atendemos con cita previa. Pedí tu turno por WhatsApp o desde el formulario de contacto de la página de inicio.",
  },
  {
    q: "¿Puedo financiar o entregar mi usado?",
    a: "Sí, trabajamos con financiación con tarjeta de crédito y aceptamos permutas. Los detalles están en las preguntas frecuentes de la página de inicio.",
  },
  {
    q: "¿Cómo pido que borren o corrijan mis datos?",
    a: "Escribinos al correo de contacto indicando tu nombre y teléfono. Más información en la política de privacidad.",
  },
];

export default function SoportePage() {
  return (
    <LegalPage
      path="/soporte"
      title="Soporte y contacto"
      intro="¿Tenés una duda sobre un auto, una visita o tus datos? Estas son las formas de comunicarte con nosotros."
    >
      <LegalSection title="Cómo contactarnos">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Correo electrónico: <Todo>email de contacto</Todo>
          </li>
          <li>
            Teléfono: <Todo>teléfono de contacto</Todo>
          </li>
          <li>
            WhatsApp: <Todo>número de WhatsApp</Todo>
          </li>
          <li>
            Horario de atención: <Todo>días y horarios</Todo>
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="Preguntas rápidas">
        <dl className="space-y-5">
          {FAQS.map((f) => (
            <div key={f.q}>
              <dt className="font-medium text-fg">{f.q}</dt>
              <dd className="mt-1">{f.a}</dd>
            </div>
          ))}
        </dl>
      </LegalSection>
      <LegalSection title="Más ayuda">
        <p>
          Mirá todas las{" "}
          <Link className="underline underline-offset-4" href="/#preguntas-frecuentes">preguntas frecuentes</Link>,
          explorá los{" "}
          <Link className="underline underline-offset-4" href="/autos">autos usados en venta</Link> o leé los{" "}
          <Link className="underline underline-offset-4" href="/terminos">términos y condiciones</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
