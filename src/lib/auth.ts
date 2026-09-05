import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import type { Role } from "@prisma/client";
import { assertSessionSecretIsSafe } from "./security";

const COOKIE_NAME = "mykind_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
  userId: string;
  role: Role;
};

assertSessionSecretIsSafe();

function getSecret(): string {
  return process.env.SESSION_SECRET!;
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

/**
 * Session cookie is a self-contained signed token (payload.signature), not a
 * database-backed session id — fine for this prototype's scale, but means
 * revoking a session early (e.g. on password change) isn't possible yet.
 */
export function encodeSession(payload: SessionPayload): string {
  const json = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(json);
  return `${json}.${signature}`;
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [json, signature] = token.split(".");
  if (!json || !signature) return null;

  const expected = sign(json);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(json, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload) {
  const store = await cookies();
  store.set(COOKIE_NAME, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE_NAME)?.value);
}
