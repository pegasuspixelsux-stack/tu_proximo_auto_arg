"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { HeroSlide } from "../data/hero";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const INTERVAL_MS = 6000;

export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const slide = slides[Math.min(index, count - 1)];

  useEffect(() => {
    if (count < 2 || paused || reduce) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(t);
  }, [count, paused, reduce]);

  const rise = (delay: number, y = 16) => ({
    initial: { opacity: 0, y: reduce ? 0 : y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE_OUT },
  });

  return (
    <section
      data-testid="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="hero-on-photo relative mx-auto mt-[10px] flex aspect-square min-h-[352px] w-[calc(100%-1.5rem)] sm:aspect-auto lg:w-[calc(100%-3rem)] max-w-[1440px] flex-col rounded-xl sm:min-h-[max(336px,calc((100svh_-_290px)_*_0.56))] lg:h-[calc((100svh_-_290px)_*_0.924)] lg:min-h-[443px] overflow-hidden bg-bg text-fg selection:bg-fg selection:text-bg"
    >
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.9, ease: "easeInOut" }}
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-start px-5 py-10 sm:justify-end sm:px-8 sm:pb-12 sm:pt-10 lg:justify-center lg:px-10 lg:py-6">
        <div className="w-full text-left sm:w-[65%] lg:w-[45%]">
          <div
            key={slide.id}
            aria-live={paused ? "polite" : "off"}
            className="w-full sm:w-fit sm:max-w-full"
          >
            {slide.eyebrow && (
              <motion.p
                {...rise(0.05, 12)}
                className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-fg sm:mb-3 sm:text-xs"
              >
                <Star
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 fill-current text-amber-400 sm:h-3 sm:w-3"
                  strokeWidth={0}
                />
                {slide.eyebrow}
                <Star
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 fill-current text-amber-400 sm:h-3 sm:w-3"
                  strokeWidth={0}
                />
              </motion.p>
            )}
            <motion.h1
              {...rise(0.15, 24)}
              className="text-balance text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-4xl lg:text-6xl"
            >
              {slide.highlight && (
                <span className="text-brand">{slide.highlight} </span>
              )}
              {slide.heading}
            </motion.h1>
            {slide.supportText && (
              <motion.p
                {...rise(0.28)}
                className="mt-2 w-1/2 text-xs leading-relaxed sm:mt-4 sm:w-0 sm:min-w-full sm:text-base lg:mt-5 lg:text-xl text-muted"
              >
                {slide.supportText}
              </motion.p>
            )}
            {slide.rating && (
              <motion.div
                {...rise(0.4)}
                data-testid="hero-rating"
                className="mt-3 flex flex-col items-start gap-1 text-[11px] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 text-muted sm:mt-5 sm:text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-fg">{slide.rating}</span>
                  <span aria-hidden className="flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className="h-3 w-3 fill-current sm:h-4 sm:w-4"
                        strokeWidth={0}
                      />
                    ))}
                  </span>
                  <span className="sr-only">{slide.rating} de 5 estrellas</span>
                </span>
                <span>
                  {slide.reviewCount} {slide.reviewLabel}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
      {count > 1 && (
        <div
          role="group"
          aria-label="Diapositivas"
          className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 sm:bottom-4"
        >
          {slides.map((sl, i) => (
            <button
              key={sl.id}
              type="button"
              aria-label={`Ir a la diapositiva ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
