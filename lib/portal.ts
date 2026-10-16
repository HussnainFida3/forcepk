// Auth-aware portal / create-account links per audience.
// If the signed-in user matches the audience → their portal; otherwise the
// audience's create-account page.
export function portalLinks(role?: string | null) {
  const isEmployer = !!role && role.startsWith("EMPLOYER");
  const isOep = !!role && role.startsWith("OEP");
  const isCandidate = role === "CANDIDATE";
  return {
    employer: { href: isEmployer ? "/employer" : "/register/employer", own: isEmployer },
    candidate: { href: isCandidate ? "/candidate" : "/register/candidate", own: isCandidate },
    partner: { href: isOep ? "/partner" : "/register/oep", own: isOep },
  };
}
