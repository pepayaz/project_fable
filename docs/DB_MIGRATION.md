
# Database Migration Guide

Project Fable is currently a SQLite-first application for local development and MVP evaluation. This document explains the current database status, the PostgreSQL migration path, and the operational checks required before any production database switch.

## Current Database Status

Project Fable currently uses SQLite.

Current implementation details:

* `prisma/schema.prisma` uses `provider = "sqlite"`.
* `prisma/migrations/migration_lock.toml` is locked to SQLite.
* `lib/db.ts` uses `@prisma/adapter-better-sqlite3`.
* Local development uses `DATABASE_URL="file:./prisma/dev.db"`.
* Production PostgreSQL is not live yet.

Changing `DATABASE_URL` to `postgresql://...` is not enough. The Prisma provider, generated client, database adapter, migration history, and seed workflow must be reviewed before PostgreSQL can be used safely.

## Sprint 23 Scope

Sprint 23 prepares Project Fable for database portability. It does not switch the application to PostgreSQL.

Completed or planned in Sprint 23:

* Environment validation recognizes local SQLite and future PostgreSQL URLs.
* Production SQLite is rejected by default unless explicitly allowed for limited smoke testing.
* Seed behavior remains safe for production and convenient for local development.
* Import confirmation is transactional to avoid partial imports.
* User deactivation and session revocation are transactional.
* PostgreSQL migration steps are documented.
* Query portability risks are documented.

Not included in Sprint 23:

* No Prisma provider switch.
* No PostgreSQL production deployment.
* No migration history rewrite.
* No schema constraint changes.
* No new dependencies.
* No multi-tenant architecture.

## Environment Strategy

Local development:

```env
DATABASE_URL="file:./prisma/dev.db"
```

Future PostgreSQL production or staging:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

or:

```env
DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"
```

While the Prisma provider is still SQLite, PostgreSQL URLs should be treated as future deployment preparation and should produce clear guidance instead of pretending that PostgreSQL is already active.

Production should reject SQLite by default. A limited override such as the following may be used only for local smoke testing or temporary internal evaluation:

```env
ALLOW_SQLITE_PRODUCTION="true"
```

Do not use SQLite as the final production database for sensitive organizational data.

## Why PostgreSQL Requires a Planned Switch

While SQLite is excellent for local development, it relies on a local file to store data (e.g., `dev.db`). Modern cloud deployment platforms like Vercel or Netlify use ephemeral/serverless filesystems. This means any writes to a SQLite database on these platforms will be lost when the serverless function spins down. Because of this, **PostgreSQL is strictly required for real cloud production deployments on those platforms**.

PostgreSQL requires more than changing the environment variable.

A proper switch needs:

1. Prisma datasource provider review.
2. Database adapter review.
3. Migration history strategy.
4. Schema portability review.
5. Production database creation.
6. Backup before migration.
7. Production seed admin validation.
8. Smoke testing after migration.
9. Rollback plan.

The current migration history is SQLite-based. A PostgreSQL migration should be prepared in a dedicated sprint or deployment branch.

**Recommended Deployment Sequence (Option D):**
Following ADR-025, we use a safe, decoupled approach for deployment:
- **Phase 1 (Repo Readiness):** Ensure documentation, codebase hygiene, and GitHub readiness are finalized while still on SQLite (Sprint 24).
- **Phase 2 (DB Migration & Cloud Deploy):** Switch the Prisma provider to PostgreSQL, perform data migration, and deploy to the cloud platform (Sprint 25).

## Recommended PostgreSQL Migration Path

Recommended future steps:

1. Create a backup of the current SQLite database.
2. Create a clean branch for the PostgreSQL provider switch.
3. Review `prisma/schema.prisma`.
4. Switch the Prisma datasource provider to PostgreSQL.
5. Replace or remove the SQLite-specific adapter if needed.
6. Generate a PostgreSQL-compatible Prisma client.
7. Create a new PostgreSQL migration baseline.
8. Review generated SQL carefully.
9. Create a staging PostgreSQL database.
10. Set `DATABASE_URL` to the staging PostgreSQL URL.
11. Run migrations.
12. Run production admin seed with a strong password.
13. Run smoke tests.
14. Verify auth, RBAC, user management, import/export, trash/restore, audit logs, dashboard, insights, and AI graceful-disabled behavior.
15. Only then consider production deployment.

