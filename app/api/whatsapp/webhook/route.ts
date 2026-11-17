import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/whatsapp";

// WhatsApp Cloud API webhook.
//   GET  — Meta's one-time verification handshake (hub.challenge).
//   POST — real-time delivery of inbound messages + status updates.
// Public (Meta calls it) but POST payloads are checked against your app secret.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Meta calls this once when you save the webhook, echoing a challenge back.
export function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("Bad signature", { status: 401 });
  }
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return new Response("ok", { status: 200 }); }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries = (body as any)?.entry ?? [];
    for (const entry of entries) {
      for (const change of entry?.changes ?? []) {
        const value = change?.value ?? {};
        const contacts: Record<string, { profile?: { name?: string }; wa_id?: string }> = {};
        for (const c of value?.contacts ?? []) if (c?.wa_id) contacts[c.wa_id] = c;

        // Inbound messages from a contact.
        for (const m of value?.messages ?? []) {
          const from = String(m?.from ?? "");
          if (!from) continue;
          const text = m?.text?.body ?? m?.button?.text ?? m?.interactive?.list_reply?.title ?? m?.interactive?.button_reply?.title ?? `[${m?.type ?? "message"}]`;
          await prisma.whatsAppMessage.upsert({
            where: { messageId: m?.id ?? `in_${from}_${m?.timestamp ?? Date.now()}` },
            create: { waId: from, direction: "IN", body: String(text), messageId: m?.id ?? null, contactName: contacts[from]?.profile?.name ?? null },
            update: {},
          }).catch(() => null);
        }

        // Delivery/read status updates for messages we sent.
        for (const s of value?.statuses ?? []) {
          if (!s?.id || !s?.status) continue;
          await prisma.whatsAppMessage.updateMany({ where: { messageId: s.id }, data: { status: String(s.status) } }).catch(() => null);
        }
      }
    }
  } catch {
    // Never make Meta retry forever over a parsing hiccup.
  }
  return new Response("ok", { status: 200 });
}
