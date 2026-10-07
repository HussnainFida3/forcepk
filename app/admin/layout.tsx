import DashboardShell from "@/components/DashboardShell";
import { navItems } from "@/lib/admin";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";

export const metadata = { title: "Command Center" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  return (
    <DashboardShell
      nav={navItems}
      tag="COMMAND CENTER"
      user={{ initials: "FO", name: u?.name ?? "ForcePK Owner", role: "Super Admin" }}
      search="Search companies, partners, candidates, job ID…"
      searchHref="/admin/search"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
