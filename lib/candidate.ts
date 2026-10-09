import { toneMap } from "./admin";
export { toneMap };

export const canNav = [
  { label: "Dashboard", icon: "wheel", href: "/candidate" },
  { label: "My Profile", icon: "users", href: "/candidate/profile" },
  { label: "CV Builder", icon: "doc", href: "/candidate/cv" },
  { label: "Job Search", icon: "search", href: "/candidate/jobs" },
  { label: "Applications", icon: "briefcase", href: "/candidate/applications" },
  { label: "Documents", icon: "shield", href: "/candidate/documents" },
  { label: "Messages", icon: "chat", href: "/messages" },
] as const;

export const canCards = [
  { label: "Applied", value: "8", icon: "briefcase", tone: "navy" },
  { label: "Shortlisted", value: "2", icon: "star", tone: "amber" },
  { label: "Interviews", value: "1", icon: "chat", tone: "teal" },
  { label: "Profile Strength", value: "82%", icon: "check-circle", tone: "green" },
] as const;

export const matchedJobs = [
  { id: "FP-4587", title: "Industrial Electrician", city: "Dubai, UAE", salary: "$1,100 – 1,600 /mo", match: 94, exp: "3 years" },
  { id: "FP-4620", title: "HVAC Technician", city: "Doha, Qatar", salary: "$950 – 1,350 /mo", match: 88, exp: "2 years" },
  { id: "FP-4601", title: "Maintenance Technician", city: "Riyadh, KSA", salary: "$1,000 – 1,400 /mo", match: 83, exp: "3 years" },
  { id: "FP-4640", title: "Electrical Supervisor", city: "Singapore", salary: "$1,350 – 1,900 /mo", match: 79, exp: "5 years" },
] as const;

export const appStatus = ["Applied", "Screening", "Shortlisted", "Interview", "Selected", "Processing", "Departure", "Joined"] as const;

export const applications = [
  { id: "FP-4587", title: "Industrial Electrician — Dubai", stage: 2 },
  { id: "FP-4620", title: "HVAC Technician — Doha", stage: 3 },
  { id: "FP-4533", title: "Structural Welder — Singapore", stage: 1 },
] as const;

export const docWallet = [
  { name: "CV / Resume", status: "Verified" },
  { name: "Passport", status: "Verified" },
  { name: "National ID", status: "Verified" },
  { name: "Experience Certificate", status: "Pending" },
  { name: "Medical Report", status: "Missing" },
  { name: "Educational Documents", status: "Verified" },
] as const;

export const docTone: Record<string, string> = {
  Verified: "bg-brand/10 text-brand-dark",
  Pending: "bg-amber-100 text-amber-700",
  Missing: "bg-red-100 text-red-700",
};

export const profileChecklist = [
  { t: "Personal information", done: true },
  { t: "Profession & skills", done: true },
  { t: "Work experience", done: true },
  { t: "Education", done: true },
  { t: "Upload CV", done: true },
  { t: "Complete document wallet", done: false },
  { t: "Add certifications", done: false },
] as const;
