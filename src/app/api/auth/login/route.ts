import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { originMismatchResponse } from "@/lib/security";

export async function POST(req: NextRequest) {
  const originError = originMismatchResponse(req);
  if (originError) return originError;

  const { email: rawEmail, password } = (await req.json()) as {
    email?: string;
    password?: string;
  };
  const email = rawEmail?.trim().toLowerCase();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession({ userId: user.id, role: user.role });

  return NextResponse.json({ ok: true, role: user.role });
}
