"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { registerAccount } from "@/lib/mutations";

const tabs = [
  { key: "employer", label: "Employer" },
  { key: "oep", label: "Recruitment Partner" },
  { key: "candidate", label: "Candidate" },
] as const;

type Kind = (typeof tabs)[number]["key"];

export default function RegisterPage() {
  const [kind, setKind] = useState<Kind>("employer");
  return (
    <section className="section">
      <div className="container-fp max-w-xl">
        <div className="text-center">
          <span className="eyebrow">Create account</span>
          <h1 className="mt-2 h2">Join ForcePK</h1>
          <p className="mt-3 text-navy/60">Register as an employer, recruitment partner or candidate.</p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-1 rounded-lg bg-navy-50 p-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setKind(t.key)}
              className={`rounded-md py-2 text-xs font-semibold transition ${kind === t.key ? "bg-white text-brand shadow-sm" : "text-navy/60"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <form action={registerAccount.bind(null, kind)} className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <Field name="name" label="Your name" required />
          <Field name="email" label="Email" type="email" required />
          <Field name="phone" label="Mobile" />
          <Field name="password" label="Password" type="password" required />

          {kind === "employer" && <>
            <Field name="company" label="Company name" required />
            <Field name="crNumber" label="Registration no." />
            <Field name="industry" label="Industry" />
            <Field name="city" label="City / Country" />
          </>}
          {kind === "oep" && <>
            <Field name="company" label="Agency name" required />
            <Field name="licenseNo" label="License no." />
            <Field name="city" label="City / Country" />
          </>}
          {kind === "candidate" && <>
            <Field name="profession" label="Profession" />
            <Field name="city" label="City / Country" />
          </>}

          <div className="sm:col-span-2 mt-2">
            <button className="btn-primary w-full">Create account <Icon name="arrow" className="h-4 w-4" /></button>
            <p className="mt-3 text-center text-xs text-navy/50">
              Already have an account? <Link href="/login" className="font-semibold text-brand">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-navy/70">{label}{required && " *"}</span>
      <input name={name} type={type} required={required}
        className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
    </label>
  );
}
