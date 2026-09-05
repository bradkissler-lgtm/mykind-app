"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PILLAR_LABELS, PILLARS } from "@/lib/pillars";
import type { Pillar } from "@prisma/client";

export function ActRow({
  act,
}: {
  act: { id: string; description: string; participantName: string };
}) {
  const router = useRouter();
  const [pillar, setPillar] = useState<Pillar>(PILLARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function decide(decision: "VALIDATED" | "REJECTED") {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/acts/${act.id}/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, pillar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <li className="bg-white border border-line rounded-xl p-4 space-y-3">
      <div>
        <p className="text-ink">{act.description}</p>
        <p className="text-xs text-ink/60 mt-1">Submitted by {act.participantName}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={pillar}
          onChange={(e) => setPillar(e.target.value as Pillar)}
          className="text-sm px-3 py-2 rounded-lg border border-line bg-cream-dim"
          disabled={submitting}
        >
          {PILLARS.map((p) => (
            <option key={p} value={p}>
              {PILLAR_LABELS[p]}
            </option>
          ))}
        </select>
        <button
          onClick={() => decide("VALIDATED")}
          disabled={submitting}
          className="px-4 py-2 rounded-full bg-teal text-white text-sm font-semibold hover:bg-teal-dark transition-colors disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          onClick={() => decide("REJECTED")}
          disabled={submitting}
          className="px-4 py-2 rounded-full border border-line text-ink/70 text-sm font-semibold hover:bg-cream-dim transition-colors disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {error && <p className="text-sm text-terracotta-dark">{error}</p>}
    </li>
  );
}
