// WhatsApp Business — Meta Cloud API client. Sends text messages and records
// them. Fully env-gated: with no credentials set it reports "not configured"
// instead of throwing, so the app runs fine until you add the tokens.
//
// Required env (set on the server's .env):
//   WHATSAPP_TOKEN            - a permanent System-User access token from Meta
//   WHATSAPP_PHONE_NUMBER_ID  - the Phone Number ID of your WhatsApp number
//   WHATSAPP_VERIFY_TOKEN     - any secret string; you type the same one into
//                               Meta's webhook "Verify token" field
//   WHATSAPP_APP_SECRET       - (optional) your Meta app secret, to verify that
//                               incoming webhooks really came from Meta

import crypto from "node:crypto";

const GRAPH = "https://graph.facebook.com/v21.0";

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

/** E.164 digits only — Meta wants the number with no "+" or spaces. */
export function normalizeWaNumber(n: string): string {
  return (n || "").replace(/[^0-9]/g, "");
}

/** Send a plain text message. Returns the WhatsApp message id on success. */
export async function sendWhatsAppText(to: string, body: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const pnid = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !pnid) return { ok: false, error: "WhatsApp is not configured. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID on the server." };
  const num = normalizeWaNumber(to);
  if (!num) return { ok: false, error: "A valid phone number is required." };
  try {
    const res = await fetch(`${GRAPH}/${pnid}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: num, type: "text", text: { preview_url: false, body } }),
      signal: AbortSignal.timeout(20000),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: j?.error?.message || `WhatsApp send failed (${res.status}).` };
    return { ok: true, id: j?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "WhatsApp send failed." };
  }
}

/** Verify a webhook payload really came from Meta (X-Hub-Signature-256). When
 *  WHATSAPP_APP_SECRET is unset we skip the check (dev/testing). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
