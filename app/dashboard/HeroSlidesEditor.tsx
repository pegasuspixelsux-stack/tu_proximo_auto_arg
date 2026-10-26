"use client";

import { doc, setDoc } from "firebase/firestore";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition, type ReactNode } from "react";
import { db } from "@/lib/firebase";
import { photoError, uploadPhoto } from "@/lib/imagekit-upload";
import {
  HERO_IMAGES,
  MAX_HERO_SLIDES,
  sanitizeSlides,
  type HeroSlide,
} from "../data/hero";
import { revalidateHero } from "./actions";

const FIELD =
  "w-full rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-subtle focus:border-fg/40";
const ICON_BTN =
  "flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted transition-colors duration-150 hover:text-fg disabled:pointer-events-none disabled:opacity-40";

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

const blank = (): HeroSlide => ({
  id: crypto.randomUUID(),
  image: HERO_IMAGES[0].value,
  eyebrow: "",
  highlight: "",
  heading: "",
  supportText: "",
  rating: "4.9",
  reviewCount: "+200",
  reviewLabel: "reseñas en Google",
});

export default function HeroSlidesEditor({ initial }: { initial: HeroSlide[] }) {
  const [slides, setSlides] = useState(initial);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, start] = useTransition();

  const edit = (fn: (list: HeroSlide[]) => HeroSlide[]) => {
    setStatus(null);
    setSlides(fn);
  };
  const update = (i: number, patch: Partial<HeroSlide>) =>
    edit((l) => l.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const move = (i: number, dir: -1 | 1) =>
    edit((l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const [uploading, setUploading] = useState<Record<string, number>>({});

  async function onImage(i: number, file: File | undefined) {
    if (!file) return;
    const id = slides[i].id;
    const invalid = photoError(file);
    if (invalid) return setStatus({ ok: false, msg: invalid });
    setStatus(null);
    setUploading((u) => ({ ...u, [id]: 0 }));
    try {
      const url = await uploadPhoto(file, "/hero", (pct) =>
        setUploading((u) => ({ ...u, [id]: pct })),
      );
      // Match by id: the list may have been reordered during the upload.
      setSlides((l) => l.map((s) => (s.id === id ? { ...s, image: url } : s)));
    } catch (e) {
      setStatus({
        ok: false,
        msg: e instanceof Error ? e.message : "No se pudo subir la imagen.",
      });
    } finally {
      setUploading((u) => {
        const next = { ...u };
        delete next[id];
        return next;
      });
    }
  }

  function save() {
    start(async () => {
      const result = sanitizeSlides(slides);
      if (!result.ok) return setStatus({ ok: false, msg: result.error });
      try {
        await setDoc(doc(db, "settings", "hero"), { slides: result.slides });
        await revalidateHero();
        setSlides(result.slides);
        setStatus({
          ok: true,
          msg: "Cambios guardados. Ya se ven en el inicio.",
        });
      } catch {
        setStatus({
          ok: false,
          msg: "No se pudo guardar. Revisá tu sesión y las reglas de Firestore.",
        });
      }
    });
  }

  return (
    <div data-testid="hero-editor" className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium tracking-tight">
            Hero del inicio (slideshow)
          </h3>
          <p className="mt-1 text-xs text-muted">
            Hasta {MAX_HERO_SLIDES} diapositivas. Cambian solas cada 6 segundos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => edit((l) => [...l, blank()])}
          disabled={slides.length >= MAX_HERO_SLIDES}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider text-fg transition-[transform,border-color] duration-150 hover:border-fg/40 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Agregar diapositiva
        </button>
      </div>

      <ol className="mt-5 space-y-4">
        {slides.map((s, i) => (
          <li
            key={s.id}
            className="rounded-xl border border-line bg-surface p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium">Diapositiva {i + 1}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Subir"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className={ICON_BTN}
                >
                  <ArrowUp className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label="Bajar"
                  onClick={() => move(i, 1)}
                  disabled={i === slides.length - 1}
                  className={ICON_BTN}
                >
                  <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  aria-label="Eliminar diapositiva"
                  onClick={() => edit((l) => l.filter((_, j) => j !== i))}
                  disabled={slides.length === 1}
                  className={ICON_BTN}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="Imagen" wide>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={
                      HERO_IMAGES.some((o) => o.value === s.image) ? s.image : ""
                    }
                    onChange={(e) =>
                      e.target.value && update(i, { image: e.target.value })
                    }
                    className={`${FIELD} sm:w-48`}
                  >
                    <option value="">Personalizada</option>
                    {HERO_IMAGES.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={s.image}
                    onChange={(e) => update(i, { image: e.target.value })}
                    className={FIELD}
                  />
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="relative block h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-line bg-surface">
                    {(s.image.startsWith("/") || s.image.startsWith("https://")) && (
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="112px"
                        unoptimized={!s.image.startsWith("/")}
                        className="object-cover"
                      />
                    )}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    id={`hero-file-${s.id}`}
                    data-testid="hero-image-input"
                    className="sr-only"
                    onChange={(e) => {
                      onImage(i, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <label
                    htmlFor={`hero-file-${s.id}`}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-xs font-semibold uppercase tracking-wider text-fg transition-colors duration-150 hover:border-fg/40 ${
                      s.id in uploading ? "pointer-events-none opacity-60" : ""
                    }`}
                  >
                    <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    {s.id in uploading
                      ? `Subiendo ${uploading[s.id]}%`
                      : "Subir imagen"}
                  </label>
                </div>
              </Labeled>
              <Labeled label="Eyebrow" wide>
                <input
                  value={s.eyebrow}
                  onChange={(e) => update(i, { eyebrow: e.target.value })}
                  className={FIELD}
                />
              </Labeled>
              <Labeled label="Título destacado (color de marca)">
                <input
                  value={s.highlight}
                  onChange={(e) => update(i, { highlight: e.target.value })}
                  className={FIELD}
                />
              </Labeled>
              <Labeled label="Título (resto)">
                <input
                  value={s.heading}
                  onChange={(e) => update(i, { heading: e.target.value })}
                  className={FIELD}
                />
              </Labeled>
              <Labeled label="Texto de apoyo" wide>
                <textarea
                  rows={2}
                  value={s.supportText}
                  onChange={(e) => update(i, { supportText: e.target.value })}
                  className={FIELD}
                />
              </Labeled>
              <Labeled label="Valoración">
                <input
                  value={s.rating}
                  onChange={(e) => update(i, { rating: e.target.value })}
                  placeholder="4.9"
                  className={FIELD}
                />
              </Labeled>
              <Labeled label="Cantidad de reseñas">
                <input
                  value={s.reviewCount}
                  onChange={(e) => update(i, { reviewCount: e.target.value })}
                  placeholder="+200"
                  className={FIELD}
                />
              </Labeled>
              <Labeled label="Texto de reseñas" wide>
                <input
                  value={s.reviewLabel}
                  onChange={(e) => update(i, { reviewLabel: e.target.value })}
                  placeholder="reseñas en Google"
                  className={FIELD}
                />
              </Labeled>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          data-testid="hero-save"
          className="rounded-full bg-inverse px-6 py-3 text-xs font-semibold uppercase tracking-wider text-on-inverse transition-[transform,opacity] duration-150 hover:opacity-85 active:scale-[0.98] disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar cambios"}
        </button>
        {status && (
          <p
            role="status"
            className={`text-sm ${status.ok ? "text-muted" : "text-red-400"}`}
          >
            {status.msg}
          </p>
        )}
      </div>
    </div>
  );
}
