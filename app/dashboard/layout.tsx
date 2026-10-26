import type { Metadata } from "next";
import type { ReactNode } from "react";
import AuthGuard from "./AuthGuard";
import DashboardShell from "./DashboardShell";

// AuthGuard renders nothing until the Firebase session is confirmed, so this
// admin area can't (and needn't) be an instant navigation.
export const instant = false;

export const metadata: Metadata = {
  title: "Panel de Control | Tu Próximo Auto - Argentina",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="force-light min-h-screen bg-bg text-fg">
      <AuthGuard>
        <DashboardShell>{children}</DashboardShell>
      </AuthGuard>
    </div>
  );
}
