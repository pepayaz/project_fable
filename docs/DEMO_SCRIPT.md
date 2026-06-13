# Demo Script

This script is designed for a 5-8 minute Project Fable portfolio walkthrough. Do not show passwords, API keys, connection strings, Vercel secrets, Neon secrets, or `.env` values during the demo.

## Opening Pitch

"Project Fable is a people operations internal-tool MVP for small teams, committees, communities, and student organizations. It brings staff records, departments, task ownership, attendance, availability, audit logs, admin access control, import/export, and assistive AI drafts into one focused workspace. The current demo/staging deployment runs on Vercel with Neon PostgreSQL."

## Variant A: Empty Production/Staging Demo Flow

Use this when the deployed Vercel database only has the seeded admin account and no demo staff/tasks.

1. Login as admin.
   - Show the first-party login flow.
   - Mention that production seed creates admin only and no demo data.

2. Dashboard overview.
   - Show empty or low-data dashboard states.
   - Explain that the app is safe with no records and does not invent metrics.

3. Staff management.
   - Open the staff page.
   - Show the empty state and explain where staff records would be added.

4. Departments, tasks, attendance, and availability.
   - Briefly open each area to show navigation and empty-state consistency.
   - Do not create real people data in staging unless approved.

5. Insights dashboard.
   - Show zero-data wording.
   - Point out that the AI prompt logic avoids universal claims when no staff records exist.

6. AI briefing/writing assistant.
   - If AI is disabled, show graceful disabled behavior.
   - If AI is enabled, explain that output is assistive, review-only, and not persisted automatically.

7. Audit logs.
   - Show the audit log page.
   - Explain that create/update/delete/restore/import/export actions are auditable when data exists.

8. Trash/restore.
   - Open trash and show the empty or available restore queue.
   - Explain soft delete and restore behavior.

9. Data import/export.
   - Show templates, import preview, and export entry points.
   - Do not upload files containing real data.

10. User management/RBAC.
    - Show roles and active status controls.
    - Explain Admin, Manager, and Member boundaries without changing production access during a live demo.

11. Closing summary.
    - Emphasize full-stack delivery, PostgreSQL deployment readiness, RBAC, auditability, and honest MVP limits.

## Variant B: Seeded Local Demo Flow

Use this for richer portfolio walkthroughs and screenshots. The local seeded database includes fake departments, staff, tasks, attendance, availability, performance notes, and demo RBAC users.

1. Login as admin.
   - Show the login page.
   - Mention scrypt-style password hashing and hashed sessions at a high level.

2. Dashboard overview.
   - Highlight staff totals, task metrics, visual analytics, recent activity, and empty-safe UI patterns.

3. Staff management.
   - Open staff list.
   - Show search, filter, sort, staff status, department links, and navigation to details.

4. Staff detail / 360 view.
   - Open a seeded staff profile.
   - Show personal details, tasks, attendance, availability, performance notes, timeline/context, and AI brief entry points if available.

5. Tasks.
   - Show task list filters and assignment.
   - Explain status, priority, department, assignee, and overdue tracking.

6. Attendance and availability.
   - Show records tied to staff.
   - Explain availability as planning input rather than performance scoring.

7. Insights dashboard.
   - Show attention levels, availability coverage, workload balance, overdue-by-staff, and weekly signals.

8. AI briefing/writing assistant.
   - Generate or describe a weekly brief, staff brief, follow-up draft, note draft, or availability reminder.
   - State clearly that AI is review-only and does not save/send decisions.

9. Audit logs.
   - Show filtered/sorted logs.
   - Explain accountability for important actions.

10. Trash/restore.
    - Demonstrate soft delete and restore using dummy data only.
    - Show how restore avoids accidental data loss.

11. Data import/export.
    - Show CSV template/download.
    - Show import preview validation before confirm.

12. User management/RBAC.
    - Show admin user management.
    - Explain role differences and active/inactive user handling.

13. Member portal.
    - If a member account exists, log in or describe the member view.
    - Show self-service task and availability workflows.

14. Closing summary.
    - "This project demonstrates a realistic internal operations app: data modeling, auth/RBAC, auditability, recoverability, import/export, AI governance, PostgreSQL deployment, and demo-ready documentation."

## Timing Guide

- Opening and login: 45 seconds.
- Dashboard and staff: 90 seconds.
- Staff detail and tasks: 90 seconds.
- Insights and AI: 90 seconds.
- Admin workflows: 90 seconds.
- Closing: 30 seconds.
