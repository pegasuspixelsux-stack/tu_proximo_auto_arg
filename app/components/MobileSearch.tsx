"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AdvancedFields } from "./HeroSearch";

/** Mobile-only: a search icon in the top nav that opens a modal with the search bar and filters. */
export default function MobileSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
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
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Buscar autos"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="mobile-search-toggle"
        onClick={() => setOpen(true)}
        className="rounded-md p-1 text-fg/90 transition-[transform,color] duration-150 ease-out hover:text-fg active:scale-95"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar autos"
            className="fixed inset-0 z-50 flex items-start justify-center p-3"
          >
            <button
              type="button"
              tabIndex={-1}
              aria-label="Cerrar búsqueda"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            {/* Plain GET to /autos: the inventory page reads the query and pre-fills its filters. */}
            <form
              role="search"
              action="/autos"
              method="get"
              onSubmit={() => setOpen(false)}
              className="relative flex max-h-full w-full max-w-md flex-col rounded-2xl border border-line bg-bg shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 pb-2 pt-4">
                <span className="text-xs font-medium uppercase tracking-widest text-muted">
                  Buscar
                </span>
                <button
                  type="button"
                  aria-label="Cerrar búsqueda"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 hover:text-fg"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </button>
              </div>
              <div className="overflow-y-auto px-4 pb-2">
                <div className="flex items-center gap-3 rounded-full border border-line bg-surface py-2 pl-4 pr-4 focus-within:border-fg/40">
                  <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} />
                  <input
                    ref={inputRef}
                    type="search"
                    name="q"
                    aria-label="Buscar marca o modelo"
                    placeholder="Buscar marca o modelo"
                    className="w-full bg-transparent text-base text-fg outline-none placeholder:text-subtle"
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-left">
                  <AdvancedFields />
                </div>
              </div>
              <div className="p-4 pt-3">
                <button
                  type="submit"
                  className="w-full rounded-full bg-inverse py-3 text-sm font-medium text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98]"
                >
                  Buscar autos
                </button>
              </div>
            </form>
          </div>,
          document.body,
        )}
    </div>
  );
}
