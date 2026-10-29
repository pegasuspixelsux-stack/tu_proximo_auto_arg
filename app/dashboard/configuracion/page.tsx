import { getHeroSlides } from "../../data/hero-store";
import { getSiteSettings } from "../../data/site-store";
import CurrencySetting from "../CurrencySetting";
import HeroSlidesEditor from "../HeroSlidesEditor";
import WhatsappSetting from "../WhatsappSetting";

// Behind AuthGuard (renders nothing until the session is confirmed), so this
// admin page can't be an instant navigation.
export const instant = false;

export default async function ConfiguracionPage() {
  const [heroSlides, site] = await Promise.all([
    getHeroSlides(),
    getSiteSettings(),
  ]);
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
          Configuración
        </h1>
        <p className="mt-2 text-sm text-muted">
          Ajustes del sitio público: contacto, moneda y portada del inicio
        </p>
      </header>
      <WhatsappSetting initial={site.whatsappNumber} />
      <CurrencySetting
        initialCurrency={site.currency}
        initialRate={site.arsRate}
      />
      <HeroSlidesEditor initial={heroSlides} />
    </main>
  );
}
