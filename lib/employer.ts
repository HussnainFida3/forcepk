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

export const empPipeline = [
  "Requirement", "Sourcing", "Screening", "Shortlisted", "Interview",
  "Selected", "Documentation", "Visa / Processing", "Departure", "Joined",
] as const;
