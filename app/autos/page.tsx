import type { Metadata } from "next";
import JsonLd, { breadcrumbs } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/seo";
import FAQSection from "../components/FAQSection";
import FinanceCalculator from "../components/FinanceCalculator";
import FinancingSection from "../components/FinancingSection";
import Footer from "../components/Footer";
import SeoIntro from "../components/SeoIntro";
import SiteHeader from "../components/SiteHeader";
import { getSiteSettings } from "../data/site-store";
import { getVehicles } from "../data/vehicle-store";
import InventoryBrowser from "./InventoryBrowser";

export const metadata: Metadata = {
  title: "Autos usados en venta en Zona Norte y CABA",
  description:
    "Explorá todos los autos usados en venta en Tigre, Zona Norte, Buenos Aires y CABA. Filtrá por marca, precio, año y kilometraje, y financiá con tarjeta.",
  alternates: { canonical: "/autos" },
};

export default async function InventoryPage() {
  const [vehicles, { whatsappNumber, calculatorCurrency }] = await Promise.all([
    getVehicles(),
    getSiteSettings(),
  ]);
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Autos usados", url: absoluteUrl("/autos") },
        ])}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] bg-bg px-3 pb-6 text-fg md:pb-12 lg:px-6">
        <InventoryBrowser vehicles={vehicles} />
      </main>
      <div className="mx-auto w-full max-w-[1440px] bg-bg text-fg">
        <SeoIntro />
        <FinancingSection whatsappNumber={whatsappNumber} />
        <FinanceCalculator defaultCurrency={calculatorCurrency} />
        <FAQSection />
        <Footer />
      </div>
    </>
  );
}
