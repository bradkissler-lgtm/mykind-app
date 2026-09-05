"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
        <h1 className="font-display text-3xl font-semibold text-teal-dark mb-8">
          Log in
        </h1>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-2xl p-8 space-y-5">
          <label className="block">
            <span className="block text-sm font-semibold text-teal-dark mb-1">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-semibold text-teal-dark mb-1">Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </label>

          {error && <p className="text-sm text-terracotta-dark">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-full bg-terracotta text-white font-semibold hover:bg-terracotta-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/70">
          Need an account?{" "}
          <Link href="/signup" className="text-terracotta-dark font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
