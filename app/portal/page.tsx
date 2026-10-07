import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homeForRole } from "@/lib/rbac";

// Post-login landing: route each user to their own portal by role.
export default async function PortalRedirect() {
  const session = await auth();
  if (!session?.user?.role) redirect("/login");
  redirect(homeForRole(session.user.role));
}
