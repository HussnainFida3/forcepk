// Central registry of external integrations. Each is "connected" only when its
// env var(s) are present. Everything degrades gracefully to a safe stub otherwise,
// so the platform is fully functional with zero keys and lights up as keys are added.

export type IntegrationStatus = {
  key: string;
  name: string;
  category: string;
  connected: boolean;
  env: string[];
  note: string;
};

const has = (...vars: string[]) => vars.every((v) => !!process.env[v]);

export function integrationStatuses(): IntegrationStatus[] {
  return [
    { key: "email", name: "Email (Resend)", category: "Notifications", env: ["RESEND_API_KEY"], connected: has("RESEND_API_KEY"), note: "Transactional email delivery." },
    { key: "whatsapp", name: "WhatsApp Business", category: "Notifications", env: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"], connected: has("WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID"), note: "WhatsApp message delivery via Meta Cloud API." },
    { key: "sms", name: "SMS (Twilio)", category: "Notifications", env: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM"], connected: has("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM"), note: "SMS delivery via Twilio." },
    { key: "ai", name: "AI (Anthropic)", category: "Intelligence", env: ["ANTHROPIC_API_KEY"], connected: has("ANTHROPIC_API_KEY"), note: "CV parsing, candidate matching and the admin AI assistant." },
    { key: "google", name: "Google Sign-In (OAuth)", category: "Auth", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], connected: has("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"), note: "Lets users sign in with Google (the button appears automatically)." },
    { key: "storage", name: "Object Storage (S3)", category: "Storage", env: ["S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"], connected: has("S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"), note: "Secure document storage (falls back to local disk)." },
    { key: "payments", name: "Payments (Stripe)", category: "Finance", env: ["STRIPE_SECRET_KEY"], connected: has("STRIPE_SECRET_KEY"), note: "Invoice checkout and online payments." },
    { key: "video", name: "Video Interviews (Zoom)", category: "Interviews", env: ["ZOOM_ACCOUNT_ID", "ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"], connected: has("ZOOM_ACCOUNT_ID", "ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET"), note: "Auto-generate interview meeting links." },
    { key: "esign", name: "E-Signature (DocuSign)", category: "Documents", env: ["DOCUSIGN_INTEGRATION_KEY", "DOCUSIGN_ACCOUNT_ID"], connected: has("DOCUSIGN_INTEGRATION_KEY", "DOCUSIGN_ACCOUNT_ID"), note: "Contract and offer-letter signing." },
    { key: "gov", name: "Gov Platforms (Qiwa / Musaned)", category: "Compliance", env: ["QIWA_API_KEY"], connected: has("QIWA_API_KEY"), note: "Integration-ready; requires official authorization." },
  ];
}

export const isConnected = (key: string) => integrationStatuses().find((i) => i.key === key)?.connected ?? false;
