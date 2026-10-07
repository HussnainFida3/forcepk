import type { MetadataRoute } from "next";

const base = process.env.NEXTAUTH_URL ?? "https://forcepk.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = ["", "/jobs", "/employers", "/partners", "/directory", "/about", "/login", "/register", "/privacy", "/terms"];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: r === "" || r === "/jobs" ? "daily" : "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
