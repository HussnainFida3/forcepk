import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Ethical Recruitment & No-Fee Policy" };

const sections: [string, string][] = [
  ["Our commitment", "ForcePK is committed to ethical, transparent and lawful recruitment. We follow the internationally recognised 'Employer Pays' principle: the costs of recruitment are borne by the employer, never by the worker."],
  ["No fees to candidates", "We do not charge candidates any fee to register, create a profile, be shortlisted, interviewed, selected or deployed. If anyone asks a candidate to pay a fee to secure a job through ForcePK, it is not authorised — please report it to us immediately."],
  ["No passport retention", "Workers retain possession and control of their passports and personal documents at all times. Documents uploaded to the platform are stored securely and shared only with authorised parties for a specific opportunity."],
  ["Transparent terms", "Candidates receive clear information about the role, employer, salary, benefits, accommodation, working hours and contract duration before accepting an offer. No contract substitution is permitted after arrival."],
  ["Licensed partners only", "Candidate sourcing is carried out through licensed Overseas Employment Promoters (OEPs) and recruitment partners who agree to uphold this policy and applicable labour laws."],
  ["Anti-forced-labour & anti-trafficking", "We prohibit any form of forced labour, bonded labour, human trafficking or exploitation across our network. Partners and employers must comply with applicable anti-slavery and labour-rights laws."],
  ["Grievances", "Candidates and workers can raise concerns at any stage without fear of retaliation. Email conduct@forcepk.com and we will investigate promptly and confidentially."],
];

export default function Ethical() {
  return <LegalPage title="Ethical Recruitment & No-Fee Policy" intro="How ForcePK protects the workers in its network — the employer pays, the worker never does." sections={sections} />;
}
