import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import { currentUser } from "@/lib/session";
import { getThread } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/rbac";
import { sendMessage } from "@/lib/mutations";

export const dynamic = "force-dynamic";

export default async function Thread({ params }: { params: { userId: string } }) {
  const u = (await currentUser())!;
  const { messages, other } = await getThread(u.id, params.userId);
  if (!other) notFound();
  await prisma.message.updateMany({ where: { senderId: params.userId, recipientId: u.id, read: false }, data: { read: true } });

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/messages" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand"><Icon name="arrow" className="h-4 w-4 rotate-180" /> All conversations</Link>

      <div className="card flex flex-col" style={{ height: "70vh" }}>
        <div className="flex items-center gap-3 border-b border-navy/10 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-navy text-sm font-bold text-white">{other.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
          <div><div className="font-semibold text-navy">{other.name}</div><div className="text-xs text-navy/45">{ROLE_LABELS[other.role]}</div></div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && <p className="text-center text-sm text-navy/40">No messages yet. Say hello 👋</p>}
          {messages.map((m) => {
            const mine = m.senderId === u.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-brand text-white" : "bg-navy-50 text-navy"}`}>
                  {m.body}
                  <div className={`mt-0.5 text-[10px] ${mine ? "text-white/70" : "text-navy/40"}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            );
          })}
        </div>

        <form action={sendMessage} className="flex items-center gap-2 border-t border-navy/10 p-3">
          <input type="hidden" name="recipientId" value={other.id} />
          <input name="body" required autoComplete="off" placeholder="Type a message…" className="flex-1 rounded-lg border border-navy/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
          <button className="btn-primary"><Icon name="arrow" className="h-4 w-4" /></button>
        </form>
      </div>
    </div>
  );
}
