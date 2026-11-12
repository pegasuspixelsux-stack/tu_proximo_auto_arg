import type { Metadata } from "next";
import Link from "next/link";
import Footer from "./components/Footer";
import SiteHeader from "./components/SiteHeader";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[60vh] w-full max-w-[1440px] flex-col items-start justify-center gap-4 bg-bg px-3 text-fg lg:px-6">
        <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-5xl">
          No encontramos esta página
        </h1>
        <p className="text-muted">
          Puede que el aviso ya no esté disponible o que el enlace haya cambiado.
        </p>
        <Link href="/autos" className="text-sm font-medium underline underline-offset-4">
          Ver todos los autos usados en venta
        </Link>
      </main>
      <div className="mx-auto w-full max-w-[1440px]">
        <Footer />
      </div>
    </>
  );
}
