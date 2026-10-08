import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { getLocale, dirFor } from "@/lib/i18n";
import WhatsAppButton from "@/components/WhatsAppButton";
import CookieConsent from "@/components/CookieConsent";

// Body: Plus Jakarta Sans (smooth, modern, highly readable).
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
// Headings: Sora (geometric, premium, eye-catching).
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://forcepk.com"),
  title: {
    default: "ForcePK — Hire Verified Global Talent, Anywhere",
    template: "%s | ForcePK",
  },
  description:
    "ForcePK connects employers worldwide with verified, skilled and professional manpower through a trusted OEP partner network — sourcing, screening, interviews, documentation and deployment.",
  openGraph: {
    title: "ForcePK — Verified Global Workforce, Worldwide",
    description:
      "Skilled, semi-skilled and professional manpower for employers worldwide. Fast. Secure. Reliable.",
    url: "https://forcepk.com",
    siteName: "ForcePK",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} dir={dirFor(locale)} className={`${sans.variable} ${display.variable}`}>
      <body>{children}<WhatsAppButton /><CookieConsent /></body>
    </html>
  );
}
