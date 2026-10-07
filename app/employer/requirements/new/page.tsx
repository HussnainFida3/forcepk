import Link from "next/link";
import Icon from "@/components/Icon";
import AiJobDescription from "@/components/AiJobDescription";
import { createRequirement } from "@/lib/mutations";

export const metadata = { title: "Create Requirement" };

const text = [
  ["title", "Title (optional)", "e.g. 30 Electricians"],
  ["profession", "Profession *", "Electrician"],
  ["quantity", "Quantity *", "30"],
  ["gender", "Gender", "Male / Female / Any"],
  ["experience", "Experience", "2–5 years"],
  ["education", "Education", "High School / Diploma"],
  ["salary", "Salary / budget", "$1,200 /mo"],
  ["location", "Location *", "Dubai, UAE"],
];
const selects: [string, string, string[]][] = [
  ["contractDuration", "Contract duration", ["1 year", "2 years", "3 years"]],
  ["workingHours", "Working hours", ["8 hrs/day", "10 hrs/day", "12 hrs/day"]],
  ["interviewMethod", "Interview method", ["Online", "In-person", "Online / In-person"]],
];

export default function NewRequirement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/employer" className="text-navy/50 hover:text-brand"><Icon name="arrow" className="h-5 w-5 rotate-180" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">Create Requirement</h1>
          <p className="text-sm text-navy/60">Post a manpower requirement. It goes live for sourcing immediately.</p>
        </div>
      </div>

      <form action={createRequirement} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        {text.map(([name, label, ph]) => (
          <label key={name} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-navy/70">{label}</span>
            <input name={name} placeholder={ph} required={label.includes("*")}
              className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          </label>
        ))}
        {selects.map(([name, label, opts]) => (
          <label key={name} className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-navy/70">{label}</span>
            <select name={name} className="rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-navy/70">Skills (comma separated)</span>
          <input name="skills" placeholder="Electrical work, Wiring, Maintenance"
            className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="flex items-center justify-between text-xs font-medium text-navy/70">
            Job description / special requirements
            <AiJobDescription />
          </span>
          <textarea name="specialNotes" rows={5} placeholder="Describe the role, or click “Generate with AI” to draft it from the fields above."
            className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        </label>
        <div className="sm:col-span-2 flex justify-end gap-3">
          <Link href="/employer" className="btn-outline">Cancel</Link>
          <button type="submit" className="btn-primary">Submit Requirement <Icon name="arrow" className="h-4 w-4" /></button>
        </div>
      </form>
    </div>
  );
}
