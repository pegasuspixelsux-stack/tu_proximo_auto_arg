import { ImageOff } from "lucide-react";

/** Fills its (relatively positioned) parent when a listing has no photo yet. */
export default function PhotoPlaceholder({ label = "Foto próximamente" }) {
  return (
    <div
      role="img"
      aria-label={label}
      data-testid="photo-placeholder"
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-neutral-800 to-neutral-950 text-neutral-400"
    >
      <ImageOff className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      <span className="text-[10px] font-medium uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
