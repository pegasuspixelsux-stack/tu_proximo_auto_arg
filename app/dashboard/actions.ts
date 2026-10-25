"use server";

import { updateTag } from "next/cache";
import { MAX_HERO_SLIDES, type HeroSlide } from "../data/hero";
import { HERO_TAG, writeHeroSlides } from "../data/hero-store";
import { cleanPhone, isValidPhone } from "../data/site";
import { SITE_TAG, writeSiteSettings } from "../data/site-store";

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

export async function saveHeroSlides(
  input: HeroSlide[],
): Promise<{ ok: boolean; error?: string }> {
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
    if (!s.image.startsWith("/") && !s.image.startsWith("https://images.unsplash.com/"))
      return {
        ok: false,
        error: "La imagen debe ser una ruta local (/hero_image/…) o una URL de images.unsplash.com.",
      };
    if (!s.heading && !s.highlight)
      return { ok: false, error: "Cada diapositiva necesita un título." };
    slides.push(s);
  }

  try {
    await writeHeroSlides(slides);
  } catch {
    return { ok: false, error: "No se pudo guardar en el servidor." };
  }
  updateTag(HERO_TAG);
  return { ok: true };
}

export async function saveWhatsapp(
  raw: string,
): Promise<{ ok: boolean; error?: string; number?: string }> {
  const number = cleanPhone(String(raw ?? ""));
  if (!isValidPhone(number))
    return {
      ok: false,
      error: "Ingresá entre 8 y 15 dígitos, con código de país (ej. 59899000000).",
    };
  try {
    await writeSiteSettings({ whatsappNumber: number });
  } catch {
    return { ok: false, error: "No se pudo guardar en el servidor." };
  }
  updateTag(SITE_TAG);
  return { ok: true, number };
}
