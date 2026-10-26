"use client";

import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "dashboard-nav-collapsed";

/** Sidebar + page content; the sidebar can shrink to an icon rail on desktop. */
export default function DashboardShell({ children }: { children: ReactNode }) {
  // Only rendered after AuthGuard confirms the session on the client, so it is
  // safe to read localStorage during the first render.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  function toggle() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {}
      return !c;
    });
  }

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div
        className={`transition-[padding] duration-200 ease-out ${
          collapsed ? "lg:pl-[72px]" : "lg:pl-64"
        }`}
      >
        {children}
      </div>
    </>
  );
}
