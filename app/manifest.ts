import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Immigroov Bug Board",
    short_name: "Bug Board",
    description: "Track and triage bugs and tasks for the Immigroov test group",
    start_url: "/board",
    display: "standalone",
    background_color: "#f4f5f9",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
