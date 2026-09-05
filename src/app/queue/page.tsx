import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NavBar } from "@/components/NavBar";
import { ActRow } from "./ActRow";
import { PILLAR_LABELS } from "@/lib/pillars";

export default async function QueuePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "VALIDATOR") redirect("/dashboard");

  const validator = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  if (!validator.institutionId) redirect("/dashboard");

  const [institution, pending, reviewed] = await Promise.all([
    prisma.institution.findUniqueOrThrow({ where: { id: validator.institutionId } }),
    prisma.act.findMany({
      where: { institutionId: validator.institutionId, status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { participant: { select: { name: true } } },
    }),
    prisma.act.findMany({
      where: { institutionId: validator.institutionId, status: { not: "PENDING" } },
      orderBy: { validatedAt: "desc" },
      take: 10,
      include: { participant: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <NavBar name={validator.name} roleLabel={`Validator · ${institution.name}`} />
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 space-y-10">
        <section>
          <h1 className="font-display text-2xl font-semibold text-teal-dark mb-4">
            Pending confirmations
          </h1>
          {pending.length === 0 ? (
            <p className="text-ink/70 text-sm">Nothing waiting on your queue.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((act) => (
                <ActRow
                  key={act.id}
                  act={{
                    id: act.id,
                    description: act.description,
                    participantName: act.participant.name,
                  }}
                />
              ))}
            </ul>
          )}
        </section>

        {reviewed.length > 0 && (
          <section>
            <h2 className="font-display text-xl font-semibold text-teal-dark mb-4">
              Recently reviewed
            </h2>
            <ul className="space-y-2">
              {reviewed.map((act) => (
                <li
                  key={act.id}
                  className="text-sm bg-cream-dim border border-line rounded-lg p-3 flex items-center justify-between gap-4"
                >
                  <span className="text-ink/80">{act.description}</span>
                  <span
                    className={
                      act.status === "VALIDATED"
                        ? "text-teal-dark font-semibold shrink-0"
                        : "text-ink/50 shrink-0"
                    }
                  >
                    {act.status === "VALIDATED"
                      ? PILLAR_LABELS[act.pillar!]
                      : "Not confirmed"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
