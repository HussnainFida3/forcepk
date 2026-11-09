import Link from "next/link";
import Logo from "./Logo";

const cols = [
  { h: "For Employers", links: [["Post Requirement", "/employers#post"], ["Find Manpower", "/employers"], ["How It Works", "/#how"], ["Employer Login", "/login"]] },
  { h: "For OEP Partners", links: [["Become a Partner", "/partners"], ["Partner Login", "/login"], ["Recruitment Network", "/partners#marketplace"]] },
  { h: "For Candidates", links: [["Find Jobs", "/jobs"], ["Create Profile", "/register"], ["Candidate Login", "/login"]] },
  { h: "Company", links: [["About Us", "/about"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] },
] as const;

export default function Footer() {
  return (
    <footer className="footer-codex">
      <div className="container-fp grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Logo light />
          <p className="mt-4 text-sm text-[#8eacc4]">
            Connecting employers, recruitment partners and job seekers on one trusted platform.
          </p>
          <address className="mt-5 space-y-2 text-sm not-italic text-[#8eacc4]">
            <div className="flex items-start gap-2">
              <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.3-7-11a7 7 0 1 1 14 0c0 5.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
              <span>Lahore, Pakistan</span>
            </div>
            <a href="mailto:hello@forcepk.com" className="flex items-center gap-2 transition hover:text-brand-light">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              <span>hello@forcepk.com</span>
            </a>
          </address>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="text-sm font-semibold text-white">{c.h}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-[#8eacc4] transition hover:text-brand-light">
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
          <p className="text-xs text-[#6b8da8]">© {new Date().getFullYear()} ForcePK · forcepk.com — Your trusted partner in global workforce solutions.</p>
          <p className="text-xs text-[#6b8da8]">
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
