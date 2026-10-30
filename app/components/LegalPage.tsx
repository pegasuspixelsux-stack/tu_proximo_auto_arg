import type { ReactNode } from "react";
import JsonLd, { breadcrumbs } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/seo";
import Footer from "./Footer";
import SiteHeader from "./SiteHeader";

/** Highlights a value the owner still has to provide (company data, contact details). */
export function Todo({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-brand/30 px-1 text-fg">[A completar: {children}]</mark>;
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold tracking-[-0.01em]">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

/** Shared shell for the plain-text pages linked from the footer. */
export default function LegalPage({
  path,
  title,
  intro,
  children,
}: {
  path: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: title, url: absoluteUrl(path) },
        ])}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl bg-bg px-3 pb-24 pt-12 text-fg lg:px-6">
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] lg:text-5xl">
          {title}
        </h1>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
        {children}
      </main>
      <div className="mx-auto w-full max-w-[1440px]">
        <Footer />
      </div>
    </>
  );
}
