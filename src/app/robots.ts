import type { MetadataRoute } from "next";

const SITE_URL = "https://lumina.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/profile",
          "/connections",
          "/quiz",
          "/session",
          "/report",
          "/evolution",
          "/settings",
          "/onboarding",
          "/admin",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
