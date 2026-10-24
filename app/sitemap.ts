import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/siteUrl";

const SITE_URL = getSiteUrl();

const STATIC_PATHS = ["", "/gallery", "/about", "/contact", "/careers"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7
    }))
  );
}
