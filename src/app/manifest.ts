import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "asystem.ai — Независимая AI-first IT-студия",
    short_name: "asystem.ai",
    description:
      "Разработка AI-решений и веб-платформ для бизнеса СНГ. 4× быстрее рынка, без предоплаты, по FIX-цене.",
    start_url: "/ru",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563EB",
    lang: "ru",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
