/** Argentina flag with a short label; "ARG" on small screens. */
export function Country({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 align-middle ${className}`}>
      <svg
        viewBox="0 0 18 12"
        className="h-2.5 w-[15px] rounded-[1px]"
        aria-hidden
      >
        <rect width="18" height="12" fill="#74ACDF" />
        <rect y="4" width="18" height="4" fill="#fff" />
        <circle cx="9" cy="6" r="1.4" fill="#F6B40E" />
      </svg>
      <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-fg lg:text-[9px]">
        <span className="sm:hidden">Arg</span>
        <span className="hidden sm:inline">Argentina</span>
      </span>
    </span>
  );
}

/**
 * The wordmark: "TU PRÓXIMO" followed by a boxed, highlighted "AUTO".
 * With `countryOnMobile` off, the country only shows from sm up (the header
 * places it in the right corner on mobile instead).
 */
export default function Logo({
  className = "",
  countryOnMobile = true,
}: {
  className?: string;
  countryOnMobile?: boolean;
}) {
  return (
    <span
      className={`whitespace-nowrap text-[21px] font-bold uppercase tracking-[-0.02em] lg:text-[23px] ${className}`}
    >
      Tu Próximo
      <span className="ml-[0.25em] bg-black px-1.5 py-0.5 text-brand [:root:not([data-theme=light])_&]:bg-white [:root:not([data-theme=light])_&]:text-black">
        Auto
      </span>
      <Country className={`ml-1.5 ${countryOnMobile ? "" : "max-sm:hidden"}`} />
    </span>
  );
}
