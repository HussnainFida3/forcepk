import Link from "next/link";
import Logo from "./Logo";

const cols = [
  { h: "For Employers", links: [["Post Requirement", "/employers#post"], ["Find Manpower", "/employers"], ["How It Works", "/#how"], ["Employer Login", "/login"]] },
  { h: "For Candidates", links: [["Find Jobs", "/jobs"], ["Verified Employers", "/directory"], ["Create Profile", "/register"], ["Candidate Login", "/login"]] },
  { h: "For Partners", links: [["Become an OEP Partner", "/partners"], ["Partner Login", "/login"], ["Job Marketplace", "/partners#marketplace"]] },
  { h: "Company", links: [["About Us", "/about"], ["Contact", "/about#contact"], ["Ethical Recruitment", "/ethical-recruitment"], ["Refund & Replacement", "/refund-policy"]] },
  { h: "Legal", links: [["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"], ["Cookie Policy", "/cookies"]] },
] as const;

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-fp grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm text-white/60">
            Connecting employers worldwide with verified global talent. Skilled. Trusted. Ready to deploy.
          </p>
          <address className="mt-5 space-y-2 text-sm not-italic text-white/60">
            <a href="https://maps.google.com/?q=7901+4th+St+N+%2316960,+St.+Petersburg,+FL+33702" target="_blank" rel="noreferrer" className="flex items-start gap-2 transition hover:text-brand-light">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <span>7901 4th St N #16960,<br />St. Petersburg, FL 33702</span>
            </a>
            <a href="tel:+17274168796" className="flex items-center gap-2 transition hover:text-brand-light">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" /></svg>
              <span>+1 727 416 8796</span>
            </a>
          </address>
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
          <p className="text-xs text-white/50">
            Made by{" "}
            <a href="https://canfida.com" target="_blank" rel="noreferrer" className="font-semibold text-brand-light transition hover:text-white">
              Canfida
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
