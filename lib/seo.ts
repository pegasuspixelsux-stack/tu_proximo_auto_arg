/** Canonical origin: the www host (the bare domain redirects here, see next.config.ts). */
export const SITE_URL = "https://www.tuproximoauto.online";

export const SITE_NAME = "Tu Próximo Auto";

export const SITE_DESCRIPTION =
  "Comprá autos usados certificados en Buenos Aires y Zona Norte (Tigre). Financiación con tarjeta, permutas, prueba de manejo y transferencia asistida.";

/** Absolute URL for a site path. */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path === "/" ? "" : path}`;

/**
 * Business facts for structured data. Only what the site already states is
 * filled in; everything else is left out until the owner provides it.
 * TODO(seo): street address, postal code, geo coordinates, opening hours,
 * social profile URLs (sameAs) and a real phone for Argentina.
 */
export const BUSINESS = {
  locality: "Tigre",
  region: "Buenos Aires",
  country: "AR",
  areaServed: [
    "Ciudad Autónoma de Buenos Aires",
    "Gran Buenos Aires: Zona Norte",
    "Gran Buenos Aires: Zona Oeste",
    "Gran Buenos Aires: Zona Sur",
    "Provincia de Buenos Aires",
  ],
  sameAs: [] as string[],
} as const;
