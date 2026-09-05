"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"PARTICIPANT" | "VALIDATOR">("PARTICIPANT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, institutionName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(data.role === "VALIDATOR" ? "/queue" : "/dashboard");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-semibold text-teal-dark mb-2">
          Create an account
        </h1>
        <p className="text-ink/70 mb-8">
          Participants submit acts. Validators confirm them for an institution.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-8 space-y-5">
          <div className="flex gap-2 p-1 bg-cream-dim rounded-full">
            {(["PARTICIPANT", "VALIDATOR"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors ${
                  role === r ? "bg-teal text-white" : "text-teal-dark"
                }`}
              >
                {r === "PARTICIPANT" ? "Participant" : "Validator"}
              </button>
            ))}
          </div>

          <Field label="Name">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>
          {role === "VALIDATOR" && (
            <Field label="Institution name">
              <input
                required
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. Riverside Community Food Bank"
                className="input"
              />
            </Field>
          )}

          {error && <p className="text-sm text-terracotta-dark">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-terracotta text-white font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Already have an account?{" "}
          <Link href="/login" className="text-terracotta-dark font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-teal-dark mb-1">{label}</span>
      {children}
    </label>
  );
}
