import { FAQS } from "@/app/data/faqs";
import type { Vehicle } from "@/app/data/vehicles";
import { absoluteUrl, BUSINESS, SITE_NAME } from "@/lib/seo";

const KM_PER_MILE = 1.60934;

const FUEL: Record<Vehicle["fuelType"], string> = {
  Electric: "Eléctrico",
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Diesel: "Diésel",
};

/** Organization + AutoDealer. Unknown facts (street, hours, geo) are left out, see lib/seo.ts. */
export function organizationSchema(whatsappNumber: string) {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "AutoDealer"],
    "@id": absoluteUrl("/#organization"),
    name: `${SITE_NAME} Argentina`,
    alternateName: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon"),
    image: absoluteUrl("/opengraph-image"),
    telephone: `+${whatsappNumber}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.locality,
      addressRegion: BUSINESS.region,
      addressCountry: BUSINESS.country,
    },
    areaServed: BUSINESS.areaServed.map((name) => ({ "@type": "Place", name })),
    ...(BUSINESS.sameAs.length > 0 && { sameAs: BUSINESS.sameAs }),
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function vehicleSchema(vehicle: Vehicle, description: string) {
  const url = absoluteUrl(`/autos/${vehicle.id}`);
  return {
    "@context": "https://schema.org",
    "@type": ["Vehicle", "Car"],
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    url,
    description,
    image: vehicle.images?.length ? vehicle.images : [vehicle.image],
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    bodyType: vehicle.bodyType,
    fuelType: FUEL[vehicle.fuelType],
    vehicleTransmission: vehicle.transmission,
    ...(vehicle.color && { color: vehicle.color }),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: Math.round(vehicle.mileage * KM_PER_MILE),
      unitCode: "KMT",
    },
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      price: vehicle.price,
      priceCurrency: vehicle.priceCurrency ?? "USD",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@id": absoluteUrl("/#organization") },
    },
  };
}
