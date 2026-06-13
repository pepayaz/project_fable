# PostgreSQL Migration Plan

This document tracks the branch-based PostgreSQL migration. The stable `main`/`master` line remains SQLite-first, while `deployment/postgres` is the PostgreSQL prototype/stabilization branch.

**Important Note:** Production deployment is not live from this branch. Vercel/Netlify are NOT suitable with SQLite writes due to ephemeral filesystems, so PostgreSQL is required before real cloud deployment.

## 1. Branch-Based Migration Strategy

Do not perform the migration directly on `main`. The migration must be isolated to a dedicated branch.

- **Recommended Branch Name:** `deployment/postgres`

This ensures that the `main` branch remains stable and SQLite-compatible until the migration is fully tested and approved.

## 2. Technical Steps for the PostgreSQL Branch

These steps belong strictly within the `deployment/postgres` branch. Sprint 26 completed the provider switch and PostgreSQL baseline on this branch; future changes should continue to protect `main`/`master` as the SQLite-first baseline.

1. **Backup SQLite Database:** Ensure you have a secure backup of the local SQLite database (`dev.db` and any production snapshots) before proceeding.
2. **Create Migration Branch:** Checkout the new branch (`git checkout -b deployment/postgres`) if it does not already exist.
3. **Switch Prisma Provider:** Update `schema.prisma` to change the datasource provider from `"sqlite"` to `"postgresql"`.
4. **Replace/Remove SQLite Adapter:** Remove SQLite adapters and use the PostgreSQL adapter/runtime path required by the current Prisma version.
5. **Rewrite Seed Scripts:** Update `prisma/seed.ts` to use Prisma Client natively. 
    - Preserve `dev` vs. `prod` behavior.
    - Require a strong admin password for production.
    - Ensure absolutely **no** demo data is seeded in the production environment.
6. **Create PostgreSQL Baseline Migration:** Delete the existing SQLite `prisma/migrations` folder and generate a new baseline migration for PostgreSQL (`npx prisma migrate dev --name init`).
7. **Review Generated SQL:** Manually inspect the generated `migration.sql` to ensure data types and constraints map correctly to PostgreSQL.
8. **Run Local/Staging PostgreSQL:** Start a local PostgreSQL instance (see Docker guidance below) and apply the migrations.
9. **Comprehensive Testing:** Perform thorough testing across all core modules:
    - Authentication and Sessions
    - Role-Based Access Control (RBAC)
    - Data Tools (Import/Export)
    - Trash/Soft Delete workflows
    - Audit Logs
    - Ensure AI features are gracefully disabled or functioning as expected without breaking the core app.
10. **Merge only after QA:** Do not merge the migration until all merge criteria are satisfied.

## 3. Local PostgreSQL via Docker (Future Branch Guidance)

For local development on the `deployment/postgres` branch, use Docker to spin up a PostgreSQL instance. Do not use this for the current `main` branch.

```yaml
# docker-compose.yml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: fable_user
      POSTGRES_PASSWORD: fable_password
      POSTGRES_DB: fable_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Update your `.env` file accordingly:
```env
DATABASE_URL="postgresql://fable_user:fable_password@localhost:5432/fable_db?schema=public"
```

## 4. Search Behavior Notes

PostgreSQL supports case-insensitive filtering natively in Prisma using `mode: "insensitive"`. 

- **Rule:** The `mode: "insensitive"` argument belongs **only** after the provider switch. 
- Do not attempt to use this feature while the app is still on SQLite, as it will cause Prisma errors. Update your search query logic across the app (e.g., staff directory, departments) only within the `deployment/postgres` branch.

## 5. Merge Criteria

Before merging `deployment/postgres` into the main development line (or deploying it as the definitive production version), the following criteria must be met:

- [ ] Local PostgreSQL database spins up successfully via Docker.
- [ ] Baseline migration applies cleanly without errors.
- [ ] Production seed script executes successfully (with strong admin password and zero demo data).
- [ ] All test suites (unit/integration) pass against the PostgreSQL instance.
- [ ] Manual QA completed for Auth, RBAC, Data Tools, Trash, and Audit Logs.
- [ ] Case-insensitive search implemented (`mode: "insensitive"`) and verified.
- [ ] Staging deployment succeeds and connects to a managed PostgreSQL database.
- [ ] Code review approved by technical lead.

## Prototype Status
The PostgreSQL prototype is currently implemented on the `deployment/postgres` branch. Sprint 27 local QA passed, and Sprint 28A focuses on stabilization. Do not deploy to production until deployment prep, staging checks, and explicit approval are complete.
