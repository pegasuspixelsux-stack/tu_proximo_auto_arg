import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} - Argentina`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: "es-AR",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/logo_folder/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
