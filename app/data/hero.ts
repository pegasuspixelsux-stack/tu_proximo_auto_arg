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
