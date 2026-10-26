import { cacheTag } from "next/cache";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_SITE, type SiteSettings } from "./site";

export const SITE_TAG = "site-settings";

/** Site settings live in the `settings/site` Firestore document. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(SITE_TAG);
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    return { ...DEFAULT_SITE, ...snap.data() };
  } catch {
    return DEFAULT_SITE;
  }
}
