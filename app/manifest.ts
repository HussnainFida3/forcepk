import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ForcePK — Global Workforce Platform",
    short_name: "ForcePK",
    description: "Hire verified global talent, anywhere.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C2340",
    theme_color: "#16A34A",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png" }],
  };
}
