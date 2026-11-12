import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        // Hero photos are static files: let browsers and the CDN keep them for a day.
        source: "/hero_image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Canonical host is www; Vercel already forces HTTPS.
      {
        source: "/:path*",
        has: [{ type: "host", value: "tuproximoauto.online" }],
        destination: "https://www.tuproximoauto.online/:path*",
        permanent: true,
      },
      // The public dealership directory and dealer pages are hidden (the dashboard still manages
      // dealerships). Remove this redirect to bring /concesionarias back.
      { source: "/concesionarias", destination: "/autos", permanent: false },
      { source: "/concesionarias/:slug", destination: "/autos", permanent: false },
      {
        source: "/dashboard/leads",
        destination: "/dashboard/interesados",
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/4soxndpvzw/**" },
    ],
  },
  turbopack: {
    // Pin the root: a stray package-lock.json in a parent folder makes Next infer the wrong one.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
