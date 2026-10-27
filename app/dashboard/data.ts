export type ListingStatus = "Publicado" | "Pendiente de Pago" | "Vendido";

export interface DashboardListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  /** ISO date the listing was published. */
  publishedAt: string;
  status: ListingStatus;
  image: string;
}

export type Role = "Super Admin" | "Editor" | "Soporte";
export type MemberStatus = "Activo" | "Invitado";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
}

export const TEAM: TeamMember[] = [
  {
    id: "t1",
    name: "Alejandro González",
    email: "alejandro@tuproximoauto.com",
    role: "Super Admin",
    status: "Activo",
  },
  {
    id: "t2",
    name: "Valentina Rossi",
    email: "valentina@tuproximoauto.com",
    role: "Editor",
    status: "Activo",
  },
  {
    id: "t3",
    name: "Martín Pereira",
    email: "martin@tuproximoauto.com",
    role: "Soporte",
    status: "Invitado",
  },
];
