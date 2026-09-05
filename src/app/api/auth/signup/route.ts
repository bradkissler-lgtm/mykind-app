import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { isValidEmail, originMismatchResponse } from "@/lib/security";
import type { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  const originError = originMismatchResponse(req);
  if (originError) return originError;

  const body = await req.json();
  const { name, email: rawEmail, password, role, institutionName } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
    institutionName?: string;
  };
  const email = rawEmail?.trim().toLowerCase();

  if (!name?.trim() || !email || !password || !role) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (role !== "PARTICIPANT" && role !== "VALIDATOR") {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }
  if (role === "VALIDATOR" && !institutionName?.trim()) {
    return NextResponse.json(
      { error: "Institution name is required for validators." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let institutionId: string | undefined;
  if (role === "VALIDATOR") {
    const institution = await prisma.institution.upsert({
      where: { name: institutionName!.trim() },
      update: {},
      create: { name: institutionName!.trim() },
    });
    institutionId = institution.id;
  }

  const user = await prisma.user.create({
    data: { name: name.trim(), email, passwordHash, role, institutionId },
  });

  await createSession({ userId: user.id, role: user.role });

  return NextResponse.json({ ok: true, role: user.role });
}
