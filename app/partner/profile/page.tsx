import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { updateOepProfile } from "@/lib/mutations";

export const metadata = { title: "Company Profile" };
export const dynamic = "force-dynamic";

export default async function PartnerProfile({ searchParams }: { searchParams: { saved?: string } }) {
  const u = await currentUser();
  const o = u?.oepId ? await prisma.oep.findUnique({ where: { id: u.oepId }, select: { name: true, licenseNo: true, licenseExpiry: true, city: true, phone: true, email: true, specializations: true, tier: true, rating: true, status: true } }) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Company Profile</h1>
        <p className="text-sm text-navy/60">Keep your agency details up to date to receive the best-matched requirements.</p>
      </div>

      {searchParams?.saved && (
        <div className="flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm font-medium text-brand-dark"><Icon name="check-circle" className="h-5 w-5" /> Profile saved.</div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={updateOepProfile} className="card p-6 lg:col-span-2">
          <h2 className="flex items-center gap-2 font-semibold text-navy"><Icon name="building" className="h-5 w-5 text-brand" /> Agency details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Agency name" defaultValue={o?.name ?? ""} />
            <Field label="License no." defaultValue={o?.licenseNo ?? ""} readOnly />
            <Field name="city" label="City / Country" defaultValue={o?.city ?? ""} />
            <Field name="phone" label="Phone" defaultValue={o?.phone ?? ""} />
            <Field name="email" label="Email" defaultValue={o?.email ?? ""} />
            <Field name="specializations" label="Specializations (comma separated)" defaultValue={(o?.specializations ?? []).join(", ")} full />
          </div>
          <div className="mt-5 flex justify-end"><button className="btn-primary">Save Profile</button></div>
        </form>

        <div className="card h-fit p-6">
          <h2 className="font-semibold text-navy">Partner status</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Row label="Tier" value={o?.tier ?? "—"} />
            <Row label="Rating" value={`${o?.rating?.toFixed(1) ?? "—"} / 5`} />
            <Row label="Status" value={o?.status ?? "—"} />
            <Row label="License expiry" value={o?.licenseExpiry ? new Date(o.licenseExpiry).toLocaleDateString() : "—"} />
          </div>
        </div>
      </div>
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
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-navy/10 pb-2 last:border-0"><span className="text-navy/55">{label}</span><span className="font-medium text-navy">{value}</span></div>;
}
