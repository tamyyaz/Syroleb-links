import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin panel and its API surface have no reason to be indexed —
        // matches the noindex already set on the /admin layout's own
        // metadata, just enforced at the crawler level too.
        disallow: ["/admin", "/api"]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
