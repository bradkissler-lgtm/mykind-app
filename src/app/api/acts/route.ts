import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PARTICIPANT") {
    return NextResponse.json({ error: "Only participants can submit acts." }, { status: 403 });
  }

  const { description, institutionId } = (await req.json()) as {
    description?: string;
    institutionId?: string;
  };

  if (!description?.trim() || !institutionId) {
    return NextResponse.json(
      { error: "A description and institution are required." },
      { status: 400 },
    );
  }
  if (description.trim().length > 500) {
    return NextResponse.json(
      { error: "Keep the description under 500 characters." },
      { status: 400 },
    );
  }

  const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
  if (!institution) {
    return NextResponse.json({ error: "That institution doesn't exist." }, { status: 400 });
  }

  const act = await prisma.act.create({
    data: {
      description: description.trim(),
      participantId: session.userId,
      institutionId,
    },
  });

  return NextResponse.json({ ok: true, act });
}
