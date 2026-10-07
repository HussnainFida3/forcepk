import DashboardShell from "@/components/DashboardShell";
import { canNav } from "@/lib/candidate";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";

export const metadata = { title: "Candidate Portal" };

const initials = (n?: string) => (n ?? "You").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  return (
    <DashboardShell
      nav={canNav}
      tag="CANDIDATE PORTAL"
      user={{ initials: initials(u?.name), name: u?.name ?? "Candidate", role: "Candidate" }}
      search="Search jobs by profession, city…"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
