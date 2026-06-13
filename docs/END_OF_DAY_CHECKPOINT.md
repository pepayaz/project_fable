# End-of-Day Checkpoint

## Branch

- Current branch: `deployment/postgres`
- Stable baseline branch: `main`/`master` remains SQLite-first.

## Latest Relevant Commits

- `5a2ee7a` - fix: avoid AI universal claims with zero staff data
- `67003a2` - chore: trigger vercel redeploy
- `4699426` - fix: generate prisma client before vercel build
- `0cff432` - chore: prepare postgres branch for private github ci
- `11f776e` - chore: stabilize postgres branch docs and local tooling
- `944fef0` - chore: prototype postgres provider switch
- `173a660` - docs: define postgres migration branch strategy

## Current Deployment Status

- Vercel deployed.
- Neon PostgreSQL connected.
- Production admin seed succeeded.
- Vercel Function region was moved closer to the Neon region.
- Vercel runtime `DATABASE_URL` uses the Neon pooled connection with the `-pooler` host.
- Local Prisma migration work should use a direct Neon connection when needed.
- Demo/staging deployment is working and runtime delay is much improved.

## Major Completed Milestones

- Core MVP.
- Auth/RBAC.
- Audit log.
- Soft delete/trash restore.
- Staff 360 profile.
- Search/filter/sort.
- Dashboard/insights.
- Member portal.
- AI briefing/writing assistant.
- Import/export.
- User management.
- Security hardening.
- PostgreSQL migration branch.
- Docker local Postgres.
- Private GitHub push.
- GitHub Actions CI.
- Vercel + Neon deployment.
- Runtime latency improvements.

## Known Remaining Work

- Final screenshots.
- Manual browser smoke test.
- Optional dependency audit review.
- Optional performance polish.
- Optional public portfolio copy.

## Safety Reminders

- Do not commit `.env`.
- Do not expose Neon, Vercel, or Gemini secrets.
- Do not merge `deployment/postgres` to `main`/`master` yet.
- Treat the current deployment as staging/demo, not enterprise production.
