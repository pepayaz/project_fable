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

## Release & Launch Checklist

This checklist supersedes basic smoke testing and provides a comprehensive guide for staging, pushing, and deploying.

### Pre-push Checklist

- [ ] Code compiles without TypeScript errors (`npm run build`).
- [ ] Linter passes (`npm run lint`).
- [ ] Repository hygiene commands run and confirmed clean (see `docs/GITHUB_READINESS.md`).
- [ ] Git history does not contain `.env` files or `.db` files.

### Pre-public Checklist

- [ ] Repository is private. (Do not make public until after Sprint 25).
- [ ] Screenshots in documentation are sanitized (no PII or real API keys).
- [ ] Demo seeds use dummy data.
- [ ] README.md clearly documents the SQLite-first nature of the app.

### Pre-deployment Checklist

- [ ] `DATABASE_URL` is set to the correct production path.
- [ ] `ALLOW_SQLITE_PRODUCTION=true` is set (if deploying a portfolio/demo with SQLite).
- [ ] `SEED_ADMIN_*` variables are securely configured.
- [ ] Hosting environment supports persistent storage for SQLite (Vercel/Netlify are NOT suitable due to ephemeral filesystems; use a VPS, Railway with volume, or similar).

### Expanded Smoke Test Checklist

- [ ] **Auth**: Login as ADMIN.
- [ ] **Navigation**: Open Dashboard, Staff, Tasks, Insights, Data Tools, Users, Trash, and Audit Logs.
- [ ] **CRUD**: Create and soft-delete a test record (e.g., a Task or Staff member), then restore it from Trash.
- [ ] **Export**: Export a CSV from Data Tools and verify the file contents.
- [ ] **Import**: Preview an invalid CSV import and confirm it surfaces errors and does not import.
- [ ] **Security**: Deactivate a test user and confirm the session is revoked immediately.
- [ ] **Feature Flags**: Confirm AI cards/features are disabled gracefully when `GEMINI_API_KEY` is empty.

### Rollback Notes

If a deployment or data migration fails, follow these PowerShell-friendly rollback steps:

1. **Stop the Application**: Ensure no new connections are writing to the database.
2. **Restore Database Backup**:
   ```powershell
   # Move corrupted/current DB aside
   Rename-Item -Path "prisma/prod.db" -NewName "prisma/prod-failed.db"
   # Restore the last known good backup
   Copy-Item -Path "backups/prod-backup.db" -Destination "prisma/prod.db"
   ```
3. **Revert Git Commit** (if code caused the issue):
   ```powershell
   git revert HEAD
   # Or checkout the specific stable tag
   git checkout tags/v1.0.0
   ```
4. **Rebuild & Restart**:
   ```powershell
   npm run build
   # Restart your application service (e.g., pm2 restart fable or restart systemctl service)
   ```

## Deployment Decision Workflow

The current main branch is strictly SQLite-first and stable for local or VPS deployment. Moving to a serverless cloud environment requires a dedicated PostgreSQL migration path. The expected workflow for deployment is:

1. **Private repo**: Ensure the repository remains private during the initial staging process.
2. **PostgreSQL switch branch**: Create a separate migration branch to change the Prisma provider to `postgresql` and adapt the schema.
3. **Staging database**: Provision a staging PostgreSQL database and set the connection URL.
4. **Staging smoke test**: Deploy the switch branch to a staging environment and execute the expanded smoke test checklist.
5. **Production deployment only after QA**: Provision the production database and deploy to production only after the staging smoke test passes.

*Note: Deployment is currently planned and not yet complete.*

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
