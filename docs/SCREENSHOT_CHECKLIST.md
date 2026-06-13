# Screenshot Checklist

Use this checklist to capture consistent portfolio assets for Project Fable.

## Privacy Rules

- Never show secrets, connection strings, API keys, passwords, Vercel env values, Neon credentials, or Gemini keys.
- Blur email addresses if needed.
- Use dummy names and fake email addresses only.
- Prefer seeded local demo data for rich product screenshots.
- Use deployed Vercel only for proof-of-deploy screenshots.
- Keep browser size consistent across captures, such as 1440x900 or 1920x1080.
- Hide bookmarks, extensions, OS notifications, and unrelated tabs.

## Product Screenshots

- [ ] Login page.
- [ ] Dashboard with metric cards and visual analytics.
- [ ] Staff list with search/filter/sort visible.
- [ ] Staff detail 360 view.
- [ ] Tasks list with status/priority/assignment context.
- [ ] Attendance page.
- [ ] Availability page.
- [ ] Insights page with attention, availability, and workload charts.
- [ ] AI brief or writing assistant state.
- [ ] Audit logs.
- [ ] Trash/restore.
- [ ] Data tools import/export.
- [ ] Users/RBAC management.
- [ ] Member portal if a member account exists in demo data.

## Deployment and Engineering Screenshots

- [ ] Vercel deployment success screen without env vars.
- [ ] GitHub Actions CI success screen.
- [ ] Neon database dashboard without connection strings, passwords, or query data that reveals secrets.
- [ ] Architecture/deployment diagram from `docs/ARCHITECTURE_OVERVIEW.md`, if useful.

## Empty-State Screenshots

- [ ] Dashboard with no records, if using staging.
- [ ] Staff empty state.
- [ ] Insights zero-data state.
- [ ] AI disabled state if `GEMINI_API_KEY` is empty.

## Capture Notes

- Use seeded local demo data for the main portfolio narrative.
- Use Vercel screenshots only to prove deployment and runtime readiness.
- Do not show browser autofill, password managers, terminal secrets, or local `.env` files.
- Keep final exported images named consistently, for example `01-login.png`, `02-dashboard.png`, and `03-staff-detail.png`.
