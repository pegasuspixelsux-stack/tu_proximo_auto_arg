import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Tu Próximo Auto - Argentina",
  robots: { index: false, follow: false },
};

const BACKGROUND =
  "/hero_image/audi_hero.webp";

export default function LoginPage() {
  return (
    <main className="force-dark relative grid min-h-screen grid-cols-1 overflow-hidden bg-black text-[#F5F5F7] md:grid-cols-2">
      <Image
        src={BACKGROUND}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 bg-black/45" />

      {/* Left column: the photo shows through. */}
      <div className="relative hidden items-end p-8 md:flex">
        <p className="font-mono text-xs text-[#86868B]">Tu Próximo Auto v1.0</p>
      </div>

      {/* Right column: dark backdrop with the form. */}
      <section className="relative flex min-h-screen flex-col border-l border-[#1C1C1E] bg-[#0D0D0E]/10 px-6 py-8 backdrop-blur-md sm:px-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-sm text-[#86868B] transition-colors duration-150 hover:text-[#F5F5F7]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Volver al sitio
        </Link>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-semibold tracking-[-0.02em]">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-sm text-[#86868B]">
            Accedé al panel de control interno de Tu Próximo Auto
          </p>
          <LoginForm />
        </div>

        <p className="text-center font-mono text-xs text-[#86868B] md:hidden">
          Tu Próximo Auto v1.0
        </p>
      </section>
    </main>
  );
}
