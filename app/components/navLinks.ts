export interface NavLink {
  label: string;
  href: string;
  /** Only shown inline in the desktop bar from the lg breakpoint. */
  wide?: boolean;
}

/** Left side of the top nav. */
export const NAV_LINKS: NavLink[] = [
  { label: "Compra tu auto", href: "/#inventory" },
  { label: "Vende tu auto", href: "/#financiacion" },
];

/** Right side of the top nav. */
export const NAV_RIGHT_LINKS: NavLink[] = [
  { label: "Financiación", href: "/#financiacion", wide: true },
  { label: "Contacto", href: "/#contacto", wide: true },
];
