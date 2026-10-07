import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="ForcePK home">
      <img
        src="/logo.png"
        alt="ForcePK"
        className={`h-12 w-12 shrink-0 object-contain ${light ? "rounded-lg bg-white p-1" : ""}`}
      />
      <span className="flex flex-col leading-none">
        <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-navy"}`}>
          FORCE<span className="text-brand">PK</span>
        </span>
        <span className={`text-[9px] font-medium tracking-wide ${light ? "text-white/60" : "text-navy/50"}`}>
          GLOBAL WORKFORCE SOLUTIONS
        </span>
      </span>
    </Link>
  );
}
