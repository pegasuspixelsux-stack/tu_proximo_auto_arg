import type { MetadataRoute } from "next";
import { getActiveDealerships, getVehicles } from "./data/vehicle-store";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [vehicles, dealerships] = await Promise.all([
    getVehicles(),
    getActiveDealerships(),
  ]);
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/autos"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/concesionarias"), changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/terminos"), changeFrequency: "yearly" as const, priority: 0.2 },
    { url: absoluteUrl("/privacidad"), changeFrequency: "yearly" as const, priority: 0.2 },
    ...vehicles.map((v) => ({
      url: absoluteUrl(`/autos/${v.id}`),
      lastModified: v.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...dealerships.map((d) => ({
      url: absoluteUrl(`/concesionarias/${d.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
