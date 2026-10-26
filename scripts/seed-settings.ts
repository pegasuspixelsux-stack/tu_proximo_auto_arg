// Copies the old local settings files (data/*.json) into Firestore.
// Usage: npm run seed:settings   (needs SEED_EMAIL / SEED_PASSWORD in .env.local)
import { readFile } from "node:fs/promises";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const env = process.env;
if (!env.SEED_EMAIL || !env.SEED_PASSWORD) {
  console.error("Falta SEED_EMAIL / SEED_PASSWORD en .env.local");
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
await signInWithEmailAndPassword(getAuth(app), env.SEED_EMAIL, env.SEED_PASSWORD);
const db = getFirestore(app);

const read = async (file: string) =>
  JSON.parse(await readFile(new URL(`../data/${file}`, import.meta.url), "utf8"));

await setDoc(doc(db, "settings", "site"), await read("site-settings.json"));
console.log("settings/site cargado");
await setDoc(doc(db, "settings", "hero"), { slides: await read("hero-slides.json") });
console.log("settings/hero cargado");
process.exit(0);
