import type { MetadataRoute } from "next";

// Next.js samodejno postreže to na /manifest.webmanifest in doda <link rel="manifest">.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viharnik – gorska vremenska napoved",
    short_name: "Viharnik",
    description: "Pregledna gorska vremenska napoved po podatkih ARSO",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0b1a",
    theme_color: "#0a0b1a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
