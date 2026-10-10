import { toneMap } from "./admin";
export { toneMap };

export const empNav = [
  { label: "Dashboard", icon: "wheel", href: "/employer" },
  { label: "Post Requirement", icon: "bolt", href: "/employer/requirements/new" },
  { label: "My Requirements", icon: "doc", href: "/employer/requirements" },
  { label: "Pipeline", icon: "briefcase", href: "/employer/pipeline" },
  { label: "Candidates", icon: "users", href: "/employer/candidates" },
  { label: "Interviews", icon: "chat", href: "/employer/interviews" },
  { label: "Replacements", icon: "shield", href: "/employer/replacements" },
  { label: "Invoices", icon: "award", href: "/employer/invoices" },
  { label: "Agreement", icon: "doc", href: "/employer/agreement" },
  { label: "Messages", icon: "globe", href: "/messages" },
  { label: "Company Profile", icon: "building", href: "/employer/profile" },
] as const;

export const empCards = [
  { label: "Active Requirements", value: "12", icon: "doc", tone: "navy" },
  { label: "Candidates Received", value: "348", icon: "users", tone: "green" },
  { label: "Shortlisted", value: "76", icon: "star", tone: "purple" },
  { label: "Interviews", value: "32", icon: "chat", tone: "teal" },
  { label: "Selected", value: "18", icon: "check-circle", tone: "green" },
  { label: "Processing", value: "15", icon: "clock", tone: "amber" },
  { label: "Deployed", value: "9", icon: "globe", tone: "navy" },
] as const;

export const empRequirements = [
  { id: "FP-4587", title: "30 Electricians", city: "Dubai, UAE", exp: "2–5 years", received: 92, status: "Active", posted: "Apr 28" },
  { id: "FP-4562", title: "20 Drivers", city: "Riyadh, KSA", exp: "1–3 years", received: 64, status: "Active", posted: "Apr 25" },
  { id: "FP-4533", title: "15 Welders", city: "Doha, Qatar", exp: "3–5 years", received: 48, status: "Shortlisting", posted: "Apr 22" },
  { id: "FP-4590", title: "10 Warehouse Workers", city: "Dubai, UAE", exp: "1–2 years", received: 37, status: "Active", posted: "Apr 20" },
  { id: "FP-4601", title: "8 HVAC Technicians", city: "Riyadh, KSA", exp: "2–4 years", received: 29, status: "Interview", posted: "Apr 18" },
] as const;

export const candidateFlow = [
  { stage: "Applied", value: 348, pct: 100 },
  { stage: "Shortlisted", value: 76, pct: 22 },
  { stage: "Interviewed", value: 32, pct: 9 },
  { stage: "Selected", value: 18, pct: 5 },
] as const;

export const comparison = [
  { name: "Ahmad Khan", age: 28, city: "Lahore, PK", match: 92, rows: { Experience: 4, Skills: 4, Certifications: 3, "Overseas Experience": 3, "Interview Score": 4 }, verified: true },
  { name: "Usman Ali", age: 32, city: "Karachi, PK", match: 86, rows: { Experience: 5, Skills: 4, Certifications: 4, "Overseas Experience": 4, "Interview Score": 4 }, verified: true },
  { name: "Hassan Raza", age: 26, city: "Faisalabad, PK", match: 78, rows: { Experience: 3, Skills: 4, Certifications: 3, "Overseas Experience": 2, "Interview Score": 3 }, verified: true },
] as const;

export const compRows = ["Experience", "Skills", "Certifications", "Overseas Experience", "Interview Score"] as const;

export const empPipeline = [
  "Requirement", "Sourcing", "Screening", "Shortlisted", "Interview",
  "Selected", "Documentation", "Visa / Processing", "Departure", "Joined",
] as const;
