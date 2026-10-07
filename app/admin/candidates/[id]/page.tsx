import CandidateDetail from "@/components/CandidateDetail";

export const metadata = { title: "Candidate Profile" };
export const dynamic = "force-dynamic";

export default function AdminCandidate({ params }: { params: { id: string } }) {
  return <CandidateDetail candidateId={params.id} backHref="/admin/candidates" />;
}
