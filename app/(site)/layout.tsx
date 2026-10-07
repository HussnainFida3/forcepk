import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getLocale } from "@/lib/i18n";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
