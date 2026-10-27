"use client";

import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  TEAM,
  type MemberStatus,
  type Role,
  type TeamMember,
} from "./data";

const MEMBER_STYLES: Record<MemberStatus, string> = {
  Activo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Invitado: "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const ROLES: Role[] = ["Super Admin", "Editor", "Soporte"];

const FIELD =
  "rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

function Pill({
  className,
  children,
}: {
  className: string;
  children: string;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}

export default function TeamManager() {
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [inviting, setInviting] = useState(false);

  function invite(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email) return;
    const name = email.split("@")[0].replace(/[._-]+/g, " ");
    setTeam((t) => [
      ...t,
      {
        id: `t${t.length + 1}-${email}`,
        name: name.replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
        role: (form.get("role") as Role) ?? "Soporte",
        status: "Invitado",
      },
    ]);
    setInviting(false);
  }

  return (
    <>
      <section aria-labelledby="team-heading" className="mt-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 id="team-heading" className="text-xl font-medium tracking-tight">
            Gestión de Usuarios del Equipo
          </h2>
          <button
            type="button"
            onClick={() => setInviting((v) => !v)}
            aria-expanded={inviting}
            data-testid="invite-toggle"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition-[transform,border-color] duration-150 hover:border-fg/40 active:scale-95"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Invitar Usuario
          </button>
        </div>

        {inviting && (
          <form
            onSubmit={invite}
            data-testid="invite-form"
            className="mt-4 flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row"
          >
            <input
              name="email"
              type="email"
              required
              placeholder="email@tuproximoauto.com"
              aria-label="Email del invitado"
              className={`${FIELD} flex-1`}
            />
            <select
              name="role"
              defaultValue="Soporte"
              aria-label="Rol"
              className={FIELD}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-inverse px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95"
            >
              Enviar invitación
            </button>
          </form>
        )}

        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--card-shadow)]">
          {team.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4"
            >
              <span
                aria-hidden
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-inverse text-sm font-semibold text-on-inverse"
              >
                {m.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted">{m.email}</p>
              </div>
              <span className="text-xs text-muted">{m.role}</span>
              <Pill className={MEMBER_STYLES[m.status]}>{m.status}</Pill>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
