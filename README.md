# MyKind — core loop prototype

A working prototype of MyKind's participant/validator loop, per the MyKIND Business
Plan v27.5's "Interactive prototype" milestone (Month 2): a participant submits an
act, an institution's validator confirms it and tags a C4 pillar by hand, and the
participant sees it added to their record with a simple first-recognition moment.

This is **not** the Commercial V1 described in the plan — see "What's deliberately
left out" below.

## What's here

- Two account types: **Participant** and **Validator** (tied to one institution).
- A participant submits an act (a short description + which institution should
  confirm it).
- A validator sees a queue of pending acts for their institution and confirms or
  rejects each one, tagging the C4 pillar by hand (Compassion / Community /
  Contribution / Courage) — matching the plan's requirement that classification gets
  human review, not automated scoring.
- On confirmation, the act shows up on the participant's record with its pillar, and
  their first validated act triggers a simple recognition banner.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4)
- SQLite via Prisma — zero external accounts needed to run this locally
- Cookie-based sessions (HMAC-signed, `bcryptjs` for password hashing) — no
  third-party auth provider

## Running it locally

No `package-lock.json` is committed (it's 7000+ lines — too large to push through the
tooling available in this session); `npm install` will generate a fresh one from
`package.json`'s version ranges.

```bash
cp .env.example .env
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run dev
```

Then open http://localhost:3000, sign up as a Validator first (this creates an
institution), then sign up as a Participant in a separate browser/incognito window to
submit an act against it.

`.env.example` has the two required variables — `DATABASE_URL` and `SESSION_SECRET`.
**Replace `SESSION_SECRET` with a real random value before any real deployment**; the
example one is dev-only and is committed to the repo, so it provides zero security.

## What's deliberately left out (per the plan's own V1 scope, and to keep this a
focused prototype)

- Payments, sponsor tooling, rewards fulfillment
- Multi-source validation (recipient/witness confirmation) — this prototype supports
  single institutional validator confirmation only
- Fraud detection, disputes/appeals workflow
- Email verification, password reset
- Any AI-assisted classification — pillar tagging is entirely human (validator) input
- CSRF protection, rate limiting, and other production security hardening
- Real hosting/deployment — this runs against a local SQLite file; moving to
  production Postgres + real hosting (e.g. Vercel + a managed Postgres provider) is a
  follow-up, not done here

## Ownership

This code was built with Claude Code for Bradley Kissler / MyKind and lives in this
repository under his GitHub account — it's a normal owned software asset, not
something licensed from or tied to Anthropic. Third-party packages (Next.js, Prisma,
etc.) carry their own open-source licenses; review those before any commercial
redistribution that bundles them.
