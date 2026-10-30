import type { Metadata } from "next";
import JsonLd, { breadcrumbs } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/seo";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import { getVehicles } from "../data/vehicle-store";
import InventoryBrowser from "./InventoryBrowser";

export const metadata: Metadata = {
  title: "Autos usados en venta en Buenos Aires",
  description:
    "Explorá todos los autos usados verificados en venta en Buenos Aires y Zona Norte. Filtrá por marca, precio, año y kilometraje, y financiá con tarjeta.",
  alternates: { canonical: "/autos" },
};

export default async function InventoryPage() {
  const vehicles = await getVehicles();
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Inicio", url: absoluteUrl("/") },
          { name: "Autos usados", url: absoluteUrl("/autos") },
        ])}
      />
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] bg-bg px-3 pb-24 text-fg lg:px-6">
        <InventoryBrowser vehicles={vehicles} />
      </main>
      <div className="mx-auto w-full max-w-[1440px]">
        <Footer />
      </div>
    </>
  );
}
