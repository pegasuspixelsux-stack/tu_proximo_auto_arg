import Link from "next/link";
import Logo, { Country } from "./Logo";
import MobileMenu from "./MobileMenu";
import { NAV_LINKS, NAV_RIGHT_LINKS } from "./navLinks";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <nav
        aria-label="Principal"
        className="relative mx-auto flex max-w-[1440px] items-center justify-between px-3 py-[11px] sm:py-6 lg:px-6"
      >
        <MobileMenu />
        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-medium uppercase tracking-widest text-muted transition-colors duration-150 hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link
          href="/"
          aria-label="Tu Próximo Auto, inicio"
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Logo countryOnMobile={false} />
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          {NAV_RIGHT_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-xs font-medium uppercase tracking-widest text-muted transition-colors duration-150 hover:text-fg ${link.wide ? "hidden lg:inline" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Country className="sm:hidden" />
      </nav>
    </header>
  );
}
