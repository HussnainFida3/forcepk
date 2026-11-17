import { prisma } from "@/lib/prisma";
import { toneMap } from "./admin";
export { toneMap };

export const oepNav = [
  { label: "Dashboard", icon: "wheel", href: "/partner" },
  { label: "Job Marketplace", icon: "doc", href: "/partner/requirements" },
  { label: "Submit Candidates", icon: "bolt", href: "/partner/submit" },
  { label: "My Submissions", icon: "users", href: "/partner/submissions" },
  { label: "Post Requirement", icon: "briefcase", href: "/partner/post-requirement" },
  { label: "My Requirements", icon: "pin", href: "/partner/my-requirements" },
  { label: "Earnings", icon: "award", href: "/partner/earnings" },
  { label: "Agreement", icon: "doc", href: "/partner/agreement" },
  { label: "Messages", icon: "chat", href: "/messages" },
  { label: "Company Profile", icon: "building", href: "/partner/profile" },
] as const;


export async function getPartnerRanking(oepId?: string) {
  const oeps = await prisma.oep.findMany({
    where: { status: "VERIFIED" },
    select: { id: true, name: true, rating: true, tier: true, _count: { select: { applications: true } } },
    orderBy: { rating: "desc" },
  });
  const leaderboard = oeps.map((o, i) => ({
    rank: i + 1, name: o.name, score: Math.round(o.rating * 20),
    you: o.id === oepId,
  }));
  const me = leaderboard.find((l) => l.you);
  const myOep = oeps.find((o) => o.id === oepId);
  const submitted = oepId
    ? await prisma.application.count({ where: { oepId } })
    : 0;
  const selected = oepId
    ? await prisma.application.count({ where: { oepId, stage: "SELECTED" } })
    : 0;
  const selectionRate = submitted > 0 ? Math.round((selected / submitted) * 1000) / 10 : 0;
  const candidateIds = oepId
    ? (await prisma.application.findMany({ where: { oepId }, select: { candidateId: true }, distinct: ["candidateId"] })).map((a) => a.candidateId)
    : [];
  const docs = candidateIds.length
    ? await prisma.document.count({ where: { candidateId: { in: candidateIds }, status: "VERIFIED" } }).catch(() => 0)
    : 0;
  const totalDocs = candidateIds.length
    ? await prisma.document.count({ where: { candidateId: { in: candidateIds } } }).catch(() => 0)
    : 0;
  const docAccuracy = totalDocs > 0 ? Math.round((docs / totalDocs) * 100) : 0;
  return {
    ranking: {
      tier: myOep?.tier ?? "Bronze",
      rank: me?.rank ?? leaderboard.length + 1,
      rating: myOep?.rating ?? 0,
    },
    topPartners: leaderboard.slice(0, 5),
    perfMetrics: [
      { label: "Selection Rate", value: `${selectionRate}%`, icon: "star" },
      { label: "Document Accuracy", value: `${docAccuracy}%`, icon: "shield" },
    ],
  };
}

export const submissionDocs = [
  "Candidate CV", "Passport", "National ID", "Photographs",
  "Experience certificates", "Educational documents", "Medical status", "Other documents",
] as const;

export const candidateTracking = ["Submitted", "Under Review", "Shortlisted", "Interview", "Selected", "Documentation", "Ready", "Deployed"] as const;
