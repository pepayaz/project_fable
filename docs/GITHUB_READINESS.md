# GitHub Readiness

This document outlines the checklist and repository hygiene practices required before pushing Project Fable to GitHub.

## GitHub Readiness Checklist

- [ ] **Repository Privacy**: Keep the repository **PRIVATE** initially. Public release is scheduled for after Mega Sprint 25.
- [ ] **Secret Scanning**: Ensure GitHub Secret Scanning is enabled (or run local scanners) before making the repository public.
- [ ] **Ignored Files**: Confirm that `.env`, `prisma/dev.db`, `prisma/prod.db`, and `lib/generated/prisma` are strictly ignored.
- [ ] **Tracked Sensitive Files**: Verify that no sensitive files or local databases have been accidentally tracked in the Git history.
- [ ] **Screenshot Safety**: Ensure any documentation screenshots do not contain real user data, actual API keys, or proprietary internal tokens.
- [ ] **Demo Account Policy**: Any demo accounts seeded must use explicitly fake credentials (e.g., `admin@example.org`) and never real production passwords or PII.
- [ ] **README Readiness**: Ensure `README.md` clearly states the current MVP status, development instructions, and the fact that PostgreSQL is a future roadmap item (the app is currently SQLite-first).

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

### 4. Review Changes Before Commit
Always review staged files before creating a commit:
```powershell
git diff --cached --name-only
```
