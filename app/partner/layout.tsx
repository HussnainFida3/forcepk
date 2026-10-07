import DashboardShell from "@/components/DashboardShell";
import { oepNav } from "@/lib/oep";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";

export const metadata = { title: "OEP Partner Portal" };

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  return (
    <DashboardShell
      nav={oepNav}
      tag="PARTNER PORTAL"
      user={{ initials: "AR", name: u?.name ?? "Recruitment Partner", role: "Recruitment Partner" }}
      search="Search requirements, candidates, job ID…"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
