import { redirect } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";
import { currentUser } from "@/lib/session";
import { getNotifications } from "@/lib/queries";
import { homeForRole } from "@/lib/rbac";
import { markNotificationsRead } from "@/lib/mutations";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const items = await getNotifications(u.id);

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="flex h-16 items-center justify-between border-b border-navy/10 bg-white px-5">
        <Logo />
        <Link href={homeForRole(u.role)} className="btn-outline text-xs">Back to dashboard</Link>
      </header>
      <div className="mx-auto max-w-2xl p-5 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-navy">Notifications</h1>
          <form action={markNotificationsRead}><button className="text-sm font-semibold text-brand">Mark all read</button></form>
        </div>
        <div className="mt-6 space-y-2">
          {items.length === 0 && <p className="text-sm text-navy/40">No notifications yet.</p>}
          {items.map((n) => (
            <div key={n.id} className={`card flex items-start gap-3 p-4 ${n.read ? "opacity-60" : ""}`}>
              <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${n.read ? "bg-navy/5 text-navy/40" : "bg-brand/10 text-brand"}`}>
                <Icon name="chat" className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-navy">{n.title}</div>
                {n.body && <div className="text-sm text-navy/60">{n.body}</div>}
                <div className="mt-1 text-xs text-navy/35">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-brand" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
