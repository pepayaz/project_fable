# Project Fable

Project Fable is a people operations internal-tool MVP for small organizations, committees, communities, and student teams. It helps teams manage staff, departments, tasks, attendance, availability, performance notes, users, audit logs, imports/exports, and operational dashboards from one focused workspace.

The project is portfolio-ready with a demo/staging deployment on Vercel + Neon PostgreSQL. It is not positioned as enterprise production software.

## Demo Status

- Demo deployment: Vercel staging, available on request.
- Database: Neon PostgreSQL on the `deployment/postgres` branch.
- Repository: private unless explicitly approved for public release.
- Stable baseline: `main`/`master` remains SQLite-first.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL on `deployment/postgres`
- SQLite baseline on `main`/`master`
- Zod
- Server Actions
- GitHub Actions CI
- Vercel + Neon

## Core Features

- Staff and department management.
- Task assignment and tracking.
- Attendance and availability tracking.
- Performance notes.
- Dashboard and People Intelligence views.
- Staff 360 profile.
- Member self-service portal.
- Admin user management and coarse RBAC.
- Soft delete, trash, and restore.
- Audit logs.
- CSV import/export and templates.
- Assistive AI briefings and writing drafts.

## Architecture Summary

Project Fable uses Next.js App Router with Server Actions and service-layer modules. Prisma handles database access. The PostgreSQL deployment branch uses a generated Prisma client under `lib/generated/prisma`, which is intentionally ignored and generated during build.

Runtime deployment uses Vercel app hosting and Neon PostgreSQL. Vercel uses a pooled Neon runtime connection, while local Prisma migration work should use a direct Neon connection when needed.

See `docs/ARCHITECTURE_OVERVIEW.md` for the text diagram and deployment overview.

## Security Summary

Project Fable is a secure internal-tool MVP:

- First-party authentication.
- Scrypt-style password hashing.
- Hashed session tokens.
- Server-side RBAC checks.
- Admin-only user management, trash restore, and audit review.
- Production seed safety.
- Basic security headers and protected route checks.

This is not an enterprise-grade security claim. Additional production hardening would be needed before handling sensitive real organizational data at scale.

## AI Summary

AI features are optional and review-only. They can draft staff briefs, weekly people-ops summaries, follow-up messages, performance note drafts, and availability reminders.

AI output is not automatically saved, sent, or treated as a final HR decision. Prompts use whitelisted data and avoid password hashes, session tokens, raw audit logs, and sensitive performance-note details.

## Deployment Summary

The `deployment/postgres` branch is deployed to Vercel with Neon PostgreSQL for demo/staging review.

- Vercel Function region was moved closer to Neon.
- Vercel runtime `DATABASE_URL` uses Neon pooling.
- Local migration work should use a direct Neon connection.
- Free/staging infrastructure may still have cold-start or runtime latency.

## Local Setup

Install dependencies:

```powershell
npm install
```

Copy environment example:

```powershell
Copy-Item .env.example .env
```

Local PostgreSQL URL for this branch:

```env
DATABASE_URL="postgresql://fable:fable_dev_password@localhost:5432/project_fable?schema=public"
```

Run checks:

```powershell
npm run seed
npx prisma migrate status
npm run lint
npm run build
```

Do not commit `.env`, local database files, or generated Prisma client output.

## Key Documents

- `docs/PORTFOLIO_CASE_STUDY.md` - polished portfolio case study.
- `docs/DEMO_SCRIPT.md` - 5-8 minute demo flow.
- `docs/SCREENSHOT_CHECKLIST.md` - portfolio screenshot checklist.
- `docs/ARCHITECTURE_OVERVIEW.md` - app and deployment architecture.
- `docs/FINAL_SMOKE_TEST.md` - final browser smoke test guide.
- `docs/VERCEL_NEON_DEPLOYMENT.md` - Vercel + Neon runtime notes.
- `docs/DEPLOYMENT_PREP.md` - deployment prep and safety checklist.
- `docs/DB_MIGRATION.md` - PostgreSQL migration notes.
- `docs/OPERATIONS.md` - operational checklist.

## Honest Limitations

- Demo/staging deployment is not enterprise production readiness.
- No OAuth, SSO, 2FA, password reset, or password rotation flow yet.
- RBAC is intentionally coarse.
- Audit logs are not tamper-proof.
- Pagination and exports are MVP-scale.
- AI depends on provider availability and remains optional.
- Staging data may be empty unless seeded intentionally.
- Free/staging infrastructure may show cold starts.

## Agent Workflow

Use PowerShell-compatible commands and RTK where possible:

```powershell
rtk git status
rtk find .
rtk git diff
rtk test npm run lint
rtk test npm run build
```

Current deployment work belongs on `deployment/postgres`. Do not merge to `main`/`master`, expose secrets, or deploy without explicit approval.
