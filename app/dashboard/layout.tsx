import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

export const metadata: Metadata = {
  title: "Panel de Control | AUTO SELECT",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="force-light min-h-screen bg-bg text-fg">
      <Sidebar />
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
