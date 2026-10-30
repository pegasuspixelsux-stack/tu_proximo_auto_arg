import { MessageCircle, Phone } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "./Logo";
import { NAV_LINKS, NAV_RIGHT_LINKS } from "./navLinks";
import ThemeToggle from "./ThemeToggle";
import { formatPhone } from "../data/site";
import { getSiteSettings } from "../data/site-store";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Navegación",
    // Same links as the top nav.
    links: [
      ...NAV_LINKS,
      ...NAV_RIGHT_LINKS,
      { label: "Autos usados en venta", href: "/autos" },
      { label: "Concesionarias de Buenos Aires", href: "/concesionarias" },
    ],
  },
  {
    title: "Legales & Ayuda",
    links: [
      { label: "Términos y Condiciones", href: "/terminos" },
      { label: "Política de Privacidad", href: "/privacidad" },
      { label: "Preguntas Frecuentes", href: "/#preguntas-frecuentes" },
      { label: "Soporte", href: "#" },
    ],
  },
];

/** Brand icons are drawn inline: this lucide-react version has none. */
function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <SocialIcon>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <path d="M17.5 6.5h.01" />
      </SocialIcon>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <SocialIcon>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </SocialIcon>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <SocialIcon>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </SocialIcon>
    ),
  },
];

const LEGAL_LINKS = [
  { label: "Política de cookies", href: "/cookies" },
  { label: "Protección de datos personales", href: "/privacidad" },
  { label: "Admin", href: "/login" },
];

const LINK = "text-sm text-muted transition-colors duration-150 hover:text-fg";
const HEADING = "text-xs font-semibold uppercase tracking-widest text-fg";

export default async function Footer() {
  const { whatsappNumber } = await getSiteSettings();
  const phoneLabel = formatPhone(whatsappNumber);
  return (
    <footer data-testid="footer" className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1440px] px-3 py-16 lg:px-6">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              Plataforma de venta de autos usados certificados, con salón de ventas
              en Tigre, Zona Norte. Visitanos, probá la unidad y llevátela con
              tranquilidad.
            </p>
            {/* TODO(seo): add the street address once the owner provides it. */}
            <address className="mt-4 text-sm not-italic leading-relaxed text-muted">
              Tu Próximo Auto
              <br />
              Salón de ventas en Tigre, Zona Norte, Buenos Aires
              <br />
              Atención con cita previa
            </address>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className={HEADING}>{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={LINK}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div data-testid="footer-contact">
            <h2 className={HEADING}>Contacto &amp; Redes</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${LINK} inline-flex items-center gap-2`}
                >
                  <MessageCircle
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  WhatsApp {phoneLabel}
                </a>
              </li>
              <li>
                <a
                  href={`tel:+${whatsappNumber}`}
                  data-testid="footer-phone"
                  className={`${LINK} inline-flex items-center gap-2`}
                >
                  <Phone
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  Llamar {phoneLabel}
                </a>
              </li>
            </ul>
            <ul className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-[color,border-color,transform] duration-150 hover:border-fg/40 hover:text-fg active:scale-95"
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          data-testid="disclaimer"
          className="mt-16 border-t border-line pt-8 text-xs leading-relaxed text-subtle"
        >
          <p>
            Tu Próximo Auto es una plataforma de publicidad. Nuestra única función
            es publicar los avisos de la concesionaria. No somos parte de la
            compraventa, no intervenimos en la negociación, el pago, la entrega
            ni la transferencia de los vehículos, y no actuamos como
            vendedores, intermediarios ni garantes. Los vehículos, la
            información, las fotos y los precios publicados son de exclusiva
            responsabilidad de la concesionaria. Tu Próximo Auto no garantiza su
            exactitud ni su actualización, y no asume responsabilidad por el
            estado, la titularidad, la documentación, el kilometraje, las
            condiciones de venta ni cualquier otro aspecto de los vehículos
            publicados, ni por los daños o perjuicios que puedan derivarse de una
            operación. Es derecho y deber del comprador verificar por su cuenta
            toda la información, inspeccionar el vehículo, revisar su
            documentación y sus antecedentes, y completar la transacción de
            manera legal y honesta, directamente con la concesionaria. Cualquier
            reclamo debe dirigirse a la concesionaria.
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <nav
            aria-label="Legal"
            data-testid="legal-links"
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs"
          >
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-subtle transition-colors duration-150 hover:text-fg"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:justify-end">
            <p className="text-xs text-subtle">
              © 2026 Tu Próximo Auto. Todos los derechos reservados.
            </p>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
