export interface HeroSlide {
  id: string;
  /** Local path under /public or an allowed remote URL. */
  image: string;
  eyebrow: string;
  /** Brand-colored lead-in of the heading. */
  highlight: string;
  heading: string;
  supportText: string;
  /** Social proof: rating, review count and the label after it. */
  rating: string;
  reviewCount: string;
  reviewLabel: string;
}

export const HERO_IMAGES = [
  { value: "/hero_image/audi_hero.webp", label: "Audi" },
  { value: "/hero_image/buyers.webp", label: "Compradores" },
];

export const MAX_HERO_SLIDES = 6;

export const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    image: "/hero_image/audi_hero.webp",
    eyebrow: "Autos usados certificados",
    highlight: "El auto que buscás.",
    heading: "La tranquilidad que te falta.",
    supportText:
      "Unidades seleccionadas y verificadas con atención personalizada en nuestro salón de ventas. Coordiná tu prueba de manejo hoy.",
    rating: "4.9",
    reviewCount: "+200",
    reviewLabel: "reseñas en Google",
  },
  {
    id: "slide-2",
    image: "/hero_image/buyers.webp",
    eyebrow: "Financiación a tu medida",
    highlight: "Estrená hoy.",
    heading: "Pagá a tu ritmo.",
    supportText:
      "Calculá tu cuota y financiá con los principales bancos. Te acompañamos en todo el proceso.",
    rating: "4.9",
    reviewCount: "+200",
    reviewLabel: "reseñas en Google",
  },
];

const FIELDS = [
  "id",
  "image",
  "eyebrow",
  "highlight",
  "heading",
  "supportText",
  "rating",
  "reviewCount",
  "reviewLabel",
] as const;

const IMAGEKIT_PREFIX = "https://ik.imagekit.io/";

/** Trims and validates slides before they are saved. */
export function sanitizeSlides(
  input: HeroSlide[],
): { ok: true; slides: HeroSlide[] } | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length === 0)
    return { ok: false, error: "Agregá al menos una diapositiva." };
  if (input.length > MAX_HERO_SLIDES)
    return { ok: false, error: `Máximo ${MAX_HERO_SLIDES} diapositivas.` };

  const slides: HeroSlide[] = [];
  for (const raw of input) {
    const s = {} as HeroSlide;
    for (const key of FIELDS) {
      const v = (raw as unknown as Record<string, unknown>)?.[key];
      s[key] = typeof v === "string" ? v.trim().slice(0, 400) : "";
    }
    if (!s.id) s.id = crypto.randomUUID();
    if (
      !s.image.startsWith("/") &&
      !s.image.startsWith("https://images.unsplash.com/") &&
      !s.image.startsWith(IMAGEKIT_PREFIX)
    )
      return {
        ok: false,
        error:
          "Subí una imagen o usá una ruta local (/hero_image/…) o una URL de Unsplash.",
      };
    if (!s.heading && !s.highlight)
      return { ok: false, error: "Cada diapositiva necesita un título." };
    slides.push(s);
  }
  return { ok: true, slides };
}
