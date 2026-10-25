import { cacheTag } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { DEFAULT_SITE, type SiteSettings } from "./site";

export const SITE_TAG = "site-settings";
const FILE = path.join(process.cwd(), "data", "site-settings.json");

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_TAG);
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8"));
    return { ...DEFAULT_SITE, ...parsed };
  } catch {
    return DEFAULT_SITE;
  }
}

export async function writeSiteSettings(settings: SiteSettings) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(settings, null, 2), "utf8");
}
