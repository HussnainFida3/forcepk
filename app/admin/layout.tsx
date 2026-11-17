import DashboardShell from "@/components/DashboardShell";
import { navItems } from "@/lib/admin";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export const metadata = { title: "Command Center" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  const initials = (u?.name ?? "FO").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <DashboardShell
      nav={navItems}
      tag="COMMAND CENTER"
      user={{ initials, name: u?.name ?? "ForcePK Admin", role: u?.role ? ROLE_LABELS[u.role as Role] ?? u.role : "Admin" }}
      search="Search companies, partners, candidates, job ID…"
      searchHref="/admin/search"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