## Seed Strategy

Development seed behavior:

* Local demo data may be created.
* Demo admin, manager, and member users may be created.
* Empty local `SEED_ADMIN_PASSWORD` may use a development fallback only outside production.

Production seed behavior:

* Demo departments, staff, tasks, attendance, availability, and performance notes must not be seeded.
* Demo manager/member accounts must not be seeded.
* Production admin must use `SEED_ADMIN_EMAIL`.
* Production admin password must be strong and explicitly provided.
* Weak, empty, or fallback production passwords must be rejected.

If a PostgreSQL URL is used while the application still has SQLite Prisma provider configuration, the seed script should show a clear message pointing to this migration guide.

## Transaction Safety

Data import confirmation should be transactional. If any write fails during confirmed import, the import should not partially write rows.

User deactivation should be transactional for:

* setting `isActive = false`
* revoking active sessions

Audit logging can remain best-effort if that is consistent with the current audit design.

## Query Portability Notes

Most service queries use Prisma APIs and are conceptually portable. However, behavior can differ between SQLite and PostgreSQL.

Important difference:

* SQLite `contains` behavior may be case-insensitive for ASCII depending on collation and query behavior.
* PostgreSQL `contains` is generally case-sensitive unless configured otherwise.

Do not add `mode: "insensitive"` while the project still uses the SQLite Prisma provider if it is not supported by the generated client.

When the project actually switches to PostgreSQL, search behavior should be reviewed and normalized.

Future options:

* Add `mode: "insensitive"` after provider switch if supported.
* Normalize searchable fields.
* Add explicit lower-case search fields.
* Use database-specific indexes if needed.

## Query Caps and Pagination

Current caps or limits:

* Audit logs are capped.
* Trash lists are capped per entity.
* CSV import has row and character caps.
* Staff timeline and dashboard sections have practical limits.

Known future work:

* Add pagination for large staff, task, attendance, availability, performance note, user, and audit log datasets.
* Add filtered exports for large datasets.
* Add database indexes for common filters before production scale.

Do not silently add broad pagination without UI support.

## Database Integrity Notes

Keep current constraints:

* `User.email` is unique.
* `Session.tokenHash` is unique.
* `User.linkedStaffId` is unique.
* `Department.name` is unique.
* Audit logs have basic indexes.

Future PostgreSQL recommendations:

* Add indexes for `deletedAt` fields.
* Add indexes for common foreign keys.
* Add indexes for audit filters such as actor, action, entity type, and created date.
* Consider a partial unique index for active staff email if staff email becomes a strict identity field.
* Consider partial unique policies for soft-deleted entities if business rules require name reuse after deletion.

Do not add partial indexes while still on SQLite provider without a dedicated schema migration plan.

## Backup Before Migration

Before any database migration:

1. Stop writes if possible.
2. Copy the SQLite database file.
3. Store the backup outside the project working tree.
4. Verify the backup file exists.
5. Run migration only after backup verification.

Example local backup:

```powershell
Copy-Item prisma\dev.db backups\dev-before-db-migration.db
```

Do not commit database backup files.

## Smoke Test Checklist

After any database provider switch or migration, verify:

* Login works.
* Logout works.
* RBAC route protection works.
* Admin user management works.
* Member self-service works.
* Staff CRUD works.
* Department CRUD works.
* Task CRUD works.
* Attendance CRUD works.
* Availability CRUD works.
* Performance note CRUD works.
* Trash and restore work.
* Audit logs record create/update/delete/restore/export/import actions.
* CSV export works.
* CSV import preview and confirm work.
* Dashboard and insights load.
* AI remains gracefully disabled when no API key is configured.
* Production seed creates only the intended admin account.

## Current Recommendation

Keep SQLite for local development and portfolio iteration until the deployment sprint is ready.

Use PostgreSQL for real production only after a dedicated provider switch, migration review, staging test, and smoke test pass.
