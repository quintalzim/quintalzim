import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quintalzim",
    short_name: "Quintalzim",
    description: "O portal por assinatura da sua cidade, do jeito do interior.",
    start_url: "/app/inicio",
    display: "standalone",
    background_color: "#FBF7EC",
    theme_color: "#3F6B34",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
