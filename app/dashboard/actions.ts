"use server";

import { updateTag } from "next/cache";
import { HERO_TAG } from "../data/hero-store";
import { SITE_TAG } from "../data/site-store";
import { VEHICLES_TAG } from "../data/vehicle-store";

// The dashboard writes to Firestore from the browser (signed in), then calls
// one of these so the cached public pages refresh.

export async function revalidateVehicles() {
  updateTag(VEHICLES_TAG);
}

export async function revalidateHero() {
  updateTag(HERO_TAG);
}

export async function revalidateSite() {
  updateTag(SITE_TAG);
}
