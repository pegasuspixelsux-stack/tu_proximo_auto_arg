"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { FAQS } from "../data/faqs";

function FaqItem({
  id,
  question,
  answer,
  open,
  onToggle,
}: {
  id: string;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex w-full items-start justify-between gap-4 py-4 text-left text-sm font-semibold text-fg transition-colors duration-150 max-md:pointer-events-none md:py-5 md:text-base md:hover:text-muted"
        >
          {question}
          <ChevronDown
            aria-hidden
            strokeWidth={1.75}
            className={`mt-0.5 hidden h-5 w-5 shrink-0 text-muted transition-transform duration-200 md:block ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h3>
      {/* Mobile lists every answer; from md up the item is an accordion. */}
      <div
        id={id}
        role="region"
        className={`grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "md:grid-rows-[1fr]" : "md:grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted md:pb-5">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  // Mobile: the whole section collapses. Desktop: one answer open at a time.
  const [sectionOpen, setSectionOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Expand when a link or the URL points at this section (collapsed on mobile).
  useEffect(() => {
    const expand = () => {
      if (window.location.hash === "#preguntas-frecuentes") {
        setSectionOpen(true);
      }
    };
    expand();
    window.addEventListener("hashchange", expand);
    return () => window.removeEventListener("hashchange", expand);
  }, []);

  return (
    <section
      id="preguntas-frecuentes"
      data-testid="faq-section"
      aria-labelledby="faq-heading"
      className="scroll-mt-4 md:px-3 md:py-12 lg:px-6 lg:py-16"
    >
      <button
        type="button"
        aria-expanded={sectionOpen}
        aria-controls="faq-content"
        data-testid="faq-toggle"
        onClick={() => setSectionOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 border-y border-line px-3 py-4 text-left md:hidden"
      >
        <span className="text-xs font-medium uppercase tracking-widest text-fg">
          Preguntas frecuentes
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className={`h-5 w-5 shrink-0 text-muted transition-transform duration-200 ${sectionOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id="faq-content"
        className={sectionOpen ? "px-3 pb-10 pt-8 md:p-0" : "hidden md:block"}
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="hidden text-xs font-semibold uppercase tracking-widest text-muted md:block">
            Preguntas frecuentes
          </p>
          <h2
            id="faq-heading"
            className="text-balance text-3xl font-semibold tracking-[-0.02em] md:mt-2 lg:text-4xl"
          >
            Todo lo que necesitás saber antes de visitarnos
          </h2>
        </div>

        <div className="mx-auto mt-8 max-w-[1000px] md:mt-10">
          {FAQS.map((faq, i) => (
            <FaqItem
              key={faq.question}
              id={`faq-answer-${i}`}
              {...faq}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
