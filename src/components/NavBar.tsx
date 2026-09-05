"use client";

import { useRouter } from "next/navigation";

export function NavBar({ name, roleLabel }: { name: string; roleLabel: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="font-display text-lg font-semibold text-teal-dark">
          My<span className="text-terracotta">Kind</span>
        </span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-ink/70">
            {name} · <span className="text-terracotta-dark font-semibold">{roleLabel}</span>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 rounded-full border border-teal text-teal-dark font-semibold hover:bg-teal hover:text-white transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
