import Icon from "./Icon";

// Floating WhatsApp contact button, shown on every page.
export default function WhatsAppButton() {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+10000000000").replace(/[^\d]/g, "");
  const msg = encodeURIComponent("Hi ForcePK, I'd like to discuss a manpower requirement.");
  return (
    <a
      href={`https://wa.me/${number}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg shadow-[#25D366]/30 transition hover:scale-105 hover:shadow-xl"
    >
      <Icon name="whatsapp" className="h-6 w-6" />
      <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-white/70" />
    </a>
  );
}
