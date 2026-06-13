# Final Smoke Test

Use this checklist before portfolio review or recruiter demo. Do not show or copy secrets while testing.

## Vercel Demo/Staging

- [ ] Vercel deployment opens.
- [ ] Login with production admin succeeds.
- [ ] Dashboard loads.
- [ ] Empty-state behavior is acceptable if no demo data exists.
- [ ] Staff CRUD works with dummy data only.
- [ ] Department CRUD works with dummy data only.
- [ ] Tasks CRUD works with dummy data only.
- [ ] Users/RBAC workflows work as expected.
- [ ] Audit logs record important actions.
- [ ] Trash/restore works.
- [ ] Data export works.
- [ ] Import preview works and validates bad input.
- [ ] AI disabled behavior works if no key is configured.
- [ ] AI enabled behavior works if a key is configured.
- [ ] Logout works.
- [ ] No secrets, connection strings, API keys, or passwords are displayed.

## Local Seeded Demo

- [ ] Run the app locally only after confirming `.env` is not exposed.
- [ ] Use seeded dummy data for richer screenshots.
- [ ] Confirm dashboard, staff detail, insights, AI cards, data tools, users, trash, and audit logs have enough visual context.
- [ ] Use a consistent browser size for screenshots.

## Notes

- For richer demo screenshots, use the local seeded demo rather than the production/staging empty database.
- Use Vercel for proof-of-deploy screenshots and final smoke testing.
- Do not run destructive migration commands during demo preparation.
