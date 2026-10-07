import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateCandidateProfile } from "@/lib/mutations";

export const metadata = { title: "Profile & CV Builder" };
export const dynamic = "force-dynamic";

export default async function ProfilePage({ searchParams }: { searchParams: { saved?: string } }) {
  const u = await currentUser();
  const p = u?.candidate?.id
    ? await prisma.candidateProfile.findUnique({
        where: { id: u.candidate.id },
        select: { profession: true, city: true, experienceYrs: true, saudiExpYrs: true, salaryExpect: true, education: true, languages: true, skills: true, certifications: true, summary: true, passportNo: true, cnic: true, drivingLicense: true, profileStrength: true },
      })
    : null;

  const fields: [string, string, string | undefined][] = [
    ["Full Name", u?.name ?? "", undefined],
    ["National ID", p?.cnic ?? "", undefined],
    ["Passport No.", p?.passportNo ?? "", undefined],
    ["City", p?.city ?? "", "city"],
    ["Profession", p?.profession ?? "", "profession"],
    ["Experience (years)", String(p?.experienceYrs ?? ""), "experience"],
    ["Overseas Experience (years)", String(p?.saudiExpYrs ?? ""), "overseasExp"],
    ["Expected Salary (USD)", p?.salaryExpect ?? "", "salary"],
    ["Education", p?.education ?? "", "education"],
    ["Driving License", p?.drivingLicense ?? "", undefined],
  ];
  const strength = p?.profileStrength ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Profile & CV Builder</h1>
        <p className="text-sm text-navy/60">Complete your profile to boost your AI match score and get noticed by employers.</p>
      </div>

      {searchParams?.saved && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark">
          <Icon name="check-circle" className="h-5 w-5" /> Profile saved — your match score has improved.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={updateCandidateProfile} className="card p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="users" className="h-5 w-5 text-brand" /> Personal & Professional Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {fields.map(([l, v, name]) => (
              <label key={l} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-navy/70">{l}</span>
                <input name={name} defaultValue={v} readOnly={!name}
                  className={`rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${!name ? "bg-navy/5 text-navy/50" : ""}`} />
              </label>
            ))}
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Languages (comma separated)</span>
              <input name="languages" defaultValue={(p?.languages ?? []).join(", ")} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Skills (comma separated)</span>
              <input name="skills" defaultValue={(p?.skills ?? []).join(", ")} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Certifications (comma separated)</span>
              <input name="certifications" defaultValue={(p?.certifications ?? []).join(", ")} placeholder="e.g. 6G Welding, OSHA, Forklift License" className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className="text-xs font-medium text-navy/70">Professional Summary</span>
              <textarea name="summary" rows={3} defaultValue={p?.summary ?? ""} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs text-navy/50"><Icon name="bolt" className="h-4 w-4 text-brand" /> Saving updates your AI match score across requirements.</p>
            <button type="submit" className="btn-primary">Save Profile</button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-navy">Profile Strength</h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-brand text-lg font-extrabold text-brand-dark">{strength}%</div>
              <p className="text-sm text-navy/60">Complete your details to reach 100% and improve your match score.</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy/10"><div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark" style={{ width: `${strength}%` }} /></div>
          </div>

          <div className="rounded-2xl bg-navy p-5 text-sm text-white/80">
            <span className="flex items-center gap-2 font-semibold text-white"><Icon name="shield" className="h-5 w-5 text-brand-light" /> Your privacy</span>
            <p className="mt-2">Sensitive documents like your passport and National ID are never shown publicly — only shared with authorized employers and partners.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
