import { collection, doc, setDoc } from "firebase/firestore";
import type { Lead } from "@/app/data/leads";
import { db } from "./firebase";

/** Saves a new lead in Firestore. Resolves once the server has it. */
export async function createLead(
  input: Pick<Lead, "fullName" | "phone"> &
    Partial<Pick<Lead, "notes" | "sourceItem">>,
) {
  const ref = doc(collection(db, "leads"));
  const now = new Date().toISOString();
  const lead: Lead = {
    id: ref.id,
    fullName: input.fullName.trim(),
    phone: input.phone,
    status: "new",
    createdAt: now,
    updatedAt: now,
    ...(input.notes?.trim() && { notes: input.notes.trim() }),
    ...(input.sourceItem && { sourceItem: input.sourceItem }),
  };
  await setDoc(ref, lead);
  return lead;
}
