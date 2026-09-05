import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import type { Pillar } from "@prisma/client";

const VALID_PILLARS: Pillar[] = ["COMPASSION", "COMMUNITY", "CONTRIBUTION", "COURAGE"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "VALIDATOR") {
    return NextResponse.json({ error: "Only validators can confirm acts." }, { status: 403 });
  }

  const validator = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!validator?.institutionId) {
    return NextResponse.json({ error: "You're not attached to an institution." }, { status: 403 });
  }

  const { id } = await params;
  const { decision, pillar } = (await req.json()) as {
    decision?: "VALIDATED" | "REJECTED";
    pillar?: Pillar;
  };

  if (decision !== "VALIDATED" && decision !== "REJECTED") {
    return NextResponse.json({ error: "Invalid decision." }, { status: 400 });
  }
  if (decision === "VALIDATED" && !VALID_PILLARS.includes(pillar as Pillar)) {
    return NextResponse.json(
      { error: "Pick a C4 pillar to confirm this act." },
      { status: 400 },
    );
  }

  const act = await prisma.act.findUnique({ where: { id } });
  if (!act) {
    return NextResponse.json({ error: "Act not found." }, { status: 404 });
  }
  // A validator only confirms acts submitted against their own institution —
  // this is the "recipient/institution closest to the act" boundary from the
  // business plan, not an arbitrary restriction.
  if (act.institutionId !== validator.institutionId) {
    return NextResponse.json(
      { error: "This act belongs to a different institution." },
      { status: 403 },
    );
  }
  if (act.status !== "PENDING") {
    return NextResponse.json({ error: "This act has already been reviewed." }, { status: 409 });
  }

  const updated = await prisma.act.update({
    where: { id },
    data: {
      status: decision,
      pillar: decision === "VALIDATED" ? pillar : null,
      validatedAt: new Date(),
      validatorId: session.userId,
    },
  });

  return NextResponse.json({ ok: true, act: updated });
}
