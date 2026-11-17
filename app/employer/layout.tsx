import DashboardShell from "@/components/DashboardShell";
import { empNav } from "@/lib/employer";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export const metadata = { title: "Employer Portal" };

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  const initials = (u?.name ?? "EP").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <DashboardShell
      nav={empNav}
      tag="EMPLOYER PORTAL"
      user={{ initials, name: u?.name ?? "Employer", role: u?.role ? ROLE_LABELS[u.role as Role] ?? "Employer" : "Employer" }}
      search="Search candidates, requirements, job ID…"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
