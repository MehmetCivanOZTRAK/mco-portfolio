import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site-config";
import { readPortfolioContent } from "@/lib/content-store";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const content = await readPortfolioContent();
  const iconUrl = content.branding.faviconUrl;

  return {
    name: SITE_NAME,
    short_name: "MCO Portfolyo",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#0a090c",
    theme_color: "#9b6cff",
    lang: "tr",
    icons: iconUrl ? [{ src: iconUrl, sizes: "any" }] : [
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
