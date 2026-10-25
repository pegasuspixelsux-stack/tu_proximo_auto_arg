"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NAV_LINKS, NAV_RIGHT_LINKS } from "./navLinks";

const ALL_LINKS = [...NAV_LINKS, ...NAV_RIGHT_LINKS];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-menu"
        data-testid="mobile-menu-toggle"
        onClick={() => setOpen(true)}
        className="rounded-md p-1 text-fg/90 transition-[transform,color] duration-150 ease-out hover:text-fg active:scale-95"
      >
        <Menu className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {open &&
        createPortal(
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            className="fixed inset-0 z-50"
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-bg">
              <div className="flex items-center justify-between px-5 py-5">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Menú
                </span>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 hover:text-fg"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
              <nav
                aria-label="Menú móvil"
                className="flex-1 overflow-y-auto px-3 pb-8"
              >
                <ul className="space-y-1">
                  {ALL_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-3 py-3.5 text-lg font-light tracking-tight text-fg transition-colors duration-150 hover:bg-surface"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
