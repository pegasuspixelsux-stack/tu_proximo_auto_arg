"use client";

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
import { db } from "@/lib/firebase";
import { photoError, uploadPhoto } from "@/lib/imagekit-upload";
import { COMMON_CAR_FEATURES } from "../data/car-features";
import {
  vehicleReference,
  type BodyType,
  Dealership,
  FuelType,
  SellerType,
  Vehicle,
} from "../data/vehicles";
import { revalidateVehicles } from "./actions";

const KM_PER_MILE = 1.60934;

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";

const FUELS: [FuelType, string][] = [
  ["Gasoline", "Nafta"],
  ["Diesel", "Diésel"],
  ["Hybrid", "Híbrido"],
  ["Electric", "Eléctrico"],
];
const BODIES: BodyType[] = ["Auto", "SUV", "Deportivo", "Clásico", "Moto"];

/** Parses "Label: value" lines into the extra technical-sheet rows. */
function parseSpecs(text: string) {
  const specs: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const i = line.indexOf(":");
    const label = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (i > 0 && label && value) specs[label] = value;
  }
  return specs;
}

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

export default function VehicleModal({
  vehicle,
  dealerships,
  vehicles,
  onClose,
  onSaved,
}: {
  /** Vehicle being edited; omit to create a new one. */
  vehicle?: Vehicle;
  dealerships: Dealership[];
  /** All listings, used to keep the reference number unique. */
  vehicles: Vehicle[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const titleId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>(
    vehicle?.images?.length ? vehicle.images : vehicle?.image ? [vehicle.image] : [],
  );
  // Index into `images` of the featured photo.
  const [featured, setFeatured] = useState(() => {
    const i = vehicle?.images?.indexOf(vehicle.image) ?? -1;
    return i > 0 ? i : 0;
  });
  const [progress, setProgress] = useState<number | null>(null);
  const [sellerType, setSellerType] = useState<SellerType>(
    vehicle?.sellerType ?? "dealer",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files);
    const invalid = list.map(photoError).find(Boolean);
    if (invalid) return setError(invalid);
    try {
      for (const file of list) {
        setProgress(0);
        const url = await uploadPhoto(file, "/vehicles", setProgress);
        setImages((prev) => [...prev, url]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      setProgress(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removePhoto(i: number) {
    setImages((prev) => prev.filter((_, j) => j !== i));
    // Keep the same photo featured; fall back to the first when it was removed.
    setFeatured((f) => (i === f ? 0 : i < f ? f - 1 : f));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!images.length) return setError("Subí al menos una foto del vehículo.");
    const f = new FormData(e.currentTarget);
    const str = (k: string) => String(f.get(k) ?? "").trim();
    const dealership =
      sellerType === "dealer"
        ? dealerships.find((d) => d.id === str("dealershipId"))
        : undefined;
    if (sellerType === "dealer" && !dealership)
      return setError("Elegí una concesionaria.");

    const reference = str("reference");
    if (!/^[A-Za-z0-9-]{1,20}$/.test(reference))
      return setError(
        "El número de referencia solo puede tener letras, números y guiones (máx. 20).",
      );
    if (
      vehicles.some(
        (v) => v.id !== vehicle?.id && vehicleReference(v) === reference,
      )
    )
      return setError("Ese número de referencia ya lo usa otro vehículo.");

    const fields = {
      reference,
      make: str("make"),
      model: str("model"),
      year: Number(str("year")),
      price: Number(str("price")),
      mileage: Math.round(Number(str("km")) / KM_PER_MILE),
      transmission: str("transmission"),
      fuelType: str("fuelType") as FuelType,
      bodyType: str("bodyType") as BodyType,
      image: images[featured] ?? images[0],
      images,
      color: str("color"),
      specs: parseSpecs(str("specs")),
      features: f.getAll("features").map(String),
      description: str("description"),
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
          <div>
            {images.length > 0 && (
              <ul
                data-testid="photo-list"
                className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4"
              >
                {images.map((src, i) => (
                  <li key={src} className="flex flex-col gap-1.5">
                    <span
                      className={`relative block aspect-[4/3] overflow-hidden rounded-xl border bg-surface ${
                        i === featured ? "border-fg" : "border-line"
                      }`}
                    >
                      <Image
                        src={src}
                        alt={`Foto ${i + 1} del vehículo`}
                        fill
                        sizes="144px"
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        aria-label={`Quitar foto ${i + 1}`}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors duration-150 hover:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                      </button>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFeatured(i)}
                      aria-pressed={i === featured}
                      data-testid={`photo-featured-${i}`}
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors duration-150 ${
                        i === featured
                          ? "border-fg bg-inverse text-on-inverse"
                          : "border-line text-muted hover:border-fg/40"
                      }`}
                    >
                      {i === featured ? "Principal" : "Hacer principal"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              data-testid="photo-input"
              onChange={(e) => onPhotos(e.target.files)}
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
                : images.length
                  ? "Agregar más fotos"
                  : "Subir fotos"}
            </label>
            <p className="mt-2 text-xs text-muted">
              JPG, PNG o WebP. Máx. 10 MB cada una. La foto principal se
              muestra primero.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Labeled label="N.º de referencia" wide>
              <input
                name="reference"
                required
                maxLength={20}
                defaultValue={vehicle ? vehicleReference(vehicle) : ""}
                placeholder="Ej. 0012"
                data-testid="vehicle-reference"
                className={FIELD}
              />
            </Labeled>
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
            <Labeled label="Color">
              <input
                name="color"
                defaultValue={vehicle?.color}
                placeholder="Negro"
                className={FIELD}
              />
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

          <label className="mt-6 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
              Descripción
            </span>
            <textarea
              name="description"
              rows={4}
              maxLength={2000}
              defaultValue={vehicle?.description}
              placeholder="Estado general, historial de service, detalles a destacar…"
              data-testid="vehicle-description"
              className={`${FIELD} resize-y`}
            />
          </label>

          <label className="mt-6 flex flex-col gap-1.5">
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted">
              Ficha técnica (una línea por dato, «Etiqueta: valor»)
            </span>
            <textarea
              name="specs"
              rows={4}
              defaultValue={Object.entries(vehicle?.specs ?? {})
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n")}
              placeholder={"Motor: 2.0 turbo\nPotencia: 250 hp\nTracción: Delantera"}
              data-testid="vehicle-specs"
              className={`${FIELD} resize-y`}
            />
          </label>

          <fieldset className="mt-6">
            <legend className="text-[10px] font-medium uppercase tracking-widest text-muted">
              Equipamiento
            </legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {COMMON_CAR_FEATURES.map(({ id, label }) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="features"
                    value={id}
                    defaultChecked={vehicle?.features?.includes(id)}
                    className="h-4 w-4 shrink-0 accent-[var(--inverse)]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

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
