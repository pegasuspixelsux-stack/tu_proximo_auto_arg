"use client";

import { Check, MessageCircle } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  /** "2020 Nissan Kicks" */
  title: string;
  /** Already formatted, e.g. "$ 32.000.000". */
  price: string;
  /** Absolute URL of the listing (its Open Graph tags build the link preview). */
  url: string;
  /** Absolute URL of the main photo; optional. */
  image?: string;
}

const BUTTON =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-fg transition-[border-color,background-color,transform] duration-150 hover:border-fg/40 hover:bg-fg/5 focus-visible:bg-fg/5 active:scale-[0.97]";

/** Touch devices get the app; desktops get the web client. */
const isMobile = () =>
  typeof navigator !== "undefined" &&
  (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse)").matches);

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export default function ShareVehicle({ title, price, url, image }: Props) {
  const [notice, setNotice] = useState("");
  const photo = useRef<File | null>(null);
  const photoRequested = useRef(false);

  // Brand name rather than the dealership's: the portal is what gets promoted.
  const caption = `Mirá este ${title} en Tu Próximo Auto: ${price}. ¡Consultanos!`;
  const text = `${caption} ${url}`;

  /** Starts downloading the photo on first interaction, so a share can attach it. */
  function prefetchPhoto() {
    if (!image || photoRequested.current) return;
    photoRequested.current = true;
    fetch(image)
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        photo.current = new File([blob], "auto.jpg", { type: blob.type || "image/jpeg" });
      })
      .catch(() => {});
  }

  function shareWhatsApp() {
    const base = isMobile()
      ? "https://api.whatsapp.com/send"
      : "https://web.whatsapp.com/send";
    window.open(`${base}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  async function shareInstagram() {
    // Instagram has no web "share this link" intent. On phones the native share
    // sheet lists Instagram; on desktop we copy the caption and open Instagram.
    if (isMobile() && typeof navigator.share === "function") {
      const files = photo.current ? [photo.current] : undefined;
      const data: ShareData = { title, text: caption, url };
      try {
        if (files && navigator.canShare?.({ files })) await navigator.share({ ...data, files });
        else await navigator.share(data);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return; // user closed the sheet
      }
    }
    const copied = await copyCaption();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
    setNotice(
      copied
        ? "Texto y enlace copiados. Pegalos en tu publicación de Instagram."
        : "Copiá este enlace para compartirlo en Instagram: " + url,
    );
    window.setTimeout(() => setNotice(""), 6000);
  }

  return (
    <div data-testid="share-vehicle" className="mt-6">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted">
        Compartir este auto
      </p>
      <div className="mt-3 flex gap-3" onPointerEnter={prefetchPhoto} onTouchStart={prefetchPhoto} onFocus={prefetchPhoto}>
        <button type="button" onClick={shareWhatsApp} data-testid="share-whatsapp" className={BUTTON}>
          <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          WhatsApp
        </button>
        <button type="button" onClick={shareInstagram} data-testid="share-instagram" className={BUTTON}>
          <InstagramIcon />
          Instagram
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-2 flex min-h-4 items-center gap-1.5 text-xs text-muted">
        {notice && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />}
        {notice}
      </p>
    </div>
  );
}
