"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import type { Lead, LeadStatus } from "../data/leads";

/** Live list of leads, newest first. */
export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "leads"), orderBy("createdAt", "desc")),
      (snap) => {
        setLeads(snap.docs.map((d) => d.data() as Lead));
        setError("");
        setLoading(false);
      },
      () => {
        setError(
          "No se pudieron cargar los interesados. Revisá las reglas de Firestore.",
        );
        setLoading(false);
      },
    );
  }, []);

  return { leads, loading, error };
}

export function setLeadStatus(id: string, status: LeadStatus) {
  return updateDoc(doc(db, "leads", id), {
    status,
    updatedAt: new Date().toISOString(),
  });
}
