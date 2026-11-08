"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { submitPublicLead } from "@/lib/mutations";
import ProfessionSelect from "@/components/ProfessionSelect";

const inputCls = "rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60 md:col-span-2">
      {pending ? "Submitting…" : <>Submit Requirement <ArrowRight className="h-4 w-4" /></>}
    </button>
  );
}

function Inner({ onReset }: { onReset: () => void }) {
  const [state, action] = useFormState(submitPublicLead, null);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-brand/30 bg-brand/5 p-5 text-sm">
        <p className="flex items-center gap-2 font-semibold text-brand-dark"><CheckCircle2 className="h-5 w-5" /> Thank you! Your requirement has been received. Our team will reach out within 24 hours.</p>
        <button onClick={onReset} className="text-xs font-semibold text-brand hover:text-brand-dark">Submit another requirement →</button>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
      <div className="md:col-span-2"><ProfessionSelect /></div>
      <input name="quantity" placeholder="No. of workers *" required className={inputCls} />
      <input name="location" placeholder="Destination country / city *" required className={inputCls} />
      <input name="company" placeholder="Company name" className={inputCls} />
      <input name="name" placeholder="Contact person" className={inputCls} />
      <input name="email" type="email" placeholder="Work email *" required className={inputCls} />
      <input name="phone" type="tel" placeholder="Phone / WhatsApp" className={inputCls} />
      <textarea name="message" placeholder="Brief description of the role, experience level and any special requirements" rows={2} className={`${inputCls} md:col-span-2 resize-none`} />
      <SubmitButton />
    </form>
  );
}

export default function RequirementForm() {
  const [k, setK] = useState(0);
  return <Inner key={k} onReset={() => setK((n) => n + 1)} />;
}
