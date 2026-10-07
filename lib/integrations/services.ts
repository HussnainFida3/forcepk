// Payments, video meetings and e-signature. Env-gated, no-throw, stub fallbacks.

export async function createCheckout(invoiceId: string, amount: number, currency = "usd"): Promise<{ ok: boolean; url: string; stub?: boolean }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: true, url: `/admin/finance?pay=${invoiceId}`, stub: true };
  try {
    const body = new URLSearchParams();
    body.append("mode", "payment");
    body.append("success_url", `${process.env.NEXTAUTH_URL ?? ""}/admin/finance?paid=${invoiceId}`);
    body.append("cancel_url", `${process.env.NEXTAUTH_URL ?? ""}/admin/finance`);
    body.append("line_items[0][price_data][currency]", currency);
    body.append("line_items[0][price_data][product_data][name]", `ForcePK Invoice ${invoiceId}`);
    body.append("line_items[0][price_data][unit_amount]", String(Math.round(amount * 100)));
    body.append("line_items[0][quantity]", "1");
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" }, body,
    });
    const data = await r.json();
    return r.ok ? { ok: true, url: data.url } : { ok: false, url: "/admin/finance", stub: true };
  } catch { return { ok: false, url: "/admin/finance", stub: true }; }
}

export async function createMeeting(topic: string): Promise<{ ok: boolean; url: string; stub?: boolean }> {
  const connected = process.env.ZOOM_ACCOUNT_ID && process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET;
  if (!connected) {
    // Deterministic placeholder meeting link until Zoom is connected.
    const id = Buffer.from(topic + Date.now()).toString("hex").slice(0, 10);
    return { ok: true, url: `https://meet.forcepk.com/i/${id}`, stub: true };
  }
  // Real Zoom Server-to-Server OAuth + meeting creation would go here.
  return { ok: true, url: "https://zoom.us/j/pending", stub: true };
}

export async function requestSignature(documentName: string, signerEmail: string): Promise<{ ok: boolean; stub?: boolean }> {
  const connected = process.env.DOCUSIGN_INTEGRATION_KEY && process.env.DOCUSIGN_ACCOUNT_ID;
  if (!connected) { console.log(`[esign:stub] "${documentName}" → ${signerEmail}`); return { ok: true, stub: true }; }
  return { ok: true, stub: true };
}
