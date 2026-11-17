export const navItems = [
  { label: "Command Center", icon: "wheel", href: "/admin" },
  { label: "Companies", icon: "building", href: "/admin/companies" },
  { label: "Partners", icon: "handshake", href: "/admin/oeps" },
  { label: "Candidates", icon: "users", href: "/admin/candidates" },
  { label: "CV Drops", icon: "doc", href: "/admin/cv-drops" },
  { label: "Requirements", icon: "briefcase", href: "/admin/requirements" },
  { label: "Lead Gen", icon: "search", href: "/admin/leads" },
  { label: "CRM", icon: "chat", href: "/admin/crm" },
  { label: "WhatsApp", icon: "chat", href: "/admin/whatsapp" },
  { label: "Mailbox", icon: "mail", href: "/admin/mailbox" },
  { label: "Replacements", icon: "shield", href: "/admin/replacements" },
  { label: "Documents", icon: "doc", href: "/admin/documents" },
  { label: "Finance", icon: "award", href: "/admin/finance" },
  { label: "Reports", icon: "star", href: "/admin/reports" },
  { label: "AI Assistant", icon: "bolt", href: "/admin/ai" },
  { label: "Integrations", icon: "gear", href: "/admin/integrations" },
] as const;

export const toneMap: Record<string, string> = {
  navy: "bg-navy/10 text-navy",
  green: "bg-brand/10 text-brand-dark",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-purple-100 text-purple-700",
  teal: "bg-teal-100 text-teal-700",
  red: "bg-red-100 text-red-700",
};
