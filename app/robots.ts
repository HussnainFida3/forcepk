import type { MetadataRoute } from "next";

const base = process.env.NEXTAUTH_URL ?? "https://forcepk.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/employer", "/partner", "/candidate", "/messages", "/notifications", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
