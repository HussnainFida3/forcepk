import { cookies } from "next/headers";
import type { Locale } from "@/lib/dict";

export { LOCALES, dirFor, dict, t } from "@/lib/dict";
export type { Locale } from "@/lib/dict";

export function getLocale(): Locale {
  const c = cookies().get("locale")?.value as Locale | undefined;
  return c && ["en", "ar", "ur"].includes(c) ? c : "en";
}
