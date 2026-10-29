"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import PhotoPlaceholder from "./PhotoPlaceholder";

const ARROW =
  "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-[background-color,transform] duration-150 hover:bg-black/60 active:scale-95";

/** Photo slideshow with side arrows only. `images[0]` is the featured photo. */
export default function VehicleSlideshow({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);

  return (
    <div
      data-testid="vehicle-slideshow"
      className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-900 lg:aspect-auto lg:min-h-[24rem] lg:flex-1"
    >
      {count === 0 && <PhotoPlaceholder />}
      <AnimatePresence initial={false}>
        {count > 0 && (
          <motion.div
            key={images[index]}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease: "easeInOut" }}
          >
            <Image
              src={images[index]}
              alt={count > 1 ? `${alt} (foto ${index + 1} de ${count})` : alt}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {badge}
        </span>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            data-testid="slideshow-prev"
            className={`${ARROW} left-3`}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
            data-testid="slideshow-next"
            className={`${ARROW} right-3`}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        </>
      )}
    </div>
  );
}
