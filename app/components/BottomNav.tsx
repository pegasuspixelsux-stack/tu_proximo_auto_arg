"use client";

import { Car, CreditCard, Home, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Inicio", href: "/", icon: Home },
  { label: "Autos", href: "/autos", icon: Car },
  { label: "Financiar", href: "/#financiacion", icon: CreditCard },
  { label: "Contacto", href: "/#contacto", icon: MessageCircle },
];

/** Mobile-only sticky bottom bar linking to the main pages. Hidden in the dashboard and login. */
export default function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login"))
    return null;

  return (
    <nav
      aria-label="Navegación inferior"
      data-testid="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-150 lg:hidden"
    >
      <ul className="flex snap-x overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ITEMS.map(({ label, href, icon: Icon }) => {
          // Only page links can be "current"; the anchors live on the home page.
          const active = !href.includes("#") && pathname === href;
          return (
            <li key={label} className="min-w-0 flex-1 snap-start">
              <Link
                href={href}
                onClick={(e) => {
                  // Same-page section links: set the hash and fire "hashchange" so the
                  // collapsed section opens (and scrolls) even if the hash didn't change.
                  const hash = href.includes("#") ? `#${href.split("#")[1]}` : "";
                  if (hash && pathname === "/" && document.querySelector(hash)) {
                    e.preventDefault();
                    window.history.replaceState(null, "", `/${hash}`);
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                  }
                }}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-2 text-[10px] font-medium transition-colors duration-150 active:scale-95 ${
                  active ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
