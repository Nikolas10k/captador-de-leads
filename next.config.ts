import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // O sistema é só o painel: a raiz abre o painel (ou o login).
  async redirects() {
    return [{ source: "/", destination: "/painel", permanent: false }];
  },
};

export default nextConfig;
