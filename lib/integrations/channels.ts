// Notification delivery channels. All no-throw; return a result describing what
// happened (sent via provider, or skipped as a stub when no key is configured).

type Result = { ok: boolean; provider: string; stub?: boolean; error?: string };

export async function sendEmail(to: string, subject: string, html: string): Promise<Result> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "ForcePK <noreply@forcepk.com>";
  if (!key) { console.log(`[email:stub] → ${to}: ${subject}`); return { ok: true, provider: "resend", stub: true }; }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return r.ok ? { ok: true, provider: "resend" } : { ok: false, provider: "resend", error: `HTTP ${r.status}` };
  } catch (e) { return { ok: false, provider: "resend", error: String(e) }; }
}

export async function sendWhatsApp(to: string, text: string): Promise<Result> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) { console.log(`[whatsapp:stub] → ${to}: ${text}`); return { ok: true, provider: "whatsapp", stub: true }; }
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
    });
    return r.ok ? { ok: true, provider: "whatsapp" } : { ok: false, provider: "whatsapp", error: `HTTP ${r.status}` };
  } catch (e) { return { ok: false, provider: "whatsapp", error: String(e) }; }
}

export async function sendSMS(to: string, text: string): Promise<Result> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) { console.log(`[sms:stub] → ${to}: ${text}`); return { ok: true, provider: "twilio", stub: true }; }
  try {
    const body = new URLSearchParams({ To: to, From: from, Body: text });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    return r.ok ? { ok: true, provider: "twilio" } : { ok: false, provider: "twilio", error: `HTTP ${r.status}` };
  } catch (e) { return { ok: false, provider: "twilio", error: String(e) }; }
}
