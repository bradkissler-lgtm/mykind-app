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
npm run seed             # optional: populates a demo-ready institution + 3 participants
npm run dev
```

Then open http://localhost:3000. Either sign up fresh (Validator first — that creates
an institution — then a Participant in a separate browser/incognito window to submit
an act against it), or log in with the seeded demo accounts, all password
`demo12345`:

- Validator: `dana@riverside-demo.org` (Riverside Community Food Bank — 2 acts already
  pending in the queue, 2 already confirmed, 1 rejected, for a walkthrough that doesn't
  start empty)
- Participants: `priya@example.com`, `marcus@example.com`, `sofia@example.com`

`npm run seed` **wipes all existing data first** — only run it against a local/demo
database, never anything with real submissions in it.

`.env.example` has the two required variables — `DATABASE_URL` and `SESSION_SECRET`.
**Replace `SESSION_SECRET` with a real random value before any real deployment** — the
app refuses to start in production if it's still the committed placeholder (see
`src/lib/security.ts`).

## Hardening done for demo use

- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, a locked-down
  `Permissions-Policy`, `Referrer-Policy`) via `next.config.ts`.
- Origin-check CSRF mitigation on every state-changing route (signup, login, logout,
  submit act, validate act) — rejects cross-site POSTs even if cookie `SameSite`
  policy is ever loosened. See `src/lib/security.ts`.
- Server-side email format validation and input trimming/normalization on signup and
  login (previously relied on the browser's `type="email"`, which is easy to bypass).
- Fails fast at startup if `SESSION_SECRET` is missing, and refuses to run in
  production with the example placeholder value still set.
- On-brand SVG favicon (`src/app/icon.svg`) — no binary file needed.
- A demo seed script (`npm run seed`) so a walkthrough has real-looking data instead
  of an empty database.

**Known, accepted gap:** `npm audit` flags a high-severity advisory in `deepmerge-ts`,
a transitive dependency of the `prisma` CLI's config loader. It's a dev-tool-only
dependency (not `@prisma/client`, which is what actually ships and runs), and the
advisory is a stack-exhaustion DoS triggered by deeply recursive config objects — not
something exposed to any input this app accepts. Not worth the breaking downgrade
`npm audit fix --force` would apply; revisit if Prisma ships a non-breaking fix.

## What's still deliberately left out (per the plan's own V1 scope, and to keep this a
focused prototype)

- Payments, sponsor tooling, rewards fulfillment
- Multi-source validation (recipient/witness confirmation) — this prototype supports
  single institutional validator confirmation only
- Fraud detection, disputes/appeals workflow
- Email verification, password reset
- Any AI-assisted classification — pillar tagging is entirely human (validator) input
- Rate limiting on login/signup — a naive in-memory limiter wouldn't hold up once this
  runs on serverless (no shared memory across invocations), so it's better left
  undone than built as something that looks like protection but isn't. Worth real
  infrastructure (e.g. Upstash Redis, or the hosting platform's built-in limiter) once
  this is actually deployed.
- Real hosting/deployment — this runs against a local SQLite file; moving to
  production Postgres + real hosting (e.g. Vercel + a managed Postgres provider) is a
  follow-up, not done here. SQLite in particular won't survive serverless deployment
  (ephemeral filesystem) — that switch has to happen together with getting real
  hosting, not before.

## Ownership

This code was built with Claude Code for Bradley Kissler / MyKind and lives in this
repository under his GitHub account — it's a normal owned software asset, not
something licensed from or tied to Anthropic. Third-party packages (Next.js, Prisma,
etc.) carry their own open-source licenses; review those before any commercial
redistribution that bundles them.
