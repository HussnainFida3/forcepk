import { toneMap } from "./admin";
export { toneMap };

export const oepNav = [
  { label: "Dashboard", icon: "wheel", href: "/partner" },
  { label: "Job Marketplace", icon: "doc", href: "/partner/requirements" },
  { label: "Submit Candidates", icon: "bolt", href: "/partner/submit" },
  { label: "My Submissions", icon: "users", href: "/partner/submissions" },
  { label: "Post Requirement", icon: "briefcase", href: "/partner/post-requirement" },
  { label: "My Requirements", icon: "pin", href: "/partner/my-requirements" },
  { label: "Earnings", icon: "award", href: "/partner/earnings" },
  { label: "Agreement", icon: "doc", href: "/partner/agreement" },
  { label: "Messages", icon: "chat", href: "/messages" },
  { label: "Company Profile", icon: "building", href: "/partner/profile" },
] as const;

export const oepCards = [
  { label: "Open Requirements", value: "12", icon: "doc", tone: "navy" },
  { label: "Assigned", value: "8", icon: "briefcase", tone: "green" },
  { label: "Candidates Submitted", value: "420", icon: "users", tone: "purple" },
  { label: "Shortlisted", value: "180", icon: "star", tone: "amber" },
  { label: "Interviews", value: "95", icon: "chat", tone: "teal" },
  { label: "Selected", value: "72", icon: "check-circle", tone: "green" },
  { label: "Deployed", value: "61", icon: "globe", tone: "blue" },
  { label: "Commission (PKR)", value: "485K", icon: "award", tone: "navy" },
] as const;

export const marketplace = [
  { id: "FP-4587", title: "Electricians", city: "Dubai, UAE", req: 50, exp: "3+ years", deadline: "20 Oct", status: "Open" },
  { id: "FP-4620", title: "HVAC Technicians", city: "Doha, Qatar", req: 30, exp: "2+ years", deadline: "25 Oct", status: "Open" },
  { id: "FP-4622", title: "Plumbers", city: "Riyadh, KSA", req: 40, exp: "3+ years", deadline: "28 Oct", status: "Open" },
  { id: "FP-4631", title: "Cleaners", city: "Dubai, UAE", req: 20, exp: "1+ years", deadline: "30 Oct", status: "Open" },
  { id: "FP-4640", title: "Heavy Drivers", city: "Singapore", req: 25, exp: "4+ years", deadline: "02 Nov", status: "Open" },
] as const;

export const performance = [
  { label: "Candidates Submitted", value: "420", icon: "users", tone: "purple" },
  { label: "Shortlisted", value: "180", icon: "star", tone: "amber" },
  { label: "Selected", value: "72", icon: "check-circle", tone: "green" },
  { label: "Deployed", value: "61", icon: "globe", tone: "blue" },
] as const;

export const perfMetrics = [
  { label: "Selection Rate", value: "17.1%", icon: "star" },
  { label: "Document Accuracy", value: "96%", icon: "shield" },
  { label: "Response Time", value: "4.2 hrs", icon: "clock" },
] as const;

export const ranking = { tier: "Gold Partner", rank: 3, rating: 4.8 };

export const topPartners: { rank: number; name: string; score: number; you?: boolean }[] = [
  { rank: 1, name: "Global Talent Solutions", score: 98 },
  { rank: 2, name: "HR Connect Overseas", score: 92 },
  { rank: 3, name: "ABC Recruitment Agency", score: 88, you: true },
  { rank: 4, name: "Future Workforce", score: 84 },
  { rank: 5, name: "Bright Manpower", score: 80 },
];

export const submissionDocs = [
  "Candidate CV", "Passport", "National ID", "Photographs",
  "Experience certificates", "Educational documents", "Medical status", "Other documents",
] as const;

export const candidateTracking = ["Submitted", "Under Review", "Shortlisted", "Interview", "Selected", "Documentation", "Ready", "Deployed"] as const;
