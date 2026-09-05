import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/NavBar";
import { SubmitActForm } from "./SubmitActForm";
import { PILLAR_LABELS } from "@/lib/pillars";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "PARTICIPANT") redirect("/queue");

  const [user, institutions, acts] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.userId } }),
    prisma.institution.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.act.findMany({
      where: { participantId: session.userId },
      orderBy: { createdAt: "desc" },
      include: { institution: { select: { name: true } } },
    }),
  ]);

  const validatedCount = acts.filter((a) => a.status === "VALIDATED").length;
  const justEarnedFirstRecognition = validatedCount === 1;

  return (
    <>
      <NavBar name={user.name} roleLabel="Participant" />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-8">
        {justEarnedFirstRecognition && (
          <div className="bg-gold/20 border border-gold rounded-2xl p-5 text-teal-dark">
            <p className="font-display text-lg font-semibold">
              🎉 You earned your first recognition!
            </p>
            <p className="text-sm mt-1">
              An institution confirmed your act — it&rsquo;s now part of your record.
            </p>
          </div>
        )}

        <section>
          <h1 className="font-display text-2xl font-semibold text-teal-dark mb-4">
            Submit an act
          </h1>
          <SubmitActForm institutions={institutions} />
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-teal-dark mb-4">
            Your record
          </h2>
          {acts.length === 0 ? (
            <p className="text-ink/70 text-sm">Nothing submitted yet.</p>
          ) : (
            <ul className="space-y-3">
              {acts.map((act) => (
                <li
                  key={act.id}
                  className="bg-white border border-line rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-ink">{act.description}</p>
                    <p className="text-xs text-ink/60 mt-1">{act.institution.name}</p>
                  </div>
                  <StatusBadge status={act.status} pillar={act.pillar} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}

function StatusBadge({
  status,
  pillar,
}: {
  status: "PENDING" | "VALIDATED" | "REJECTED";
  pillar: string | null;
}) {
  if (status === "PENDING") {
    return (
      <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-cream-dim text-ink/60 border border-line">
        Pending
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
        Not confirmed
      </span>
    );
  }
  return (
    <span className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-teal text-white">
      {PILLAR_LABELS[pillar as keyof typeof PILLAR_LABELS]}
    </span>
  );
}
