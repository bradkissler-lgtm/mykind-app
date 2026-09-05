import { NextRequest, NextResponse } from "next/server";

const EXAMPLE_SESSION_SECRET = "replace-with-a-long-random-value-before-any-real-deployment";

/**
 * Cheap CSRF mitigation for cookie-authenticated mutations: same-site cookies
 * already block the browser from attaching the session cookie to a
 * cross-site POST, but this adds a second, explicit check so a misconfigured
 * cookie policy doesn't silently become the only line of defense.
 */
export function originMismatchResponse(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  // Same-origin requests from a browser always send Origin on POST/PUT/etc;
  // its absence means a non-browser client, which this check isn't for.
  if (!origin) return null;

  if (origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
  }
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

/**
 * Throws at startup (not per-request) if SESSION_SECRET is missing or is
 * still the placeholder from .env.example while running in production —
 * shipping a demo with a publicly-known signing secret would let anyone
 * forge a session cookie for any user.
 */
export function assertSessionSecretIsSafe() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set.");
  }
  if (process.env.NODE_ENV === "production" && secret === EXAMPLE_SESSION_SECRET) {
    throw new Error(
      "SESSION_SECRET is still the committed .env.example placeholder — set a real " +
        "random value before deploying.",
    );
  }
}
