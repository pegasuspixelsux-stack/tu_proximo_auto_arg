import { cacheTag } from "next/cache";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_SLIDES, type HeroSlide } from "./hero";

export const HERO_TAG = "hero-slides";

/** Slides live in the `settings/hero` Firestore document. */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheTag(HERO_TAG);
  try {
    const snap = await getDoc(doc(db, "settings", "hero"));
    const slides = snap.data()?.slides;
    return Array.isArray(slides) && slides.length ? slides : DEFAULT_SLIDES;
  } catch {
    return DEFAULT_SLIDES;
  }
}
