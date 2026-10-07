import DashboardShell from "@/components/DashboardShell";
import { empNav } from "@/lib/employer";
import { currentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries";

export const metadata = { title: "Employer Portal" };

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  const unread = await getUnreadCount(u?.id);
  return (
    <DashboardShell
      nav={empNav}
      tag="EMPLOYER PORTAL"
      user={{ initials: "AE", name: u?.name ?? "Employer", role: "Employer" }}
      search="Search candidates, requirements, job ID…"
      unread={unread}
    >
      {children}
    </DashboardShell>
  );
}
