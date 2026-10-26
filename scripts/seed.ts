// Uploads the mock vehicles and dealerships to Firestore.
// Usage: npm run seed   (needs SEED_EMAIL / SEED_PASSWORD in .env.local)
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, writeBatch } from "firebase/firestore";
import { DEALERSHIPS, SAMPLE_VEHICLES } from "./seed-data.ts";

const env = process.env;
const email = env.SEED_EMAIL;
const password = env.SEED_PASSWORD;
if (!email || !password) {
  console.error("Falta SEED_EMAIL / SEED_PASSWORD en .env.local");
  process.exit(1);
}

const app = initializeApp({
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

await signInWithEmailAndPassword(getAuth(app), email, password);
const db = getFirestore(app);

// Firestore rejects `undefined` fields, so round-trip through JSON.
const clean = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const batch = writeBatch(db);
for (const d of DEALERSHIPS) batch.set(doc(db, "dealerships", d.id), clean(d));
SAMPLE_VEHICLES.forEach((v, i) =>
  batch.set(doc(db, "vehicles", v.id), { ...clean(v), order: i }),
);
await batch.commit();

console.log(
  `Cargados ${SAMPLE_VEHICLES.length} vehículos y ${DEALERSHIPS.length} concesionarias.`,
);
process.exit(0);
