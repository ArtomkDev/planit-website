import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlanIt — Class Schedule",
    short_name: "PlanIt",
    description: "A clear class schedule for Android and the web.",
    start_url: "/uk",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f45b8a",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
