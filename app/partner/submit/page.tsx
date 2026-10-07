import Icon from "@/components/Icon";
import { candidateTracking } from "@/lib/oep";
import { getOpenRequirements } from "@/lib/queries";
import { submitCandidate } from "@/lib/mutations";

export const metadata = { title: "Submit Candidate" };
export const dynamic = "force-dynamic";

const fields = [
  ["name", "Full Name *", "Muhammad Ahsan"],
  ["email", "Email", "candidate@email.com"],
  ["phone", "Mobile", "+92 3XX XXXXXXX"],
  ["passportNo", "Passport No.", "AB1234567"],
  ["city", "City", "Faisalabad"],
  ["profession", "Profession *", "Electrician"],
  ["experience", "Experience (years)", "5"],
  ["overseasExp", "Overseas Experience (years)", "2"],
  ["salary", "Salary Expectation (USD)", "$1,200 /mo"],
];

export default async function SubmitPage() {
  const reqs = await getOpenRequirements();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Submit Candidate</h1>
        <p className="text-sm text-navy/60">Add a candidate and submit them against an open requirement.</p>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-semibold text-navy/70">Candidate journey after submission</h2>
        <div className="mt-4 flex flex-wrap items-center gap-y-3">
          {candidateTracking.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-brand text-white" : "bg-navy/10 text-navy/50"}`}>{i + 1}</span>
                <span className="max-w-[72px] text-center text-[11px] font-medium text-navy/60">{s}</span>
              </div>
              {i < candidateTracking.length - 1 && <div className={`mx-1 h-0.5 w-5 ${i === 0 ? "bg-brand" : "bg-navy/15"}`} />}
            </div>
          ))}
        </div>
      </div>

      <form action={submitCandidate} className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="users" className="h-5 w-5 text-brand" /> Candidate Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Requirement *</span>
              <select name="requirementId" required className="rounded-lg border border-navy/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">
                <option value="">Select an open requirement…</option>
                {reqs.map((r) => <option key={r.id} value={r.id}>{r.refCode} — {r.title} ({r.location})</option>)}
              </select>
            </label>
            {fields.map(([name, label, ph]) => (
              <label key={name} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-navy/70">{label}</span>
                <input name={name} placeholder={ph} required={label.includes("*")}
                  className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Skills (comma separated)</span>
              <input name="skills" placeholder="Electrical work, Wiring, Industrial maintenance"
                className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="shield" className="h-5 w-5 text-brand" /> Documents</h2>
            <p className="text-xs text-navy/55">Upload after submission from the candidate record.</p>
            <div className="mt-4 space-y-2">
              {["Candidate CV", "Passport", "National ID", "Experience certificates"].map((d) => (
                <div key={d} className="flex items-center justify-between rounded-lg border border-dashed border-navy/20 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-navy/70"><Icon name="doc" className="h-4 w-4 text-navy/40" /> {d}</span>
                  <span className="text-xs font-semibold text-navy/40">After submit</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-navy p-5 text-sm text-white/80">
            <span className="flex items-center gap-2 font-semibold text-white"><Icon name="bolt" className="h-5 w-5 text-brand-light" /> AI scoring</span>
            <p className="mt-2">A match score is generated automatically when you submit.</p>
            <button type="submit" className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold hover:bg-brand-dark">Submit Candidate</button>
          </div>
        </div>
      </form>
    </div>
  );
}
