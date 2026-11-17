/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  // Playwright is a heavy, native package loaded only at runtime (lazy dynamic
  // import in the lead-gen Google Maps scraper). Keep Next from bundling/tracing
  // it so the build stays clean and it resolves from node_modules on the server.
  experimental: {
    serverComponentsExternalPackages: ["playwright", "playwright-core"],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      // HSTS is honoured only over HTTPS; harmless on http localhost.
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    ];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
