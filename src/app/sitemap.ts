import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://planit-app.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/privacy", "/terms"];

  return routes.map((route) => ({
    url: `${baseUrl}/uk${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
    alternates: {
      languages: {
        en: `${baseUrl}/en${route}`,
        uk: `${baseUrl}/uk${route}`,
      },
    },
  }));
}