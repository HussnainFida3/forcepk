import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Cookie Policy" };

const sections: [string, string][] = [
  ["What are cookies", "Cookies are small text files stored on your device when you visit a website. They help the site work, remember your preferences, and understand how it is used."],
  ["Essential cookies", "We use strictly necessary cookies to run the platform — for authentication, keeping you signed in, security, and session management. These cannot be switched off as the service would not work without them."],
  ["Preference cookies", "We store a small cookie to remember your chosen language (English, Arabic or Urdu) so you don't have to set it on every visit."],
  ["Analytics cookies", "With your consent, we may use analytics cookies to understand aggregate usage — which pages are visited and how the platform performs — so we can improve it. These are never used without your consent."],
  ["Managing cookies", "You can accept or decline non-essential cookies using the banner shown on your first visit, and change your choice at any time by clearing cookies in your browser. Most browsers also let you block or delete cookies in their settings."],
  ["Third-party services", "Some features (email delivery, media hosting, AI matching, payments) are provided by trusted processors that may set their own cookies when used. We only enable these where needed to deliver the service."],
  ["Contact", "Questions about our use of cookies? Email privacy@forcepk.com."],
];

export default function Cookies() {
  return <LegalPage title="Cookie Policy" intro="This policy explains how ForcePK (forcepk.com) uses cookies and similar technologies." sections={sections} />;
}
