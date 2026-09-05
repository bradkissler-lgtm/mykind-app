import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { originMismatchResponse } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = originMismatchResponse(req);
  if (originError) return originError;

  await destroySession();
  return NextResponse.json({ ok: true });
}
