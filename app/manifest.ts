import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dadda's Confectionery",
    short_name: "Dadda's",
    description:
      "Custom cakes, cupcakes, scones and chocolate Popsticles baked from scratch in Amandasig, Pretoria.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8ef",
    theme_color: "#7d562d",
    lang: "en-ZA",
    icons: [
      {
        src: "/images/dadda-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/dadda-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
