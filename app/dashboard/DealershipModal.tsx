"use client";

import { doc, writeBatch } from "firebase/firestore";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { db } from "@/lib/firebase";
import { photoError, uploadPhoto } from "@/lib/imagekit-upload";
import type { Dealership, Vehicle } from "../data/vehicles";
import { revalidateVehicles } from "./actions";

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Labeled({
  label,
  children,
  wide,
}: {
  label: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function slugify(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Next free "d<number>" id, continuing the seeded d1, d2, ... sequence. */
function nextId(dealerships: Dealership[]) {
  const max = dealerships.reduce((m, d) => {
    const n = /^d(\d+)$/.exec(d.id);
    return n ? Math.max(m, Number(n[1])) : m;
  }, 0);
  return `d${max + 1}`;
}

/** Unique slug: appends -2, -3, ... when another dealership already uses it. */
function uniqueSlug(name: string, dealerships: Dealership[], selfId?: string) {
  const base = slugify(name) || "concesionaria";
  const taken = new Set(
    dealerships.filter((d) => d.id !== selfId).map((d) => d.slug),
  );
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

export default function DealershipModal({
  dealership,
  dealerships,
  vehicles,
  onClose,
  onSaved,
}: {
  /** Dealership being edited; omit to create a new one. */
  dealership?: Dealership;
  dealerships: Dealership[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState(dealership?.logo ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onLogo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError("");
    const invalid = photoError(file);
    if (invalid) return setError(invalid);
    try {
      setProgress(0);
      setLogo(await uploadPhoto(file, "/dealerships", setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir el logo.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) ?? "").trim();
    const name = str("name");
    const address = str("address");
    const city = str("city");
    const province = str("province");
    const email = str("email");
    const phone = str("phone").replace(/\D/g, "");

    if (name.length < 2) return setError("Ingresá el nombre de la concesionaria.");
    if (!city || !province) return setError("Ingresá la ciudad y la provincia.");
    if (!EMAIL_RE.test(email)) return setError("Ingresá un email válido.");
    if (phone.length < 8 || phone.length > 15)
      return setError(
        "Ingresá un teléfono válido, con código de país (solo números).",
      );
    const duplicate = dealerships.find(
      (d) =>
        d.id !== dealership?.id &&
        d.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) return setError("Ya existe una concesionaria con ese nombre.");

    const location = [address, city, province].filter(Boolean).join(", ");
    const next: Dealership = {
      ...dealership,
      id: dealership?.id ?? nextId(dealerships),
      name,
      slug: dealership?.slug ?? uniqueSlug(name, dealerships),
      location,
      address,
      city,
      province,
      email,
      phone,
      verified: dealership?.verified ?? false,
      active: str("status") === "active",
    };
    // Firestore rejects `undefined`, so optional fields are only set when present.
    if (logo) next.logo = logo;
    else delete next.logo;

    setSaving(true);
    setError("");
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, "dealerships", next.id), next);
      // Vehicles embed a copy of their dealership; keep those copies in sync.
      if (dealership) {
        for (const v of vehicles) {
          if (v.dealership?.id === next.id)
            batch.update(doc(db, "vehicles", v.id), {
              dealership: next,
              location,
            });
        }
      }
      await batch.commit();
      await revalidateVehicles();
      onSaved(
        dealership
          ? `Se guardaron los cambios de ${name}.`
          : `Se creó la concesionaria ${name}.`,
      );
    } catch {
      setError(
        "No se pudo guardar. Revisá tu conexión y los permisos de Firestore.",
      );
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="dealership-modal"
        className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-line bg-bg text-fg shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-lg font-medium tracking-tight">
            {dealership ? "Editar concesionaria" : "Nueva concesionaria"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors duration-150 hover:text-fg"
          >
            <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </button>
        </div>

        <form onSubmit={onSubmit} className="overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-4">
            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface text-muted">
              {logo ? (
                <Image
                  src={logo}
                  alt="Logo"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              ) : (
                <ImagePlus className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              )}
            </span>
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                data-testid="dealership-logo-input"
                onChange={(e) => onLogo(e.target.files)}
                className="sr-only"
                id={`${titleId}-logo`}
              />
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor={`${titleId}-logo`}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 hover:border-fg/40 ${
                    progress !== null ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  {progress !== null
                    ? `Subiendo ${progress}%`
                    : logo
                      ? "Cambiar logo"
                      : "Subir logo"}
                </label>
                {logo && (
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted">
                JPG, PNG o WebP. Máx. 10 MB. Opcional.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Labeled label="Nombre" wide>
              <input
                name="name"
                required
                defaultValue={dealership?.name}
                data-testid="dealership-name"
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Dirección" wide>
              <input
                name="address"
                defaultValue={dealership?.address}
                placeholder="Av. Libertador 1234"
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Ciudad">
              <input
                name="city"
                required
                defaultValue={dealership?.city}
                data-testid="dealership-city"
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Provincia">
              <input
                name="province"
                required
                defaultValue={dealership?.province}
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Email de contacto">
              <input
                name="email"
                type="email"
                required
                defaultValue={dealership?.email}
                data-testid="dealership-email"
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Teléfono (WhatsApp)">
              <input
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                defaultValue={dealership?.phone}
                placeholder="5491112345678"
                data-testid="dealership-phone"
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Estado" wide>
              <select
                name="status"
                defaultValue={dealership?.active === false ? "inactive" : "active"}
                data-testid="dealership-status"
                className={FIELD}
              >
                <option value="active">Activa</option>
                <option value="inactive">Inactiva (oculta en el sitio)</option>
              </select>
            </Labeled>
          </div>

          {error && (
            <p
              role="alert"
              data-testid="dealership-error"
              className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-line px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 hover:border-fg/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || progress !== null}
              data-testid="dealership-save"
              className="rounded-full bg-inverse px-5 py-2 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
