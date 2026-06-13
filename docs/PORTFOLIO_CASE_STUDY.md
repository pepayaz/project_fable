# Portfolio Case Study: Project Fable

## Project Overview

Project Fable is a secure internal-tool MVP for people operations workflows in small organizations, committees, communities, and student teams. It centralizes staff records, departments, task ownership, attendance, availability, performance notes, dashboard reporting, audit logs, data tools, and role-based access in one focused application.

The project is portfolio-ready and has a demo/staging deployment on Vercel with Neon PostgreSQL. It is not positioned as enterprise production software.

## Problem Statement

Small teams often manage people operations across spreadsheets, chat threads, and disconnected notes. That makes it hard to answer basic operational questions: who is active, who owns work, who is overloaded, who has missing availability, and what changed recently.

Project Fable solves that problem with a practical internal app that keeps people, work, access, and operational signals in one place without the weight of a full enterprise HR platform.

## Target Users

- Student organizations, committees, and university clubs.
- Community teams and volunteer groups.
- Small people operations or human capital teams.
- Portfolio reviewers who want to see a realistic full-stack internal tool.

## Scope and Constraints

The project was intentionally scoped as an MVP. It prioritizes reliable workflows, clear data ownership, and demo-ready polish over broad HR-suite coverage.

Key constraints:

- Keep the stable `main`/`master` branch SQLite-first.
- Use `deployment/postgres` for the PostgreSQL deployment candidate.
- Avoid enterprise HR features before the MVP is stable.
- Keep AI assistive and review-only.
- Keep secrets and generated files out of Git.
- Treat Vercel + Neon as demo/staging infrastructure, not enterprise production readiness.

## Core Features

- Staff and department CRUD.
- Task assignment and tracking.
- Attendance and availability tracking.
- Performance notes as secondary MVP context.
- Dashboard metrics and visual analytics.
- People Intelligence page with workload, availability, attention, and weekly signals.
- Staff 360 profile for detail review.
- Member portal for self-service task and availability workflows.
- Admin user management with coarse RBAC.
- Soft delete with trash and restore.
- Audit logs for important system actions.
- CSV import, export, and templates.
- AI staff brief, weekly brief, follow-up drafts, note drafts, and availability reminders.

## Technical Architecture

Project Fable uses:

- Next.js App Router and Server Components.
- TypeScript and Tailwind CSS.
- Server Actions with service-layer business logic.
- Prisma ORM.
- PostgreSQL on the `deployment/postgres` branch.
- SQLite on the stable `main`/`master` baseline.
- Custom session-based authentication.
- Coarse RBAC for Admin, Manager, and Member workflows.
- Audit logging for key mutations.
- Provider abstraction for optional AI features.

The PostgreSQL branch uses a Prisma generated client under `lib/generated/prisma`, which is intentionally ignored and generated during build.

## Security and Access Control

The app uses first-party authentication with scrypt-style password hashing, hashed session tokens, secure cookie handling, server-side authorization checks, and route protection. Admin-only workflows include user management, trash restore, and audit log review.

This is a secure internal-tool MVP, not an enterprise-grade security claim. Remaining production hardening would include external monitoring, stronger rate limiting, password reset/rotation flows, deeper audit retention policies, and a full operational security review.

## AI Usage and Review-Only Design

AI features are optional and disabled gracefully when `GEMINI_API_KEY` is empty. When enabled, the app can generate staff briefs, weekly people-ops briefs, follow-up drafts, performance note drafts, and availability reminders.

AI is assistive and review-only:

- It does not make autonomous HR decisions.
- It does not auto-save notes.
- It does not auto-send messages.
- It does not persist prompts or model outputs.
- It uses whitelisted operational data.
- It avoids raw audit logs, password hashes, session tokens, and sensitive performance-note details in AI payloads.

Sprint 29C also tightened zero-data wording so AI prompts do not imply conclusions such as "all staff are stable" when no staff records exist.

## PostgreSQL Migration Story

The project began with a stable SQLite-first local baseline. Because serverless platforms are not a good fit for writable SQLite files, the deployment path moved to a dedicated PostgreSQL branch instead of changing `main` directly.

The `deployment/postgres` branch introduced:

- Prisma PostgreSQL provider.
- PostgreSQL baseline migration.
- Docker Compose for local PostgreSQL.
- Prisma PG adapter.
- Explicit `tsx` seed dependency.
- Build-time Prisma client generation for Vercel.
- Branch-specific docs that preserve `main`/`master` as the SQLite-first baseline.

This branch is now the deployment candidate for demo/staging review.

## Deployment Story

Project Fable is deployed on Vercel with Neon PostgreSQL for demo/staging review.

Deployment choices:

- GitHub private repository.
- GitHub Actions CI for install, Prisma generate, lint, and build.
- Vercel app hosting.
- Neon PostgreSQL database.
- Vercel runtime `DATABASE_URL` uses a Neon pooled connection.
- Local Prisma migration work should use a direct Neon connection when needed.
- Vercel Function region was moved closer to the Neon region to reduce runtime latency.

Performance can still vary on free or staging infrastructure, especially during cold starts.

## Tradeoffs and Limitations

- Demo/staging deployment is not enterprise production readiness.
- RBAC is intentionally coarse.
- Search and pagination are pragmatic MVP implementations.
- No OAuth, SSO, 2FA, password reset, or password rotation flow yet.
- No tamper-proof audit log chain.
- AI features depend on external provider availability and remain optional.
- Production/staging may start with only an admin user; seeded local demo data is better for portfolio screenshots.
- Free/staging infrastructure may show cold-start or runtime latency.

## What I Learned

- Branch-based database migration keeps a stable local baseline while enabling deployment-specific changes.
- Serverless deployment changes database and build assumptions, especially around generated Prisma clients and pooled connections.
- Internal tools need strong empty states because zero-data demos are common during first deployment.
- AI features are safest when designed as constrained drafts rather than automated decisions.
- Portfolio projects benefit from operational docs, smoke tests, screenshot plans, and honest limitations.

## Future Improvements

- Final portfolio screenshots with seeded demo data.
- Manual browser smoke test on Vercel staging.
- Optional dependency audit review.
- Optional performance polish and monitoring.
- Password reset or password rotation workflow.
- More granular permissions and department-scoped access.
- Audit log export and tamper-proofing.
- Pagination and filtered exports for larger datasets.
- Public portfolio copy if the repository is later approved for public release.
