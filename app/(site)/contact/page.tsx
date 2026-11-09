import Icon from "@/components/Icon";
import { createPublicLead } from "@/lib/mutations";
import FraudWarning from "@/components/FraudWarning";

export const metadata = { title: "Contact ForcePK" };

const INFO = [
  { icon: "globe", label: "Website", value: "www.forcepk.com", href: "https://forcepk.com" },
  { icon: "chat", label: "Email", value: "hello@forcepk.com", href: "mailto:hello@forcepk.com" },
  { icon: "phone", label: "Phone", value: "+92 306 066 2200", href: "tel:+923060662200" },
  { icon: "whatsapp", label: "WhatsApp", value: "+92 306 066 2200", href: "https://wa.me/923060662200" },
  { icon: "pin", label: "Location", value: "Lahore, Pakistan", href: null },
] as const;

export default function ContactPage({ searchParams }: { searchParams: { sent?: string } }) {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy py-16 text-white">
        <div className="container-fp max-w-3xl text-center">
          <span className="chip bg-brand/20 text-brand-light">Contact Us</span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Get in touch with ForcePK</h1>
          <p className="mt-4 text-white/70">
            Have a manpower requirement, partnership inquiry or question? We&apos;d love to hear from you.
            Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact info + form grid */}
      <section className="section">
        <div className="container-fp grid gap-10 lg:grid-cols-2">
          {/* Left: info */}
          <div>
            <h2 className="h2">Let&apos;s build your team together</h2>
            <p className="mt-3 text-navy/60">
              Whether you&apos;re an employer looking for verified manpower, a recruitment agency
              wanting to join our partner network, or a candidate exploring opportunities —
              reach out and we&apos;ll guide you.
            </p>

            <div className="mt-8 space-y-4">
              {INFO.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy/40">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="font-medium text-navy transition hover:text-brand">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium text-navy">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Business hours */}
            <div className="mt-8 rounded-xl border border-navy/10 bg-navy-50 p-5">
              <h3 className="flex items-center gap-2 font-semibold text-navy">
                <Icon name="clock" className="h-5 w-5 text-brand" /> Business Hours
              </h3>
              <div className="mt-3 space-y-1 text-sm text-navy/60">
                <p>Monday – Saturday: 9:00 AM – 6:00 PM (PKT)</p>
                <p>Sunday: Closed</p>
                <p className="mt-2 text-navy/75 font-medium">WhatsApp inquiries are monitored 7 days a week.</p>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div>
            {searchParams?.sent ? (
              <div className="card flex flex-col items-center justify-center gap-3 p-10 text-center">
                <Icon name="check-circle" className="h-12 w-12 text-brand" />
                <p className="text-lg font-semibold text-navy">Message received!</p>
                <p className="text-sm text-navy/60">Thank you — our team will get back to you within 24 hours.</p>
                <a href="/contact" className="btn-outline mt-2">Send another message</a>
              </div>
            ) : (
              <form action={createPublicLead} className="card grid gap-4 p-6 sm:grid-cols-2">
                <input type="hidden" name="returnTo" value="/contact" />
                <div className="sm:col-span-2">
                  <h3 className="text-lg font-semibold text-navy">Send us a message</h3>
                  <p className="mt-1 text-sm text-navy/60">Fill in the form and we&apos;ll get back to you promptly.</p>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-navy/70">Your Name</span>
                  <input name="name" placeholder="e.g. Muhammad Ali" required className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-navy/70">Company / Organization</span>
                  <input name="company" placeholder="e.g. Acme Construction" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-navy/70">Email</span>
                  <input name="email" type="email" placeholder="you@company.com" required className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-navy/70">Phone / WhatsApp</span>
                  <input name="phone" placeholder="+92 300 000 0000" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                </label>
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-navy/70">How can we help?</span>
                  <select name="source" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
                    <option value="Contact — General">General Inquiry</option>
                    <option value="Contact — Employer">I&apos;m an employer looking for manpower</option>
                    <option value="Contact — OEP Partner">I&apos;m a recruitment agency / OEP</option>
                    <option value="Contact — Candidate">I&apos;m a candidate looking for work</option>
                    <option value="Contact — Partnership">Partnership / Business Inquiry</option>
                    <option value="Contact — Other">Other</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-xs font-medium text-navy/70">Message</span>
                  <textarea name="message" rows={5} placeholder="Tell us about your requirement, question, or how we can help…" required className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
                </label>
                <button className="btn-primary sm:col-span-2">
                  Send Message <Icon name="arrow" className="h-4 w-4" />
                </button>
                <p className="text-xs text-navy/40 sm:col-span-2">
                  By submitting, you agree to our <a href="/privacy" className="underline">Privacy Policy</a>. We&apos;ll never share your details with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <FraudWarning />
    </>
  );
}
