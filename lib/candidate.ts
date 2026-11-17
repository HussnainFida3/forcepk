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

export const appStatus = ["Applied", "Screening", "Shortlisted", "Interview", "Selected", "Processing", "Departure", "Joined"] as const;

export const docTone: Record<string, string> = {
  Verified: "bg-brand/10 text-brand-dark",
  Pending: "bg-amber-100 text-amber-700",
  Missing: "bg-red-100 text-red-700",
};
