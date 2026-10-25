import { getHeroSlides } from "../data/hero-store";
import { getSiteSettings } from "../data/site-store";
import Overview from "./Overview";

export default async function DashboardPage() {
  const heroSlides = await getHeroSlides();
  const site = await getSiteSettings();
  return <Overview heroSlides={heroSlides} whatsappNumber={site.whatsappNumber} />;
}
