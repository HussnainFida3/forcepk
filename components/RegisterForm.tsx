"use client";

import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { registerAccount } from "@/lib/mutations";
import {
  Building2, Users, UserCheck, ShieldCheck, ArrowRight, Briefcase,
} from "lucide-react";

type Kind = "employer" | "oep" | "candidate";

const META: Record<Kind, {
  title: string; titleBr: string; sub: string;
  banner: string; accent: string;
  steps: [string, string, string];
}> = {
  employer: {
    title: "Register as an", titleBr: "Employer",
    sub: "Submit your company's workforce requirements and connect with suitable recruitment partners.",
    banner: "/assets/employer-banner.webp", accent: "#082952",
    steps: ["Company Details", "Contact & Requirements", "Review & Submit"],
  },
  oep: {
    title: "Register as an", titleBr: "OEP Partner",
    sub: "Register your licensed organization, share recruitment capabilities and explore relevant employer requirements.",
    banner: "/assets/oep-banner.webp", accent: "#008e8c",
    steps: ["Organization Details", "Licence & Capabilities", "Review & Submit"],
  },
  candidate: {
    title: "Register as a", titleBr: "Candidate",
    sub: "Create your profile, upload your CV and explore relevant job opportunities.",
    banner: "/assets/candidate-banner.webp", accent: "#0968bd",
    steps: ["Personal Details", "Experience & Skills", "Review & Submit"],
  },
};

export default function RegisterForm({ kind }: { kind: Kind }) {
  const m = META[kind];
  return (
    <main className="form-shell py-6" style={{ "--accent": m.accent } as React.CSSProperties}>
      {/* Back link */}
      <div className="px-3 mb-3">
        <Link href="/" className="text-xs font-bold text-navy hover:text-brand">
          &#x2302;&ensp;Back to Home
        </Link>
      </div>

      {/* Banner */}
      <section className="codex-banner" style={{ "--photo": `url(${m.banner})` } as React.CSSProperties}>
        <h1>{m.title}<br />{m.titleBr}</h1>
        <p>{m.sub}</p>
      </section>

      {/* Progress steps */}
      <ol className="codex-progress">
        {m.steps.map((s, i) => (
          <li key={s}>
            <b>{i + 1}</b>
            {s}
          </li>
        ))}
      </ol>

      {/* Registration form */}
      <form action={registerAccount.bind(null, kind)} className="codex-form">

        {/* ── Section: Account Info (all roles) ── */}
        <section className="codex-fieldset">
          <h2>
            <UserCheck className="h-5 w-5" />
            Account Information
          </h2>
          <div className="codex-field-grid">
            <CField name="name" label="Your Name" required placeholder="Enter full name" />
            <CField name="email" label="Email" type="email" required placeholder="your@email.com" />
            <CField name="phone" label="Phone Number" placeholder="Enter phone number" />
            <PasswordInput name="password" label="Password" required minLength={6} withGenerate />
          </div>
        </section>

        {/* ── Employer-specific fields ── */}
        {kind === "employer" && (
          <>
            <section className="codex-fieldset">
              <h2>
                <Building2 className="h-5 w-5" />
                Company Information
              </h2>
              <div className="codex-field-grid">
                <CField name="company" label="Company Name" required placeholder="Enter company name" />
                <CField name="crNumber" label="Registration No." placeholder="e.g. CR-12345" />
                <CSelect name="industry" label="Industry / Sector" options={INDUSTRIES} />
                <CField name="city" label="City / Country" required placeholder="e.g. Riyadh, Saudi Arabia" />
              </div>
            </section>
          </>
        )}

        {/* ── OEP-specific fields ── */}
        {kind === "oep" && (
          <>
            <section className="codex-fieldset">
              <h2>
                <Building2 className="h-5 w-5" />
                Organization Information
              </h2>
              <div className="codex-field-grid">
                <CField name="company" label="Agency Name" required placeholder="Enter organization name" />
                <CField name="licenseNo" label="OEP Licence Number" required placeholder="e.g. 1234/RWP" />
                <CField name="licenseExpiry" label="Licence Expiry Date" type="date" />
                <CSelect name="city" label="Office City" options={CITIES} />
                <CField name="address" label="Office Address" placeholder="Street, area, city" wide />
                <CField name="countries" label="Countries of Interest" placeholder="e.g. Saudi Arabia, UAE, Canada" wide />
              </div>
            </section>
          </>
        )}

        {/* ── Candidate-specific fields ── */}
        {kind === "candidate" && (
          <>
            <section className="codex-fieldset">
              <h2>
                <Briefcase className="h-5 w-5" />
                Professional Information
              </h2>
              <div className="codex-field-grid">
                <CField name="profession" label="Profession" placeholder="e.g. Electrician, Welder" />
                <CField name="city" label="City / Country" placeholder="e.g. Lahore, Pakistan" />
              </div>
            </section>
          </>
        )}

        {/* Submit */}
        <button type="submit" className="codex-form-submit">
          Submit {kind === "employer" ? "Employer" : kind === "oep" ? "OEP" : "Candidate"} Registration
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="codex-form-note">
          <ShieldCheck className="h-4 w-4" />
          Your information will be used only for recruitment purposes and will be kept confidential.
        </p>

        <p className="mt-3 text-center text-xs text-navy/50">
          Already have an account? <Link href="/login" className="font-semibold text-brand">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

/* ── Shared field components ── */

function CField({ name, label, type = "text", required, placeholder, wide }: {
  name: string; label: string; type?: string; required?: boolean; placeholder?: string; wide?: boolean;
}) {
  return (
    <label className={`codex-field ${wide ? "wide" : ""}`}>
      <span>{label}{required && <strong> *</strong>}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} />
    </label>
  );
}

function CSelect({ name, label, options, required }: {
  name: string; label: string; options: string[]; required?: boolean;
}) {
  return (
    <label className="codex-field">
      <span>{label}{required && <strong> *</strong>}</span>
      <select name={name} required={required}>
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

const INDUSTRIES = [
  "Construction & Engineering", "Healthcare & Medical", "IT & Technology",
  "Hospitality & Tourism", "Manufacturing & Production", "Transport & Logistics",
  "Skilled Trades", "Administration & Office Support", "Other",
];

const CITIES = [
  "Islamabad", "Rawalpindi", "Lahore", "Karachi",
  "Peshawar", "Quetta", "Multan", "Other",
];
