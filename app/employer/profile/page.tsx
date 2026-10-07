import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateCompanyProfile } from "@/lib/mutations";

export const metadata = { title: "Company Profile" };
export const dynamic = "force-dynamic";

export default async function EmployerProfile({ searchParams }: { searchParams: { saved?: string } }) {
  const u = await currentUser();
  const c = u?.companyId ? await prisma.company.findUnique({ where: { id: u.companyId }, select: { name: true, crNumber: true, industry: true, city: true, website: true, about: true, contactName: true, phone: true, status: true } }) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Company Profile</h1>
        <p className="text-sm text-navy/60">Your public profile appears in the ForcePK employer directory.</p>
      </div>

      {searchParams?.saved && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark"><Icon name="check-circle" className="h-5 w-5" /> Profile saved.</div>
      )}

      <form action={updateCompanyProfile} className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="building" className="h-5 w-5 text-brand" /> Company details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Company name" defaultValue={c?.name ?? ""} />
          <Field label="Registration no." defaultValue={c?.crNumber ?? ""} readOnly />
          <Field name="industry" label="Industry" defaultValue={c?.industry ?? ""} />
          <Field name="city" label="City / Country" defaultValue={c?.city ?? ""} />
          <Field name="contactName" label="Contact person" defaultValue={c?.contactName ?? ""} />
          <Field name="phone" label="Phone" defaultValue={c?.phone ?? ""} />
          <Field name="website" label="Website" defaultValue={c?.website ?? ""} full />
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-navy/70">About company</span>
            <textarea name="about" rows={4} defaultValue={c?.about ?? ""} className="rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
          </label>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${c?.status === "VERIFIED" ? "bg-brand/10 text-brand-dark" : "bg-amber-100 text-amber-700"}`}>{c?.status ?? "—"}</span>
          <button className="btn-primary">Save Profile</button>
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue, full, readOnly }: { name?: string; label: string; defaultValue: string; full?: boolean; readOnly?: boolean }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-medium text-navy/70">{label}</span>
      <input name={name} defaultValue={defaultValue} readOnly={readOnly}
        className={`rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${readOnly ? "bg-navy/5 text-navy/50" : ""}`} />
    </label>
  );
}
