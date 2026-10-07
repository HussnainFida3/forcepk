import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import { currentUser } from "@/lib/session";
import { homeForRole } from "@/lib/rbac";

export const metadata = { title: "Messages" };

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const u = await currentUser();
  if (!u) redirect("/login");
  return (
    <div className="min-h-screen bg-navy-50">
      <header className="flex h-16 items-center justify-between border-b border-navy/10 bg-white px-5">
        <Logo />
        <Link href={homeForRole(u.role)} className="btn-outline text-xs">Back to dashboard</Link>
      </header>
      <div className="mx-auto max-w-5xl p-5 lg:p-8">{children}</div>
    </div>
  );
}
