import type { Metadata } from "next";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import { SAMPLE_VEHICLES } from "../data/vehicles";
import InventoryBrowser from "./InventoryBrowser";

export const metadata: Metadata = {
  title: "Todos los avisos | Tu Próximo Auto - Argentina",
  description:
    "Explorá el inventario completo de vehículos verificados y filtrá por marca, precio, año, kilometraje y más.",
};

export default function InventoryPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1440px] bg-bg px-3 pb-24 text-fg lg:px-6">
        <InventoryBrowser vehicles={SAMPLE_VEHICLES} />
      </main>
      <div className="mx-auto w-full max-w-[1440px]">
        <Footer />
      </div>
    </>
  );
}
