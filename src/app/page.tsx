import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-terracotta-dark mb-4">
          MyKind — prototype
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-teal-dark mb-6">
          The platform that makes character count.
        </h1>
        <p className="text-lg text-ink/80 mb-10">
          A verified act, confirmed by the institution closest to it, organized into
          one of four pillars. This is the core loop only — a working prototype, not
          the full platform.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/signup"
            className="px-7 py-3 rounded-full bg-terracotta text-white font-semibold hover:bg-terracotta-dark transition-colors"
          >
            Create an account
          </Link>
          <Link
            href="/login"
            className="px-7 py-3 rounded-full border-2 border-teal text-teal-dark font-semibold hover:bg-teal hover:text-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
