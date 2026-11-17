import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccess } from "@/lib/rbac";
import type { Role } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Same-origin mailbox proxy for the ForcePK admin.
 *
 * The admin area is guarded by a NextAuth session cookie, which the browser
 * can't read as a bearer token, so the mailbox page calls this route with its
 * session instead. We verify the caller is an admin here, then forward to the
 * shared mail service (command.naxorai.com) with a shared secret — the service
 * trusts that we've already authenticated the admin and returns only ForcePK's
 * mail. The secret never reaches the browser.
 */

const MAIL = process.env.MAIL_SERVICE_URL ?? "https://command.naxorai.com";
const ENDPOINT = `${MAIL}/api/mail-service`;
const SECRET = process.env.MAIL_PROXY_SECRET ?? "";
const PLATFORM = "forcepk";

async function guard(): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  if (!role) return { ok: false, status: 401, error: "Not signed in." };
  if (!canAccess(role, "/admin")) return { ok: false, status: 403, error: "Not authorized." };
  if (!SECRET) return { ok: false, status: 503, error: "Mailbox is not configured yet (missing MAIL_PROXY_SECRET)." };
  return { ok: true };
}

function pass(res: Response, text: string) {
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
}

export async function GET(req: NextRequest) {
  const g = await guard();
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });
  const url = `${ENDPOINT}?${req.nextUrl.searchParams.toString()}`;
  const res = await fetch(url, { headers: { "X-Mail-Secret": SECRET, "X-Platform": PLATFORM }, cache: "no-store" });
  return pass(res, await res.text());
}

export async function POST(req: NextRequest) {
  const g = await guard();
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });
  const body = await req.text();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Mail-Secret": SECRET, "X-Platform": PLATFORM },
    body,
    cache: "no-store",
  });
  return pass(res, await res.text());
}
