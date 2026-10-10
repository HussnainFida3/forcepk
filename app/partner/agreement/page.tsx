import Icon from "@/components/Icon";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Agreement" };
export const dynamic = "force-dynamic";

export default async function PartnerAgreement() {
  const session = await auth();
  const me = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { oepId: true } }) : null;
  const c = me?.oepId ? await prisma.oep.findUnique({ where: { id: me.oepId }, select: { agreementText: true, agreementFileUrl: true } }) : null;
  const isPdf = !!c?.agreementFileUrl && /\.pdf($|\?)/i.test(c.agreementFileUrl);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Agreement</h1>
        <p className="text-sm text-navy/60">Your signed service agreement with ForcePK.</p>
      </div>

      {!c?.agreementText && !c?.agreementFileUrl ? (
        <div className="card grid place-items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-50 text-navy/40"><Icon name="doc" className="h-6 w-6" /></span>
          <p className="font-semibold text-navy">No agreement on file yet</p>
          <p className="max-w-sm text-sm text-navy/55">Once ForcePK uploads your signed agreement, it will appear here for your reference.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {c?.agreementFileUrl && (
            <div className="card p-6">
              <h2 className="font-semibold text-navy">Signed document</h2>
              <div className="mt-4">
                {isPdf
                  ? <a href={c.agreementFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-navy/15 px-3 py-2 text-sm font-semibold text-navy hover:border-brand hover:text-brand"><Icon name="doc" className="h-4 w-4" /> Open PDF</a>
                  : <a href={c.agreementFileUrl} target="_blank" rel="noreferrer"><img src={c.agreementFileUrl} alt="Signed agreement" className="w-full rounded-xl border border-navy/10 object-contain" /></a>}
              </div>
            </div>
          )}
          {c?.agreementText && (
            <div className="card p-6">
              <h2 className="font-semibold text-navy">Terms</h2>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-navy/70">{c.agreementText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
