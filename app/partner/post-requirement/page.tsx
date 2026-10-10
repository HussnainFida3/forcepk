import Link from "next/link";
import Icon from "@/components/Icon";
import { createOepRequirement } from "@/lib/mutations";

export const metadata = { title: "Post a Requirement" };

const fields: [string, string, string, boolean][] = [
  ["title", "Title (optional)", "e.g. 15 Masons for a project", false],
  ["profession", "Profession *", "Mason", true],
  ["quantity", "Quantity *", "15", true],
  ["gender", "Gender", "Male / Female / Any", false],
  ["experience", "Experience", "2–5 years", false],
  ["salary", "Salary / budget", "SAR 3,500 /mo", false],
  ["location", "Location *", "Riyadh, KSA", true],
];

export default function PartnerPostRequirement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/partner" className="text-navy/50 hover:text-brand"><Icon name="arrow" className="h-5 w-5 rotate-180" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">Post a Requirement</h1>
          <p className="text-sm text-navy/60">Need manpower for your own projects? Post it and ForcePK will help you source.</p>
        </div>
      </div>

      <form action={createOepRequirement} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        {fields.map(([name, label, ph, req]) => (
          <label key={name} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-navy/70">{label}</span>
            <input name={name} placeholder={ph} required={req} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          </label>
        ))}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-navy/70">Requirement expiry date</span>
          <input name="expiryDate" type="date" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-navy/70">Details / special requirements</span>
          <textarea name="specialNotes" rows={4} placeholder="Describe the role, site, duration…" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <div className="sm:col-span-2 flex justify-end gap-3">
          <Link href="/partner" className="btn-outline">Cancel</Link>
          <button type="submit" className="btn-primary">Post Requirement <Icon name="arrow" className="h-4 w-4" /></button>
        </div>
      </form>
    </div>
  );
}
