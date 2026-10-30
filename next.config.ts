import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Next 16 solo permite q=75 por defecto; 85 se usa en el visor (lightbox) de la galería
    qualities: [75, 85],
    // 30 días: las imágenes del catálogo no cambian de contenido con el mismo nombre
    minimumCacheTTL: 2592000,
    // AVIF descartado: su codificación es muy lenta para la CPU del VPS
    formats: ["image/webp"],
  },
};

export default nextConfig;
