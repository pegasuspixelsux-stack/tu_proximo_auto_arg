import type { Metadata } from "next";
import Footer from "../components/Footer";
import SiteHeader from "../components/SiteHeader";
import { getVehicles } from "../data/vehicle-store";
import InventoryBrowser from "./InventoryBrowser";

export const metadata: Metadata = {
  title: "Todos los avisos | Tu Próximo Auto - Argentina",
  description:
    "Explorá el inventario completo de vehículos verificados y filtrá por marca, precio, año, kilometraje y más.",
};

export default async function InventoryPage() {
  const vehicles = await getVehicles();
  return (
    <>
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
