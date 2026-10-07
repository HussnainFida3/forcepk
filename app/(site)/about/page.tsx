import Icon from "@/components/Icon";
import { stats } from "@/lib/data";
import { createPublicLead } from "@/lib/mutations";

export const metadata = { title: "About ForcePK" };

const values = [
  ["shield", "Trust & Compliance", "We follow applicable local and international recruitment requirements, and never expose sensitive candidate documents publicly."],
  ["users", "Right People", "We match candidates to the actual job — skilled, screened and ready to perform, not just the cheapest option."],
  ["handshake", "Long-Term Partnership", "We become your continuous global recruitment desk, not a one-time supplier."],
];

export default function AboutPage({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <>
      <section className="bg-navy py-16 text-white">
        <div className="container-fp max-w-3xl">
          <span className="chip bg-brand/20 text-brand-light">About ForcePK</span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Your trusted bridge between global talent and opportunity</h1>
          <p className="mt-4 text-white/70">
            ForcePK is a B2B manpower recruitment ecosystem connecting employers worldwide with verified
            candidates through a trusted OEP partner network — covering sourcing, screening, interviews, documentation,
            deployment and post-placement support. We complement official government systems rather than replace them.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-fp grid gap-5 sm:grid-cols-3">
          {values.map(([ic, t, d]) => (
            <div key={t} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon name={ic} className="h-6 w-6" /></span>
              <h3 className="mt-4 font-semibold text-navy">{t}</h3>
              <p className="mt-2 text-sm text-navy/60">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-50 py-12">
        <div className="container-fp grid gap-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold text-brand">{s.value}</div>
              <div className="mt-1 text-sm text-navy/60">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="section">
        <div className="container-fp grid gap-10 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Contact</span>
            <h2 className="mt-2 h2">Let&apos;s build your team together</h2>
            <p className="mt-3 text-navy/60">Share your manpower requirement today and get a tailored recruitment solution.</p>
            <div className="mt-6 space-y-3 text-sm text-navy/75">
              <p className="flex items-center gap-3"><Icon name="globe" className="h-5 w-5 text-brand" /> www.forcepk.com</p>
              <p className="flex items-center gap-3"><Icon name="chat" className="h-5 w-5 text-brand" /> hello@forcepk.com</p>
              <p className="flex items-center gap-3"><Icon name="whatsapp" className="h-5 w-5 text-brand" /> WhatsApp — Available Worldwide</p>
            </div>
          </div>
          {searchParams?.sent ? (
            <div className="card flex flex-col items-center justify-center gap-2 p-10 text-center">
              <Icon name="check-circle" className="h-10 w-10 text-brand" />
              <p className="font-semibold text-navy">Message received!</p>
              <p className="text-sm text-navy/60">Thank you — our team will get back to you within 24 hours.</p>
            </div>
          ) : (
          <form action={createPublicLead} className="card grid gap-4 p-6 sm:grid-cols-2">
            <input type="hidden" name="returnTo" value="/about" />
            <input name="name" placeholder="Your name" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <input name="company" placeholder="Company" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <input name="email" type="email" placeholder="Email" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <input name="phone" placeholder="Phone / WhatsApp" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <textarea name="message" rows={4} placeholder="Tell us what workforce you need…" className="sm:col-span-2 rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <button className="btn-primary sm:col-span-2">Send Message <Icon name="arrow" className="h-4 w-4" /></button>
          </form>
          )}
        </div>
      </section>
    </>
  );
}
