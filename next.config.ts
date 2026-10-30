import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      // Canonical host is www; Vercel already forces HTTPS.
      {
        source: "/:path*",
        has: [{ type: "host", value: "tuproximoauto.online" }],
        destination: "https://www.tuproximoauto.online/:path*",
        permanent: true,
      },
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
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
