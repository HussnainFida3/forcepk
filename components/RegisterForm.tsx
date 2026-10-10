"use client";

import Link from "next/link";
import Icon from "@/components/Icon";
import { registerAccount } from "@/lib/mutations";

type Kind = "employer" | "oep" | "candidate";

const META: Record<Kind, { title: string; sub: string; icon: string }> = {
  employer: { title: "Employer sign up", sub: "Hire verified global manpower for your business.", icon: "building" },
  oep: { title: "Recruitment Partner sign up", sub: "Join our licensed OEP partner network and earn on every deployment.", icon: "handshake" },
  candidate: { title: "Candidate sign up", sub: "Build your profile and get matched with verified employers.", icon: "users" },
};

export default function RegisterForm({ kind }: { kind: Kind }) {
  const m = META[kind];
  return (
    <section className="section">
      <div className="container-fp max-w-xl">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-brand-dark"><Icon name={m.icon} className="h-6 w-6" /></span>
          <h1 className="mt-4 h2">{m.title}</h1>
          <p className="mt-3 text-navy/60">{m.sub}</p>
        </div>

        <div className="mt-6 flex justify-center gap-2 text-xs">
          {(["employer", "oep", "candidate"] as Kind[]).map((k) => (
            <Link key={k} href={`/register/${k}`} className={`rounded-full px-3 py-1.5 font-semibold transition ${k === kind ? "bg-brand text-white" : "border border-navy/15 text-navy/60 hover:border-brand hover:text-brand"}`}>
              {k === "employer" ? "Employer" : k === "oep" ? "Partner" : "Candidate"}
            </Link>
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
            <Field name="licenseExpiry" label="License expiry date" type="date" />
            <Field name="city" label="City / Country" />
            <Field name="countries" label="Countries of interest (comma separated)" full />
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

function Field({ name, label, type = "text", required, full }: { name: string; label: string; type?: string; required?: boolean; full?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-navy/70">{label}{required && " *"}</span>
      <input name={name} type={type} required={required}
        className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
    </label>
  );
}
