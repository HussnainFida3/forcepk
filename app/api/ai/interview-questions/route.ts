import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { interviewQuestions } from "@/lib/integrations/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body?.profession) return NextResponse.json({ error: "profession required" }, { status: 400 });
  const result = await interviewQuestions(body.profession, body.experience);
  return NextResponse.json(result);
}
