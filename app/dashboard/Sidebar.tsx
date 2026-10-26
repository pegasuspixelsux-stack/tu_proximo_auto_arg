"use client";

import {
  ArrowLeft,
  Car,
  LayoutDashboard,
  Inbox,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const LINKS = [
  { label: "Panel de Control", href: "/dashboard", icon: LayoutDashboard },
  { label: "Listado de Vehículos", href: "/dashboard/vehiculos", icon: Car },
  { label: "Interesados", href: "/dashboard/interesados", icon: Inbox },
  { label: "Usuarios & Equipo", href: "/dashboard/equipo", icon: Users },
  { label: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

function Brand({ compact }: { compact?: boolean }) {
  if (compact)
    return (
      <Link
        href="/dashboard"
        aria-label="AUTO SELECT"
        className="flex h-9 w-9 items-center justify-center bg-brand text-sm font-bold text-black"
      >
        A
      </Link>
    );
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <span className="text-lg font-bold uppercase tracking-[-0.02em]">
        <span className="mr-[0.15em] bg-brand px-1.5 py-0.5 text-black">
          AUTO
        </span>
        SELECT
      </span>
      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">
        v1.0
      </span>
    </Link>
  );
}

function SidebarBody({
  onNavigate,
  collapsed = false,
  onToggle,
}: {
  onNavigate?: () => void;
  /** Icon-only rail (desktop). */
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div
        className={`flex items-center py-6 ${
          collapsed ? "justify-center px-3" : "justify-between px-5"
        }`}
      >
        <Brand compact={collapsed} />
      </div>

      <div
        className={`pb-4 ${collapsed ? "flex justify-center px-3" : "px-3"}`}
      >
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
              aria-pressed={collapsed}
              title={collapsed ? "Expandir menú" : undefined}
              data-testid="sidebar-toggle"
              className={`flex h-8 items-center gap-2 rounded-full text-xs text-fg transition-colors duration-150 hover:bg-surface ${
                collapsed ? "w-8 justify-center" : "w-full px-2"
              }`}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-brand" strokeWidth={1.75} aria-hidden />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 text-brand" strokeWidth={1.75} aria-hidden />
                  Contraer menú
                </>
              )}
            </button>
          )}
      </div>

      <div className="px-3 pb-3">
        <Link
          href="/"
          onClick={onNavigate}
          aria-label={collapsed ? "Volver al sitio" : undefined}
          title={collapsed ? "Volver al sitio" : undefined}
          data-testid="back-to-site"
          className={`flex items-center rounded-xl border border-line py-2.5 text-sm text-fg transition-colors duration-150 hover:bg-surface ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
          {!collapsed && "Volver al sitio"}
        </Link>
      </div>

      <nav aria-label="Panel" className="flex-1 space-y-1 px-3">
        {LINKS.map(({ label, href, icon: Icon }) => {
          const active = href === pathname;
          return (
          <Link
            key={label}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            aria-label={collapsed ? label : undefined}
            title={collapsed ? label : undefined}
            className={`flex items-center rounded-xl py-2.5 text-sm transition-colors duration-150 ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            } ${
              active
                ? "bg-surface text-fg ring-1 ring-line"
                : "text-fg hover:bg-surface"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
            {!collapsed && label}
          </Link>
          );
        })}
      </nav>

      <div
        className={`border-t border-line p-4 ${
          collapsed ? "flex flex-col items-center gap-3" : ""
        }`}
      >
        <div
          className={
            collapsed ? "flex flex-col items-center gap-3" : "flex items-center gap-3"
          }
        >
          <span
            aria-hidden
            title={collapsed ? "Alejandro · Admin" : undefined}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-inverse text-xs font-semibold text-on-inverse"
          >
            A
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Alejandro</p>
              <p className="truncate text-xs text-fg/70">Admin</p>
            </div>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOut(auth);
              router.push("/login");
            }}
            aria-label="Cerrar sesión"
            title={collapsed ? "Cerrar sesión" : undefined}
            data-testid="logout"
            className="flex h-8 w-8 items-center justify-center rounded-full text-fg transition-colors duration-150 hover:bg-surface"
          >
            <LogOut className="h-4 w-4 text-brand" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop / tablet: fixed sidebar. */}
      <aside
        data-testid="sidebar"
        className={`force-dark fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-bg text-fg transition-[width] duration-200 ease-out lg:block ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <SidebarBody collapsed={collapsed} onToggle={onToggle} />
      </aside>

      {/* Mobile and tablet: top bar with a slide-in drawer. */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Brand />
        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fg transition-transform duration-150 active:scale-95"
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
        >
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="force-dark absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-line bg-bg text-fg">
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-fg hover:bg-surface"
            >
              <X className="h-4 w-4 text-brand" strokeWidth={1.75} aria-hidden />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
