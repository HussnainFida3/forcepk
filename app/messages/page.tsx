import Link from "next/link";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { getConversations, getContacts } from "@/lib/queries";
import { ROLE_LABELS } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function MessagesHome() {
  const u = (await currentUser())!;
  const [convos, contacts] = await Promise.all([getConversations(u.id), getContacts(u.id)]);
  const started = new Set(convos.map((c) => c.otherId));
  const newContacts = contacts.filter((c) => !started.has(c.id));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-bold text-navy">Conversations</h1>
        <div className="mt-4 space-y-2">
          {convos.length === 0 && <p className="text-sm text-navy/40">No conversations yet — start one on the right.</p>}
          {convos.map((c) => (
            <Link key={c.otherId} href={`/messages/${c.otherId}`} className="card flex items-center gap-3 p-4 hover:border-brand">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">{(c.user?.name ?? "?").split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium text-navy">{c.user?.name ?? "Unknown"}</span>
                  {c.unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{c.unread}</span>}
                </div>
                <div className="truncate text-xs text-navy/50">{c.last}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-navy"><Icon name="users" className="h-5 w-5 text-brand" /> Start a conversation</h2>
        <div className="mt-4 space-y-2">
          {newContacts.map((c) => (
            <Link key={c.id} href={`/messages/${c.id}`} className="card flex items-center justify-between p-3 hover:border-brand">
              <span className="text-sm font-medium text-navy">{c.name}</span>
              <span className="text-xs text-navy/45">{ROLE_LABELS[c.role]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
