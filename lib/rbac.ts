import type { Role } from "@prisma/client";

// Which portal area each role may enter. Used by middleware + UI guards.
export const ADMIN_ROLES: Role[] = ["SUPER_ADMIN", "OWNER", "OPS_MANAGER", "FINANCE", "DOCUMENT_OFFICER", "INTERVIEW_MANAGER"];
export const EMPLOYER_ROLES: Role[] = ["EMPLOYER_ADMIN", "EMPLOYER_HR"];
export const OEP_ROLES: Role[] = ["OEP_ADMIN", "OEP_RECRUITER"];
export const CANDIDATE_ROLES: Role[] = ["CANDIDATE"];

export const AREA_ROLES: Record<string, Role[]> = {
  "/admin": ADMIN_ROLES,
  "/employer": EMPLOYER_ROLES,
  "/partner": OEP_ROLES,
  "/candidate": CANDIDATE_ROLES,
};

// Where to send a user after login, based on their role.
export function homeForRole(role: Role): string {
  if (ADMIN_ROLES.includes(role)) return "/admin";
  if (EMPLOYER_ROLES.includes(role)) return "/employer";
  if (OEP_ROLES.includes(role)) return "/partner";
  return "/candidate";
}

// Can `role` access a path under one of the protected areas?
export function canAccess(role: Role, pathname: string): boolean {
  const area = Object.keys(AREA_ROLES).find((a) => pathname === a || pathname.startsWith(a + "/"));
  if (!area) return true; // not a protected area
  return AREA_ROLES[area].includes(role);
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  OWNER: "Owner",
  OPS_MANAGER: "Operations Manager",
  EMPLOYER_ADMIN: "Employer Admin",
  EMPLOYER_HR: "Employer HR",
  OEP_ADMIN: "OEP Admin",
  OEP_RECRUITER: "OEP Recruiter",
  CANDIDATE: "Candidate",
  FINANCE: "Finance Manager",
  DOCUMENT_OFFICER: "Document Officer",
  INTERVIEW_MANAGER: "Interview Manager",
};
