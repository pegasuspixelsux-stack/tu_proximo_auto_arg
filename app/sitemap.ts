import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getVehicles } from "./data/vehicle-store";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Request-time: a prerendered sitemap kept deleted listings and missed new ones.
  await connection();
  const vehicles = await getVehicles();
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/autos"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/terminos"), changeFrequency: "yearly" as const, priority: 0.2 },
    { url: absoluteUrl("/privacidad"), changeFrequency: "yearly" as const, priority: 0.2 },
    { url: absoluteUrl("/cookies"), changeFrequency: "yearly" as const, priority: 0.2 },
    { url: absoluteUrl("/soporte"), changeFrequency: "yearly" as const, priority: 0.2 },
    ...vehicles.map((v) => ({
      url: absoluteUrl(`/autos/${v.id}`),
      lastModified: v.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
