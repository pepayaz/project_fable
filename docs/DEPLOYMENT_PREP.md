# Deployment Prep

Project Fable has a Vercel + Neon demo/staging deployment from the PostgreSQL branch. This document prepares future deployment work and keeps the operational rules explicit.

## Branch Strategy

- `main`/`master`: stable SQLite-first baseline.
- `deployment/postgres`: PostgreSQL deployment candidate branch.
- Do not merge or promote `deployment/postgres` to production until staging checks and manual review pass.

## Required Environment Variables

- `DATABASE_URL`: managed PostgreSQL connection URL. On Vercel runtime, use the Neon pooled connection URL.
- `NODE_ENV`: set by the runtime platform; use `production` for production.
- `SEED_ADMIN_EMAIL`: first production admin email.
- `SEED_ADMIN_PASSWORD`: strong temporary production admin password.
- `SEED_ADMIN_NAME`: optional display name for the first admin.
- `AI_PROVIDER`: optional, defaults to `gemini`.
- `GEMINI_API_KEY`: optional; leave empty to disable AI features gracefully.
- `AI_MODEL`: optional model override.

## Secret Rules

- Never commit `.env`.
- Use the hosting platform secret manager for all secrets.
- Rotate any credential that was ever exposed in logs, screenshots, commits, or shared docs.
- Keep local development credentials separate from staging and production credentials.

## Deployment Sequence

1. Provision a managed PostgreSQL database.
2. Set environment variables in the deployment platform.
3. Keep the Vercel Function region close to the Neon database region.
4. Use the pooled Neon URL for Vercel runtime `DATABASE_URL`.
5. Use a direct Neon URL for local Prisma migration work when needed.
6. Run `npx prisma migrate deploy`.
7. Run `npm run seed` once with production seed variables.
8. Build the app.
9. Deploy to staging.
10. Run the smoke test checklist.
11. Promote to production only after review and approval.

## Production Seed Expectations

- Production seed creates only the configured admin user.
- Production seed must not create demo departments, staff, tasks, attendance, availability, performance notes, manager, or member accounts.
- `SEED_ADMIN_PASSWORD` must be strong and explicitly configured.
- Rotate the temporary admin password after first access when a password-rotation flow exists.

## Smoke Test Checklist

- Login as the seeded admin.
- Open the dashboard.
- Open staff management.
- Open task management.
- Open users.
- Open data tools.
- Open trash.
- Open audit logs.
- Open the member portal with a member account in staging data.
- Confirm AI fallback behavior when `GEMINI_API_KEY` is empty.

## Rollback Notes

- Take a database backup before deployment.
- Revert the app deployment if the release fails.
- Do not run destructive migration commands in production.
- Review migration SQL before applying it to a production database.

## Vercel and Neon Notes

- See `docs/VERCEL_NEON_DEPLOYMENT.md` for Vercel + Neon runtime notes.
- Free or staging deployments may still have small cold-start/runtime latency.
- The current deployment should be treated as demo/staging readiness, not enterprise production.
