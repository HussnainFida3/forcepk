import { currentUser } from "@/lib/session";
import { getOpenRequirements } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import CandidateJobBrowser from "@/components/CandidateJobBrowser";

export const metadata = { title: "Job Search" };
export const dynamic = "force-dynamic";

export default async function CandidateJobs() {
  const u = await currentUser();
  const [reqs, myApps] = await Promise.all([
    getOpenRequirements(),
    u?.candidate?.id
      ? prisma.application.findMany({ where: { candidateId: u.candidate.id }, select: { requirementId: true } })
      : Promise.resolve([]),
  ]);
  const appliedIds = myApps.map((a) => a.requirementId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Job Search</h1>
        <p className="text-sm text-navy/60">Browse by category, then apply in one click.</p>
      </div>
      <CandidateJobBrowser reqs={reqs} appliedIds={appliedIds} />
    </div>
  );
}
