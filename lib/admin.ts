export const kpis = [
  { label: "Saudi Companies", value: "124", sub: "112 verified", icon: "building", tone: "navy" },
  { label: "OEP Partners", value: "47", sub: "3 licenses expiring", icon: "handshake", tone: "green" },
  { label: "Candidates", value: "18,540", sub: "+342 this week", icon: "users", tone: "blue" },
  { label: "Open Requirements", value: "38", sub: "12 need candidates", icon: "doc", tone: "amber" },
  { label: "Shortlisted", value: "1,284", sub: "across 38 reqs", icon: "star", tone: "purple" },
  { label: "Interviews", value: "342", sub: "7 scheduled today", icon: "chat", tone: "teal" },
  { label: "Selected", value: "187", sub: "146 in processing", icon: "check-circle", tone: "green" },
  { label: "Deployed", value: "1,052", sub: "YTD", icon: "globe", tone: "navy" },
] as const;

export const funnel = [
  { stage: "Requirements", value: 38, pct: 100 },
  { stage: "Candidates Sourced", value: 2460, pct: 86 },
  { stage: "Shortlisted", value: 1284, pct: 62 },
  { stage: "Interviews", value: 342, pct: 40 },
  { stage: "Selected", value: 187, pct: 24 },
  { stage: "Deployed", value: 1052, pct: 58 },
] as const;

export const urgent = [
  { t: "12 requirements need candidates", tone: "amber", icon: "doc" },
  { t: "24 candidates missing documents", tone: "red", icon: "doc" },
  { t: "7 interviews scheduled today", tone: "blue", icon: "chat" },
  { t: "4 companies awaiting verification", tone: "navy", icon: "building" },
  { t: "3 OEP licenses expiring soon", tone: "amber", icon: "shield" },
  { t: "8 selected candidates awaiting processing", tone: "purple", icon: "clock" },
] as const;

export const revenue = { gross: "$2.84M", outstanding: "$486K", oepPayable: "$312K", net: "$2.04M" };

export const topOeps = [
  { rank: 1, name: "Global Talent Solutions", score: 98, deployed: 214 },
  { rank: 2, name: "HR Connect Overseas", score: 92, deployed: 176 },
  { rank: 3, name: "ABC Recruitment Agency", score: 88, deployed: 142 },
  { rank: 4, name: "Future Workforce", score: 84, deployed: 118 },
  { rank: 5, name: "Bright Manpower", score: 80, deployed: 97 },
] as const;

export const pendingCompanies = [
  { name: "Al-Rajhi Construction Co.", cr: "CR-1010293", city: "Dubai, UAE", industry: "Construction", when: "2h ago" },
  { name: "Gulf Facilities Mgmt", cr: "CR-2049182", city: "Doha, Qatar", industry: "Facilities", when: "5h ago" },
  { name: "Atlas Steel Works", cr: "CR-3920184", city: "Hamburg, DE", industry: "Industrial", when: "1d ago" },
  { name: "Najd Logistics", cr: "CR-5810293", city: "Dubai, UAE", industry: "Logistics", when: "1d ago" },
] as const;

export const activity = [
  { t: "New employer registered — Al-Rajhi Construction", when: "2 min ago", icon: "building" },
  { t: "Candidate shortlisted for FP-4587 (Industrial Electrician)", when: "9 min ago", icon: "star" },
  { t: "OEP Global Talent submitted 14 candidates for FP-4562", when: "21 min ago", icon: "users" },
  { t: "Document verified — Muhammad Ali (Passport)", when: "34 min ago", icon: "check-circle" },
  { t: "Interview scheduled — Hassan Raza, 3:00 PM", when: "1h ago", icon: "chat" },
  { t: "Requirement FP-4601 marked urgent by Operations", when: "2h ago", icon: "doc" },
] as const;

export const navItems = [
  { label: "Command Center", icon: "gear", href: "/admin", active: true },
  { label: "Companies", icon: "building", href: "/admin/companies" },
  { label: "Partners", icon: "handshake", href: "/admin/oeps" },
  { label: "Candidates", icon: "users", href: "/admin/candidates" },
  { label: "Requirements", icon: "doc", href: "/admin/requirements" },
  { label: "CRM", icon: "users", href: "/admin/crm" },
  { label: "Replacements", icon: "shield", href: "/admin/replacements" },
  { label: "Documents", icon: "shield", href: "/admin/documents" },
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
