import AnnouncementBar from "./components/AnnouncementBar";
import SiteHeader from "./components/SiteHeader";
import Catalog from "./components/Catalog";
import ConversionCTA from "./components/ConversionCTA";
import FAQSection from "./components/FAQSection";
import FinanceCalculator from "./components/FinanceCalculator";
import FinancingSection from "./components/FinancingSection";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import { getHeroSlides } from "./data/hero-store";
import { getSiteSettings } from "./data/site-store";
import { getHomepageVehicles } from "./data/vehicle-store";

export default async function Home() {
  const [slides, site, vehicles] = await Promise.all([
    getHeroSlides(),
    getSiteSettings(),
    getHomepageVehicles(),
  ]);
  return (
    <>
      <AnnouncementBar />
      <SiteHeader />
      <Hero slides={slides} />
      <main className="mx-auto min-h-screen w-full max-w-[1440px] bg-bg text-fg selection:bg-fg selection:text-bg">
        <Catalog vehicles={vehicles} />
        <FinancingSection whatsappNumber={site.whatsappNumber} />
        <FinanceCalculator />
        <FAQSection />
        <ConversionCTA whatsappNumber={site.whatsappNumber} />
        <Footer />
      </main>
    </>
  );
}
