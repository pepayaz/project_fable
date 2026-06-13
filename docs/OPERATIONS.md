# Operations Guide

Project Fable is not deployed by this repository yet. This guide documents the operational steps expected before a staging or production deployment.

## Environment Checklist

- Set `DATABASE_URL` to a SQLite `file:` URL for the current deployment scope.
- Set `SEED_ADMIN_NAME`.
- Set `SEED_ADMIN_EMAIL` to the first admin account email.
- Set `SEED_ADMIN_PASSWORD` to a strong temporary admin password.
- Leave `GEMINI_API_KEY` empty if AI features should be disabled.
- Keep `.env` and all secrets out of git.
- Set `ALLOW_SQLITE_PRODUCTION=true` only for portfolio/demo deployments using SQLite in production. Not needed for development.
- PostgreSQL `DATABASE_URL` (e.g. `postgresql://...`) is recognized but not yet supported. See `docs/DB_MIGRATION.md`.

## Production Seed

Production seed creates only the configured admin user. It does not seed demo departments, staff, manager, or member accounts.

Required production env:

```env
NODE_ENV="production"
DATABASE_URL="file:/absolute/path/to/prod.db"
SEED_ADMIN_NAME="Project Fable Admin"
SEED_ADMIN_EMAIL="admin@example.org"
SEED_ADMIN_PASSWORD="use-a-strong-temporary-password"
```

Run:

```bash
npm run seed
```

After first login, create named admin/manager/member users from `/users` and rotate the temporary password outside this MVP if a password-change workflow is later added.

## Local SQLite Backup

Stop the app before copying the SQLite file when possible.

```bash
Copy-Item prisma/dev.db backups/dev-$(Get-Date -Format yyyyMMdd-HHmmss).db
```

If your `DATABASE_URL` points elsewhere, copy that file instead.

## Local SQLite Restore

1. Stop the app.
2. Move the current database file aside.
3. Copy the backup file to the path used by `DATABASE_URL`.
4. Run `npm run build` if code changed since the backup.
5. Start the app and run smoke tests.

## Smoke Tests

- Login as ADMIN.
- Open Dashboard, Staff, Tasks, Insights, Data Tools, Users, Trash, and Audit Logs.
- Create and soft-delete a test record, then restore it from Trash.
- Export a CSV from Data Tools.
- Preview an invalid CSV import and confirm it does not import.
- Deactivate a test user and confirm the session is revoked.
- Confirm AI cards are disabled when `GEMINI_API_KEY` is empty.

## Future Production Requirements

- Managed database backups and restore drills.
- Deployment-level rate limiting or Redis-backed limiter.
- Full CSP with nonces.
- External monitoring and alerting.
- Password reset or password rotation workflow.

## PostgreSQL Migration Status

Sprint 23 prepared the codebase for future PostgreSQL migration:

- Environment validation recognizes `postgresql://` and `postgres://` URLs with guidance.
- Production SQLite requires explicit `ALLOW_SQLITE_PRODUCTION=true`.
- `confirmImport()` and `setUserActive()` are now transactional.
- Seed script shows clear guidance when PostgreSQL URL is detected.

PostgreSQL is **not live yet**. The Prisma provider, client, adapter, and seed are still SQLite-first. See `docs/DB_MIGRATION.md` for the full migration plan.
