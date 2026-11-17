import { prisma } from "@/lib/prisma";
import { whatsappConfigured } from "@/lib/whatsapp";
import { sendWhatsApp } from "./actions";

export const metadata = { title: "WhatsApp Inbox" };
export const dynamic = "force-dynamic";

function fmt(d: Date) {
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function WhatsAppInboxPage({ searchParams }: { searchParams: { to?: string } }) {
  const configured = whatsappConfigured();
  const messages = await prisma.whatsAppMessage.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });

  // Build the conversation list (one row per contact, newest first).
  const byContact = new Map<string, { waId: string; name: string | null; last: string; at: Date; unreadIn: number }>();
  for (const m of messages) {
    const e = byContact.get(m.waId);
    if (!e) byContact.set(m.waId, { waId: m.waId, name: m.contactName, last: m.body, at: m.createdAt, unreadIn: 0 });
    else if (!e.name && m.contactName) e.name = m.contactName;
  }
  const convos = [...byContact.values()];

  const active = searchParams.to || convos[0]?.waId || "";
  const thread = messages.filter((m) => m.waId === active).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
  const activeName = convos.find((c) => c.waId === active)?.name;

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-navy">WhatsApp Inbox</h1>
        <p className="text-sm text-navy/60">Send and receive WhatsApp Business messages. Real conversations only.</p>
      </div>

      {!configured && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          WhatsApp isn&apos;t connected yet. Add <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code> and{" "}
          <code>WHATSAPP_VERIFY_TOKEN</code> to the server&apos;s <code>.env</code>, then point Meta&apos;s webhook to{" "}
          <code>/api/whatsapp/webhook</code>. You can still browse received messages here.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
        {/* Conversations */}
        <div className="rounded-xl border border-navy/10 bg-white">
          <div className="border-b border-navy/10 px-4 py-3 text-sm font-medium text-navy">Conversations ({convos.length})</div>
          <div className="max-h-[70vh] overflow-y-auto">
            {convos.length === 0 && <div className="px-4 py-6 text-sm text-navy/50">No messages yet. Send one, or wait for inbound.</div>}
            {convos.map((c) => (
              <a key={c.waId} href={`/admin/whatsapp?to=${encodeURIComponent(c.waId)}`}
                className={`block border-b border-navy/5 px-4 py-3 hover:bg-navy/5 ${c.waId === active ? "bg-brand/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-navy">{c.name || `+${c.waId}`}</span>
                  <span className="text-[11px] text-navy/40">{fmt(c.at)}</span>
                </div>
                <div className="truncate text-xs text-navy/50">{c.last}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Thread + composer */}
        <div className="flex min-h-[70vh] flex-col rounded-xl border border-navy/10 bg-white">
          <div className="border-b border-navy/10 px-4 py-3 text-sm font-medium text-navy">
            {active ? (activeName || `+${active}`) : "Pick a conversation or start a new one"}
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {thread.map((m) => (
              <div key={m.id} className={`flex ${m.direction === "OUT" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.direction === "OUT" ? "bg-brand text-white" : "bg-navy/5 text-navy"}`}>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className={`mt-1 text-[10px] ${m.direction === "OUT" ? "text-white/70" : "text-navy/40"}`}>
                    {fmt(m.createdAt)}{m.direction === "OUT" && m.status ? ` · ${m.status}` : ""}
                  </div>
                </div>
              </div>
            ))}
            {active && thread.length === 0 && <div className="text-sm text-navy/50">No messages in this conversation yet.</div>}
          </div>

          {/* Composer */}
          <form action={sendWhatsApp} className="border-t border-navy/10 p-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input name="to" defaultValue={active} placeholder="Phone e.g. 9665XXXXXXXX (no +)"
                className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm sm:w-56" required />
              <input name="body" placeholder="Type a message…" autoComplete="off"
                className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm" required />
              <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:opacity-90" disabled={!configured}>
                Send
              </button>
            </div>
            {!configured && <div className="mt-1 text-[11px] text-amber-700">Connect WhatsApp (above) to enable sending.</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
