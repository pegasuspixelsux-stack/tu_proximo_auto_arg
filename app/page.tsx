import type { Metadata } from "next";
import AnnouncementBar from "./components/AnnouncementBar";
import SiteHeader from "./components/SiteHeader";
import Catalog from "./components/Catalog";
import ConversionCTA from "./components/ConversionCTA";
import FAQSection from "./components/FAQSection";
import FinanceCalculator from "./components/FinanceCalculator";
import FinancingCallout from "./components/FinancingCallout";
import FinancingSection from "./components/FinancingSection";
import Footer from "./components/Footer";
import JsonLd from "@/lib/json-ld";
import { faqSchema, organizationSchema } from "@/lib/schema";
import Hero from "./components/Hero";
import { getHeroSlides } from "./data/hero-store";
import { getSiteSettings } from "./data/site-store";
import { getHomepageVehicles } from "./data/vehicle-store";

export const metadata: Metadata = {
  title: { absolute: "Autos usados en Tigre y Buenos Aires | Tu Próximo Auto" },
  alternates: { canonical: "/" },
};

export default async function Home() {
  const [slides, site, vehicles] = await Promise.all([
    getHeroSlides(),
    getSiteSettings(),
    getHomepageVehicles(),
  ]);
  return (
    <>
      <JsonLd data={organizationSchema(site.whatsappNumber)} />
      <JsonLd data={faqSchema()} />
      <AnnouncementBar />
      <SiteHeader />
      <Hero slides={slides} />
      <main className="mx-auto min-h-screen w-full max-w-[1440px] bg-bg text-fg selection:bg-fg selection:text-bg">
        <Catalog vehicles={vehicles} />
        <FinancingCallout
          whatsappNumber={site.whatsappNumber}
          imageSrc="/banner_image/mother_kids.webp"
        />
        <FinancingSection whatsappNumber={site.whatsappNumber} />
        <FinanceCalculator defaultCurrency={site.calculatorCurrency} />
        <FAQSection />
        <ConversionCTA whatsappNumber={site.whatsappNumber} />
        <Footer />
      </main>
    </>
  );
}
