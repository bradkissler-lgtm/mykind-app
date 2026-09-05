"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitActForm({
  institutions,
}: {
  institutions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [institutionId, setInstitutionId] = useState(institutions[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/acts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, institutionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setDescription("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (institutions.length === 0) {
    return (
      <p className="text-sm text-ink/70 bg-cream-dim border border-line rounded-xl p-4">
        No institutions have signed up as validators yet — an act needs an institution
        to confirm it. Ask one to create a validator account first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-6 space-y-4">
      <label className="block">
        <span className="block text-sm font-semibold text-teal-dark mb-1">
          What did you do?
        </span>
        <textarea
          required
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Helped organize the Saturday food pantry shift"
          className="input min-h-24"
        />
      </label>
      <label className="block">
        <span className="block text-sm font-semibold text-teal-dark mb-1">
          Which institution can confirm this?
        </span>
        <select
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className="input"
        >
          {institutions.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-terracotta-dark">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2.5 rounded-full bg-terracotta text-white font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit act"}
      </button>
    </form>
  );
}
