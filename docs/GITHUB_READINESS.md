# GitHub Readiness

This document outlines the checklist and repository hygiene practices required before pushing Project Fable to GitHub.

## GitHub Readiness Checklist

- [ ] **Repository Privacy**: Keep the repository **PRIVATE** initially. Public release requires separate manual approval.
- [ ] **Secret Scanning**: Ensure GitHub Secret Scanning is enabled (or run local scanners) before making the repository public.
- [ ] **Ignored Files**: Confirm that `.env`, `prisma/dev.db`, `prisma/prod.db`, and `lib/generated/prisma` are strictly ignored.
- [ ] **Tracked Sensitive Files**: Verify that no sensitive files or local databases have been accidentally tracked in the Git history.
- [ ] **Screenshot Safety**: Ensure any documentation screenshots do not contain real user data, actual API keys, or proprietary internal tokens.
- [ ] **Demo Account Policy**: Any demo accounts seeded must use explicitly fake credentials (e.g., `admin@example.org`) and never real production passwords or PII.
- [ ] **README Readiness**: Ensure `README.md` clearly states that `main`/`master` is SQLite-first and `deployment/postgres` is the PostgreSQL deployment candidate.
- [ ] **CI Readiness**: Confirm GitHub Actions CI exists and runs install, Prisma generate, lint, and build without production secrets.
- [ ] **Deployment Status**: Confirm production deployment is still pending and tracked in `docs/DEPLOYMENT_PREP.md`.

## Repository Hygiene Commands

Use these PowerShell-friendly commands to verify the repository state before committing or pushing:

### 1. General Status
Check the current working tree status:
```powershell
rtk git status
```

### 2. Verify Ignored Files
Ensure sensitive files are properly ignored by Git:
```powershell
git check-ignore -v .env
git check-ignore -v prisma/dev.db
git check-ignore -v lib/generated/prisma
```

### 3. Check for Accidentally Tracked Sensitive Files
Search currently tracked files for anything resembling environment configs or local databases:
```powershell
git ls-files | Select-String -Pattern '\.env|dev\.db'
```
*If this command returns output, you must use `git rm --cached <file>` to untrack them before pushing.*

For the PostgreSQL branch, also check generated and local tool output:

```powershell
git ls-files | Select-String -Pattern '\.env|dev\.db|generated/prisma|\.claude|graphify-out|scratch|qa\.ts|AGENTS\.md|CLAUDE\.md'
```

Only `.env.example` should appear unless a tracked documentation file is intentional.

## PostgreSQL Branch Notes

- `deployment/postgres` is ready for private GitHub push after final manual review.
- GitHub Actions CI is configured for dependency install, Prisma client generation, lint, and build.
- Production deployment is still pending; follow `docs/DEPLOYMENT_PREP.md` before staging or production work.

### 4. Review Changes Before Commit
Always review staged files before creating a commit:
```powershell
git diff --cached --name-only
```
