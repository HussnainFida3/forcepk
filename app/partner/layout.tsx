import DashboardShell from "@/components/DashboardShell";
import { oepNav } from "@/lib/oep";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export const metadata = { title: "OEP Partner Portal" };

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  const initials = (u?.name ?? "RP").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <DashboardShell
      nav={oepNav}
      tag="PARTNER PORTAL"
      user={{ initials, name: u?.name ?? "Recruitment Partner", role: u?.role ? ROLE_LABELS[u.role as Role] ?? "Partner" : "Partner" }}
      search="Search requirements, candidates, job ID…"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
