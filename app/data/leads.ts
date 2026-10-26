export type LeadStatus =
  | "new"
  | "contacted"
  | "followup"
  | "negotiating"
  | "closed";

export interface Lead {
  id: string;
  fullName: string;
  phone: string;
  notes?: string;
  /** Item or service the lead clicked on. */
  sourceItem?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

/** Pipeline stages, in order. */
export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "followup", label: "Seguimiento" },
  { value: "negotiating", label: "En negociación" },
  { value: "closed", label: "Cerrado" },
];

export const LEAD_STATUS_LABEL = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.value, s.label]),
) as Record<LeadStatus, string>;
