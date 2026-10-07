import Link from "next/link";
import Logo from "./Logo";

const cols = [
  { h: "For Employers", links: [["Post Requirement", "/employers#post"], ["Find Manpower", "/employers"], ["How It Works", "/#how"], ["Employer Login", "/login"]] },
  { h: "For Candidates", links: [["Find Jobs", "/jobs"], ["Verified Employers", "/directory"], ["Create Profile", "/register"], ["Candidate Login", "/login"]] },
  { h: "For Partners", links: [["Become an OEP Partner", "/partners"], ["Partner Login", "/login"], ["Job Marketplace", "/partners#marketplace"]] },
  { h: "Company", links: [["About Us", "/about"], ["Contact", "/about#contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-fp grid gap-10 py-14 md:grid-cols-5">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm text-white/60">
            Connecting Saudi employers with verified Pakistani talent. Skilled. Trusted. Ready to work.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="text-sm font-semibold text-white">{c.h}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-white/60 transition hover:text-brand-light">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-fp flex flex-col items-center justify-between gap-3 py-6 sm:flex-row">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} ForcePK · forcepk.com — Your trusted partner in global workforce solutions.</p>
          <p className="text-xs text-white/50">Pakistan 🇵🇰 → Saudi Arabia 🇸🇦 · Global Workforce</p>
        </div>
      </div>
    </footer>
  );
}
