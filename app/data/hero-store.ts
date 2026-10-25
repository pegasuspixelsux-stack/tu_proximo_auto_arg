import { cacheTag } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_SLIDES, type HeroSlide } from "./hero";

export const HERO_TAG = "hero-slides";
const FILE = path.join(process.cwd(), "data", "hero-slides.json");

export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheTag(HERO_TAG);
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8"));
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SLIDES;
  } catch {
    return DEFAULT_SLIDES;
  }
}

export async function writeHeroSlides(slides: HeroSlide[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(slides, null, 2), "utf8");
}
