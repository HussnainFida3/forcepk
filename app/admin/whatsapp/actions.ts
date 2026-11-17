"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
import { ADMIN_ROLES } from "@/lib/rbac";
import { sendWhatsAppText, normalizeWaNumber } from "@/lib/whatsapp";

async function guard() {
  const u = await currentUser();
  if (!u || !ADMIN_ROLES.includes(u.role as never)) throw new Error("Not authorized");
}

/** Send a WhatsApp message to a number and record it in the inbox. */
export async function sendWhatsApp(fd: FormData) {
  await guard();
  const to = normalizeWaNumber(String(fd.get("to") ?? ""));
  const body = String(fd.get("body") ?? "").trim();
  if (!to || !body) return;
  const r = await sendWhatsAppText(to, body);
  await prisma.whatsAppMessage.create({
    data: { waId: to, direction: "OUT", body, messageId: r.id ?? null, status: r.ok ? "sent" : "failed", contactName: null },
  });
  revalidatePath("/admin/whatsapp");
}
