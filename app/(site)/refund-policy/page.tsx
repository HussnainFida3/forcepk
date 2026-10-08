import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Refund & Replacement Policy" };

const sections: [string, string][] = [
  ["Scope", "This policy covers service fees paid by employers to ForcePK for recruitment and deployment services. Candidates are never charged (see our Ethical Recruitment & No-Fee Policy)."],
  ["Free replacement guarantee", "If a deployed candidate leaves or is found unsuitable within the agreed guarantee period stated in your service agreement (typically 1–3 months), ForcePK will source a suitable replacement at no additional service fee."],
  ["When a refund applies", "Where a replacement cannot be provided within a reasonable time, or a confirmed order is cancelled by ForcePK before deployment, the corresponding service fee is refunded on a pro-rata basis."],
  ["When a refund does not apply", "Fees are non-refundable where the candidate was deployed and completed the guarantee period, where the issue arises from the employer changing the role or terms after selection, or where third-party government charges (visa, medical, attestation) have already been incurred."],
  ["Third-party costs", "Government and processing charges paid to external authorities (visa, medical, attestation, air travel) are set by those authorities and are generally non-refundable once incurred."],
  ["How to request", "Raise a replacement or refund request through your employer portal, or email finance@forcepk.com with your requirement reference. We acknowledge requests within 2 business days."],
  ["Processing time", "Approved refunds are processed to the original payment method within 7–14 business days, depending on your bank or payment provider."],
];

export default function Refund() {
  return <LegalPage title="Refund & Replacement Policy" intro="How replacements and refunds work for ForcePK recruitment services." sections={sections} />;
}
