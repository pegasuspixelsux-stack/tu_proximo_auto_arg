"use client";

import { upload } from "@imagekit/next";
import {
  collection,
  deleteField,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { auth, db } from "@/lib/firebase";
import type {
  BodyType,
  Dealership,
  FuelType,
  SellerType,
  Vehicle,
} from "../data/vehicles";
import { revalidateVehicles } from "./actions";

const KM_PER_MILE = 1.60934;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

const FUELS: [FuelType, string][] = [
  ["Gasoline", "Nafta"],
  ["Diesel", "Diésel"],
  ["Hybrid", "Híbrido"],
  ["Electric", "Eléctrico"],
];
const BODIES: BodyType[] = ["Auto", "SUV", "Deportivo", "Clásico", "Moto"];

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

/** Uploads one photo to ImageKit with a signature from /api/imagekit-auth. */
async function uploadPhoto(file: File, onProgress: (pct: number) => void) {
  const user = auth.currentUser;
  if (!user) throw new Error("Tu sesión expiró. Volvé a iniciar sesión.");
  const res = await fetch("/api/imagekit-auth", {
    headers: { authorization: `Bearer ${await user.getIdToken()}` },
  });
  if (!res.ok) throw new Error("No se pudo autorizar la subida.");
  const { token, expire, signature, publicKey } = await res.json();
  const result = await upload({
    file,
    fileName: file.name,
    folder: "/vehicles",
    token,
    expire,
    signature,
    publicKey,
    onProgress: (e) => onProgress(Math.round((e.loaded / e.total) * 100)),
  });
  if (!result.url) throw new Error("ImageKit no devolvió la URL de la foto.");
  return result.url;
}

export default function VehicleModal({
  vehicle,
  dealerships,
  onClose,
  onSaved,
}: {
  /** Vehicle being edited; omit to create a new one. */
  vehicle?: Vehicle;
  dealerships: Dealership[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState(vehicle?.image ?? "");
  const [progress, setProgress] = useState<number | null>(null);
  const [sellerType, setSellerType] = useState<SellerType>(
    vehicle?.sellerType ?? "dealer",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/"))
      return setError("El archivo tiene que ser una imagen.");
    if (file.size > MAX_PHOTO_BYTES)
      return setError("La foto pesa más de 10 MB.");
    setProgress(0);
    try {
      setImage(await uploadPhoto(file, setProgress));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!image) return setError("Subí al menos una foto del vehículo.");
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) ?? "").trim();
    const dealership =
      sellerType === "dealer"
        ? dealerships.find((d) => d.id === str("dealershipId"))
        : undefined;
    if (sellerType === "dealer" && !dealership)
      return setError("Elegí una concesionaria.");

    const fields = {
      make: str("make"),
      model: str("model"),
      year: Number(str("year")),
      price: Number(str("price")),
      mileage: Math.round(Number(str("km")) / KM_PER_MILE),
      transmission: str("transmission"),
      fuelType: str("fuelType") as FuelType,
      bodyType: str("bodyType") as BodyType,
      image,
      location: dealership?.location ?? str("location"),
      sellerType,
    };

    setSaving(true);
    setError("");
    try {
      if (vehicle) {
        await updateDoc(doc(db, "vehicles", vehicle.id), {
          ...fields,
          dealership: dealership ?? deleteField(),
          sellerPhone:
            sellerType === "private" ? str("sellerPhone") : deleteField(),
        });
      } else {
        const ref = doc(collection(db, "vehicles"));
        await setDoc(ref, {
          ...fields,
          id: ref.id,
          createdAt: new Date().toISOString().slice(0, 10),
          // Negative timestamp: new listings sort ahead of the seeded ones.
          order: -Date.now(),
          ...(dealership && { dealership }),
          ...(sellerType === "private" && { sellerPhone: str("sellerPhone") }),
        });
      }
      await revalidateVehicles();
      onSaved();
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
        data-testid="vehicle-modal"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-bg text-fg shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-lg font-medium tracking-tight">
            {vehicle ? "Editar vehículo" : "Agregar vehículo"}
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
            <span className="relative flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-surface">
              {image ? (
                <Image
                  src={image}
                  alt="Foto del vehículo"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              ) : (
                <ImagePlus
                  className="h-6 w-6 text-subtle"
                  strokeWidth={1.5}
                  aria-hidden
                />
              )}
            </span>
            <div className="min-w-0">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                data-testid="photo-input"
                onChange={(e) => onPhoto(e.target.files?.[0])}
                className="sr-only"
                id={`${titleId}-photo`}
              />
              <label
                htmlFor={`${titleId}-photo`}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 hover:border-fg/40 ${
                  progress !== null ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {progress !== null
                  ? `Subiendo ${progress}%`
                  : image
                    ? "Cambiar foto"
                    : "Subir foto"}
              </label>
              <p className="mt-2 text-xs text-muted">
                JPG, PNG o WebP. Máx. 10 MB.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Labeled label="Marca">
              <input
                name="make"
                required
                defaultValue={vehicle?.make}
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Modelo">
              <input
                name="model"
                required
                defaultValue={vehicle?.model}
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Año">
              <input
                name="year"
                type="number"
                required
                min={1900}
                max={2100}
                defaultValue={vehicle?.year}
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Precio (USD)">
              <input
                name="price"
                type="number"
                required
                min={0}
                defaultValue={vehicle?.price}
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Kilometraje (km)">
              <input
                name="km"
                type="number"
                required
                min={0}
                defaultValue={
                  vehicle
                    ? Math.round(vehicle.mileage * KM_PER_MILE)
                    : undefined
                }
                className={FIELD}
              />
            </Labeled>
            <Labeled label="Transmisión">
              <select
                name="transmission"
                defaultValue={vehicle?.transmission ?? "Automática"}
                className={FIELD}
              >
                <option>Automática</option>
                <option>Manual</option>
              </select>
            </Labeled>
            <Labeled label="Combustible">
              <select
                name="fuelType"
                defaultValue={vehicle?.fuelType ?? "Gasoline"}
                className={FIELD}
              >
                {FUELS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Carrocería">
              <select
                name="bodyType"
                defaultValue={vehicle?.bodyType ?? "Auto"}
                className={FIELD}
              >
                {BODIES.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Labeled>
            <Labeled label="Vendedor">
              <select
                value={sellerType}
                onChange={(e) => setSellerType(e.target.value as SellerType)}
                className={FIELD}
              >
                <option value="dealer">Concesionaria</option>
                <option value="private">Particular</option>
              </select>
            </Labeled>
            {sellerType === "dealer" ? (
              <Labeled label="Concesionaria">
                <select
                  name="dealershipId"
                  required
                  defaultValue={vehicle?.dealership?.id ?? ""}
                  className={FIELD}
                >
                  <option value="" disabled>
                    Elegí una…
                  </option>
                  {dealerships.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </Labeled>
            ) : (
              <>
                <Labeled label="Ubicación">
                  <input
                    name="location"
                    required
                    defaultValue={vehicle?.location}
                    className={FIELD}
                  />
                </Labeled>
                <Labeled label="WhatsApp del vendedor" wide>
                  <input
                    name="sellerPhone"
                    required
                    inputMode="numeric"
                    placeholder="59899123456"
                    defaultValue={vehicle?.sellerPhone}
                    className={FIELD}
                  />
                </Labeled>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 hover:border-fg/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || progress !== null}
              data-testid="vehicle-save"
              className="rounded-full bg-inverse px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-95 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
