# Architecture Document — Project Fable

Dokumen ini menjelaskan arsitektur sistem Project Fable (struktur teknis, data model, dan strategi implementasi).

Untuk design system UI/UX (warna, typography, komponen, page patterns), lihat `DESIGN.md` di root repository.

## Design Goals

Project Fable dirancang dengan prinsip:

- Simple first.
- Maintainable.
- Easy to extend.
- Portfolio-quality.
- Friendly for AI coding agents.
- Capable enough for real organization workflows.

MVP harus cukup kecil untuk selesai, tetapi cukup kuat untuk dikembangkan menjadi aplikasi people management yang serius.

## Architecture Overview

Arsitektur yang direkomendasikan:

```text
Client Browser
    |
Next.js App Router
    |
Proxy + Route Guards
    |
Server Actions / API Routes
    |
Service Layer
    |
Prisma ORM
    |
SQLite Database
```

Untuk MVP, monolith Next.js sudah cukup. Tidak perlu memisahkan backend dan frontend ke repository berbeda.

Auth foundation menggunakan first-party database session. Protected route handling dilakukan di `proxy.ts` untuk redirect awal, lalu Server Components dan Server Actions tetap memanggil guard server-side agar mutasi data tidak hanya bergantung pada proxy.

## Recommended Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or custom UI components
- Prisma ORM
- SQLite for local MVP
- PostgreSQL for future deployment
- Zod for validation
- React Hook Form for forms, if needed
- Git for version control
- RTK AI for terminal output compression
- Graphify for repository context graph

## Proposed Folder Structure

```text
project-fable/
├── app/
│   ├── page.tsx
│   ├── dashboard/
│   ├── staff/
│   ├── departments/
│   ├── tasks/
│   ├── attendance/
│   ├── availability/
│   └── layout.tsx
├── components/
│   ├── layout/
│   ├── staff/
│   ├── departments/
│   ├── tasks/
│   ├── attendance/
│   └── ui/
├── lib/
│   ├── db.ts
│   ├── validations/
│   ├── services/
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/
├── AGENTS.md
├── CLAUDE.md
├── README.md
└── package.json
```

## Data Model Summary

### Staff

Fields:

- id
- name
- email
- phone
- position
- status
- batch
- notes
- departmentId
- createdAt
- updatedAt

### Department

Fields:

- id
- name
- description
- createdAt
- updatedAt

### Task

Fields:

- id
- title
- description
- status
- priority
- deadline
- assignedToStaffId
- departmentId
- createdAt
- updatedAt

### Attendance

Fields:

- id
- staffId
- eventName
- date
- status
- notes
- createdAt
- updatedAt

### Availability

Fields:

- id
- staffId
- dayOfWeek
- startTime
- endTime
- notes
- createdAt
- updatedAt

### PerformanceNote

Fields:

- id
- staffId
- note
- category
- createdAt
- updatedAt

### User

Fields:

- id
- name
- email
- passwordHash
- role
- isActive
- createdAt
- updatedAt

User is the login account entity and remains separate from Staff.

### Session

Fields:

- id
- userId
- tokenHash
- expiresAt
- createdAt
- updatedAt

Session stores only hashed tokens in the database. The plaintext token lives only in an httpOnly cookie.

## Enum Design

### StaffStatus

- ACTIVE
- INACTIVE
- PROBATION
- RESIGNED

### TaskStatus

- TODO
- IN_PROGRESS
- DONE
- BLOCKED
- CANCELLED

### TaskPriority

- LOW
- MEDIUM
- HIGH
- URGENT

### AttendanceStatus

- PRESENT
- ABSENT
- EXCUSED
- SICK
- LATE

### DayOfWeek

- MONDAY
- TUESDAY
- WEDNESDAY
- THURSDAY
- FRIDAY
- SATURDAY
- SUNDAY

## UI Design

Aplikasi menggunakan dashboard layout:

- Sidebar navigation.
- Header.
- Main content area.
- Responsive layout.

Sidebar menu:

- Dashboard
- Staff
- Departments
- Tasks
- Attendance
- Availability
- Performance Notes

## Validation Strategy

Validasi input dilakukan di server menggunakan schema validation.

Rekomendasi:

- Zod untuk validation schema.
- Prisma untuk database constraint.
- UI form validation untuk feedback user.

## Authentication Strategy

Auth foundation uses:

- Node `crypto.scrypt` for password hashing.
- Random salt per password.
- `timingSafeEqual` for password verification.
- Random opaque session token in an httpOnly cookie.
- SHA-256 session token hash in the database.
- Session expiry via `expiresAt`.
- `requireUser()` for protected Server Components and mutating Server Actions.

Role values are stored on User as String: `ADMIN`, `MANAGER`, and `MEMBER`. Detailed RBAC rules are intentionally deferred.

## Authorization Strategy

Coarse RBAC uses explicit permission strings such as `staff:create`, `tasks:update`, and `settings:read`.

- `ADMIN` can access and mutate all primary resources.
- `MANAGER` can view dashboard, CRUD staff, tasks, attendance, availability, and performance notes, and view departments.
- `MEMBER` can access only its own workspace and settings.
- Trash permissions (`trash:read`, `trash:restore`) are ADMIN-only.
- Data exchange: `export:read` is ADMIN/MANAGER; `import:manage` is ADMIN-only.
- User management: `users:read` and `users:manage` are ADMIN-only.

All protected pages use read permissions. All mutating Server Actions use create/update/delete permissions. UI actions are hidden when permission is missing, but server-side permission checks remain the source of truth. `proxy.ts` performs early login redirects for protected route prefixes including dashboard, staff, data tools, users, trash, audit logs, insights, and member workspace.

## Environment and Production Readiness

Environment validation is lazy and server-side.

- `lib/env.ts` validates `DATABASE_URL` as required and SQLite `file:` for the current deployment scope.
- AI env remains optional: `AI_PROVIDER` defaults to `gemini`, only `gemini` is allowed, `AI_MODEL` defaults to `gemini-2.5-flash-lite`, and empty `GEMINI_API_KEY` keeps AI gracefully disabled.
- Production seed admin env validates `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`; weak/default/local fallback passwords are rejected in production.
- `.env.example` documents safe placeholders only.

## Database Portability

Project Fable is SQLite-first with portability preparation for future PostgreSQL migration.

- **Current provider:** SQLite via `@prisma/adapter-better-sqlite3`. Prisma schema uses `provider = "sqlite"`. All 5 migrations are SQLite.
- **Environment validation:** `lib/env.ts` accepts `file:` URLs for SQLite, recognizes `postgresql://` and `postgres://` with a guidance error explaining that the provider/client/adapter migration must be completed first. Production rejects SQLite unless `ALLOW_SQLITE_PRODUCTION=true`.
- **Transaction safety:** `confirmImport()` uses `db.$transaction` to prevent partial imports. `setUserActive(false)` uses `db.$transaction` for atomic deactivation and session revocation.
- **Search portability:** SQLite `contains` is case-insensitive for ASCII; PostgreSQL is case-sensitive. `mode: "insensitive"` will be added when the provider switches to PostgreSQL. This is documented in `docs/DB_MIGRATION.md`.
- **Seed:** `prisma/seed.js` uses raw `better-sqlite3` with SQLite-specific SQL. It will be rewritten to use Prisma Client when the provider switches.
- **Pagination:** List queries are unbounded (documented known limitation). Pagination is future work.

See `docs/DB_MIGRATION.md` for the full migration plan and `docs/ADR.md` ADR-024 for the decision rationale.

## Audit Log Strategy

Audit log foundation mencatat aksi penting pada entity utama untuk akuntabilitas dasar.

- Model `AuditLog` menyimpan `action`, `entityType`, `entityId`, `summary`, dan snapshot actor (`actorId`, `actorName`, `actorRole`).
- `recordAuditLog` dipanggil di action layer setelah service berhasil dan sebelum redirect, untuk create/update/delete pada Staff, Department, Task, Attendance, Availability, dan PerformanceNote.
- Pencatatan bersifat best-effort: kegagalan audit tidak menggagalkan aksi user.
- `summary` memakai whitelist field aman dan tidak menyimpan passwordHash, session token, raw cookie, atau dump objek. Untuk PerformanceNote hanya kategori dan nama staff.
- Viewer `/audit-logs` read-only dan ADMIN-only lewat permission `auditLogs:read`.
- Viewer audit mendukung query param filtering/search/sort (`q`, `action`, `entityType`, `actorRole`, `from`, `to`, `sort=createdAt`, `dir`) dengan cap 200 row.
- Restore dari trash dicatat sebagai `RESTORE` dengan summary aman. Filtering audit tidak dicatat.
- Export/import dicatat sebagai `EXPORT` / `IMPORT` pada `DataExport` / `DataImport` tanpa CSV raw. User management dicatat pada `User` tanpa password/session data.
- Foundation ini belum tamper-proof, belum mencatat aksi gagal/auth, dan belum punya export atau pagination penuh.

## Auth and Session Hardening

- Session cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.
- Session tokens are random and stored as SHA-256 hashes in the database.
- Session max age is defined as exported constants in `lib/auth/session.ts`.
- Expired sessions are deleted opportunistically during session creation/check.
- Inactive users invalidate their current session; user deactivation revokes all sessions for that user.
- Login has a minimal in-memory failed-attempt limiter keyed by normalized email: 5 failed attempts per 10 minutes. This is not multi-instance/serverless-grade and should be replaced by platform/WAF/Redis-backed limiting for production.

## Error and Logging Policy

- `app/error.tsx` and `app/not-found.tsx` provide calm generic UI and do not expose stack traces.
- Logs must not include passwords, temporary passwords, session tokens/hashes, API keys, AI prompts/outputs, or CSV raw import content.
- Audit summaries remain safe summaries only for sensitive workflows.

## Data Tools Strategy

`/data-tools` menyediakan CSV exchange untuk data operasional tanpa dependency dan tanpa schema change.

- **Export:** route handler `app/data-tools/export/route.ts` menghasilkan `text/csv` untuk Staff, Departments, Tasks, Attendance, Availability, dan Performance Notes. Semua query export memakai `deletedAt: null`. User/Session/AuditLog/AI output/secrets tidak diekspor. Performance Notes full-note export hanya ADMIN.
- **Templates:** `app/data-tools/template/route.ts` menghasilkan header CSV untuk Departments, Staff, dan Tasks.
- **Import:** ADMIN-only via textarea paste CSV. Flow import adalah preview -> validation report -> confirm. Confirm selalu re-parse dan re-validate CSV server-side sebelum menulis data.
- **Parser:** `lib/csv.ts` support comma delimiter, quoted values, escaped quotes, CRLF/LF, dengan cap 20.000 karakter, 200 rows, dan 50 columns.
- **Validation:** `lib/services/data-import.ts` memakai Zod/service rules existing. Staff email diperlakukan duplicate jika sudah ada staff aktif dengan email sama. Task import prefer `assignedStaffEmail`; `assignedStaffName` hanya boleh jika unik; `departmentName` harus resolve ke department aktif.
- **Audit/privacy:** audit hanya mencatat jumlah/type import/export, tidak CSV raw.

## Admin User Management Strategy

`/users` adalah ADMIN-only module untuk account control dasar.

- `lib/services/users.ts` menangani list/create/update role/status/link/unlink/revoke sessions.
- Create user memakai `hashPassword`; temporary password tidak disimpan selain hash dan tidak pernah diaudit.
- User table tidak menampilkan `passwordHash` atau session token/hash.
- `linkedStaffId` memakai constraint unique schema; service juga mengecek Staff aktif dan link existing untuk pesan aman.
- Deactivate men-set `isActive=false` dan revoke session via `db.session.deleteMany({ userId })`.
- Guard self-lockout: current admin tidak bisa deactivate diri sendiri atau mengubah role dirinya dari ADMIN.
- Tidak ada delete user, invitation email, password reset email, MFA, OAuth, atau notification.

## Soft Delete Strategy

Entity utama (Staff, Department, Task, Attendance, Availability, PerformanceNote) memakai soft delete melalui kolom `deletedAt DateTime?`.

- `delete*` service men-set `deletedAt` alih-alih menghapus row, sehingga data historis dan audit trail tetap utuh.
- Semua read normal (list, dropdown options, getById, validasi relasi di service) memfilter `deletedAt: null`. `getById` memakai `findFirst` agar record yang sudah dihapus mengembalikan null dan halaman edit menampilkan not found.
- Dashboard mengabaikan record yang sudah dihapus.
- Department hanya boleh dihapus jika tidak punya staff aktif (non-deleted).
- Audit log tetap mencatat action DELETE.
- `/trash` menampilkan soft-deleted Staff, Department, Task, Attendance, Availability, dan PerformanceNote untuk ADMIN.
- Restore hanya set `deletedAt: null` pada record target, tidak cascade. Child restore ditolak bila parent terkait masih soft-deleted. Department restore mengecek conflict nama.
- Permanent delete belum tersedia; hard delete active records tidak didukung.
- Known limitation: child records milik staff yang sudah dihapus tetap tampil pada konteks tertentu bila record child masih aktif, nama Department soft-deleted tetap menempati unique constraint, dan belum ada permanent delete.

## List Filtering Strategy

List page utama (Staff, Departments, Tasks, Attendance, Availability, Performance Notes) mendukung search, filter, dan sort server-side.

- State filter disimpan di URL query params (GET form) agar bisa di-refresh dan di-share. Form memakai tombol Apply eksplisit dan link Reset, tanpa client component.
- Query param divalidasi dengan zod schema di `lib/validations/list-filters.ts` memakai `.catch(default)`, sehingga nilai invalid otomatis jatuh ke default dan tidak pernah membuat halaman crash.
- Filtering dibangun di service layer lewat Prisma `where`/`orderBy` (parameterized, aman dari injection). Base `where: { deletedAt: null }` selalu dipertahankan, dan default order lama dipertahankan saat tanpa filter.
- Dropdown relasi (staff/department) memakai options yang sudah memfilter `deletedAt: null`.
- RBAC tidak berubah: tiap page tetap memakai read permission yang sama.
- Known limitations: belum ada pagination (semua hasil dirender), `contains` di SQLite case-insensitive terutama untuk ASCII, term pencarian tampil di URL, dan sort task priority masih urutan alfabet kolom (bukan severity). Belum ada export, saved filter, atau advanced query builder.

## Dashboard Reporting Strategy

Dashboard adalah management overview yang dihitung dari data existing, tanpa schema atau dependency baru.

- `getDashboardSummary()` menghitung metric cards, breakdown (`groupBy`), staff-by-department, top workload (relation `_count`), dan recent activity dalam satu `Promise.all`. Semua query non-audit memakai `deletedAt: null`. Breakdown dinormalisasi terhadap daftar enum di `lib/validations/*` agar nilai 0 tetap tampil.
- **Task completion rate** = `completed / (total non-deleted − cancelled) × 100`, dibulatkan; 0% bila denominator 0.
- **Audit summary dipisah** ke `getAuditActivitySummary()` dan hanya dipanggil/dirender bila `can(user, "auditLogs:read")` (ADMIN). MANAGER memiliki `dashboard:read` tetapi tidak menerima data audit. RBAC tidak diubah.
- AuditLog tidak di-soft-delete, sehingga query audit tidak memakai filter `deletedAt`.
- Visual analytics memakai reusable CSS-only components (`ChartCard`, `HorizontalBarList`, `StatusDistribution`), tanpa chart library. `/dashboard` mengikuti pola metric cards -> chart overview -> actionable/recent lists.
- `/insights` memakai `visualAnalytics` dari `getPeopleIntelligence()` untuk attention levels, availability coverage, task pressure, top open task load, dan overdue distribution. Staff Attention List tetap actionable list utama.
- Known limitation: query agregasi belum ber-index (full scan), diterima pada skala MVP.

## AI Briefing & Review System

Fitur AI opt-in yang constrained dan provider-agnostic (lihat ADR-019), tanpa dependency baru dan tanpa schema change.

- **Provider abstraction** di `lib/ai/`: `provider.ts` (interface `AiProvider` + `AiResult`), `config.ts` (env + `isAiConfigured()`), `gemini.ts` (REST Gemini via `fetch` native), `safety.ts` (system prompt + disclaimer), `index.ts` (`getAiProvider()` membaca `AI_PROVIDER`, default `gemini`). Provider tak dikenali / key kosong → `null` → fitur disabled. Anthropic/OpenAI = future provider.
- **Business logic terpisah:** `lib/services/ai-brief.ts` membangun data contract whitelist dan prompt; tidak hardcode ke provider tertentu.
- **Server Actions** (`app/ai/actions.ts`): `generateStaffBriefAction(staffId)` dan `generateWeeklyBriefAction()` dengan guard `requirePermission("ai:generate")` (ADMIN + MANAGER). Output **tidak disimpan** ke database; prompt/output **tidak di-log**.
- **Privacy boundary:** hanya profil, quick insights (signals rule-based), ringkasan task/attendance/availability, dan performance-note category counts (staff brief) atau People Intelligence summary (weekly brief). Tidak mengirim passwordHash, session/token/cookie, audit log mentah, atau isi penuh performance note.
- **Safety:** output netral, draft untuk review manusia, "based only on available Project Fable records"; tanpa keputusan HR final, scoring, atau rekomendasi promosi/demosi/pemecatan.
- **Audit ringan:** event generate dicatat (`GENERATE` / `AiBrief`) dengan summary aman; tanpa prompt/output.
- **Fallback:** bila `GEMINI_API_KEY` kosong, `AiBriefCard` menampilkan state not-configured (tombol disabled) dan action mengembalikan `not_configured`.
- **Env:** `AI_PROVIDER`, `GEMINI_API_KEY`, `AI_MODEL` (default `gemini-2.5-flash-lite`). Secret server-side, tidak di-commit.

### AI Writing Assistant (ADR-020)

Memperluas AI module dengan writing tools draft-only, memakai provider abstraction dan permission `ai:generate` yang sama.

- **Tools:** follow-up message draft, performance note draft, dan availability reminder draft di `/staff/[id]`; team availability reminder di `/insights`.
- **Server Actions** (`app/ai/actions.ts`): `generateFollowupDraftAction`, `generatePerformanceNoteDraftAction`, `generateAvailabilityReminderAction(staffId | null)` — semua `requirePermission("ai:generate")`, memakai system prompt `AI_WRITING_SAFETY`.
- **Prompt builders** (`lib/services/ai-writing.ts`): whitelist staff facts (sama seperti brief, tanpa isi note) + tone (Neutral/Concise/Supportive, default Neutral) + optional manager context (di-cap ≤500 char server-side) + category (note draft, divalidasi). Tidak ada provider hardcode.
- **UI** (`components/ai/AiWritingCard.tsx`): reusable, optional tone/context/category, state lengkap, Copy, tipografi normal. Bukan chatbot, tanpa history.
- **Draft-only:** output tidak disimpan, performance note tidak otomatis dibuat (preview + copy → manager submit manual), pesan tidak otomatis dikirim.
- **Privacy:** tanpa isi penuh performance note, secret, audit mentah, atau data staff lain. Manager context tidak disimpan/di-log/di-audit. Prompt/output tidak di-log.
- **Audit ringan:** `GENERATE` / `AiWriting` dengan summary aman (tanpa prompt/output/context).
- **Safety:** `AI_WRITING_SAFETY` melarang tuduhan, diagnosis, scoring, rekomendasi pemecatan/demosi/promosi/hukuman/gaji, dan data privat yang tidak diberikan; bahasa netral, plain text.

## Member Self-Service Portal

MEMBER memiliki portal `/my` (My Workspace) berbasis relasi optional `User.linkedStaffId @unique` ke `Staff` (lihat ADR-018).

- **Boundary kepemilikan server-side:** `getMyStaff(user)` me-resolve linked staff (`deletedAt: null`) dari sesi; semua My-service di `lib/services/my-workspace.ts` memakai `staffId` hasil resolve, tidak pernah `staffId` dari client. Mutasi (availability CRUD, task status) memverifikasi `record.*Id === myStaffId`.
- **Permission:** `my:read`, `my:availability:manage`, `my:tasks:update`. MEMBER tidak mendapat permission global staff/tasks. ADMIN/MANAGER yang ter-link juga bisa memakai `/my`.
- **Yang dilihat MEMBER:** profil sendiri (view-only), tasks miliknya (status dapat diubah terbatas TODO/IN_PROGRESS/DONE), attendance (view-only), availability (self-service), performance notes (hanya hitungan kategori, tanpa isi).
- **Audit:** availability dan task-status oleh MEMBER dicatat (`recordAuditLog`, actor MEMBER, summary aman).
- **Soft delete & state:** semua query `deletedAt: null`; user belum linked → empty state; linked staff soft-deleted → unavailable state. Login MEMBER redirect ke `/my`; `/my` dilindungi proxy.
- ADMIN/MANAGER workflow global (Staff/Tasks/Availability) tidak berubah.

## People Intelligence Center

`/insights` (permission `dashboard:read`, ditambahkan ke `proxy.ts`) adalah modul rule-based untuk membantu manager memahami kondisi tim, dihitung dari data existing tanpa schema atau dependency baru.

- `getPeopleIntelligence()` (`lib/services/people-intelligence.ts`) menghitung organization summary, staff attention list, workload balance, dan weekly operations dalam satu `Promise.all` (count + groupBy + per-staff aggregate). Populasi utama = staff non-deleted berstatus ACTIVE.
- **Shared signal evaluator:** `evaluateStaffSignals(metrics)` di `lib/services/staff-activity.ts` dipakai bersama oleh Staff Detail (Sprint 15) dan attention list (Sprint 16), sehingga rule konsisten dan tidak terduplikasi. Rule: Needs attention bila overdueTasks>0 / warningNotes>0 / attendanceIssues≥3 / openTasks≥5; Follow-up suggested bila openTasks>0 / improvementNotes>0 / attendanceIssues>0 / availabilityCount==0; selain itu Stable. Setiap sinyal disertai `reasons` berbasis angka.
- **Weekly window** = last 7 days. "Tasks completed recently" memakai proxy `status=DONE` & `updatedAt >= window` karena tidak ada kolom `completedAt` (didokumentasikan sebagai keterbatasan).
- **Dashboard teaser:** `/dashboard` menampilkan ringkasan People Intelligence (jumlah attention/follow-up/stable + top 3 + link) agar dashboard tetap calm.
- **Etika/privacy:** label netral, tanpa skor performa final, tanpa rekomendasi promosi/demosi/pemecatan, tanpa istilah ekstrem. Tidak menampilkan isi performance note (hanya hitungan kategori). AuditLog tidak dipakai di modul ini.
- RBAC tidak berubah: `/insights` dan teaser dijaga `dashboard:read`; MEMBER → `/unauthorized`.
- **Fondasi AI:** struktur output disiapkan sebagai input AI Weekly Brief di masa depan. Sprint ini belum memanggil AI, belum ada prompt, dan tidak menyimpan output baru.

## Staff Activity & Insights

Halaman `/staff/[id]` diperkaya dengan Quick Insights dan Activity Timeline, dihitung dari data existing tanpa schema atau dependency baru.

- `getStaffDetailById` memuat relasi (tasks/attendance/availability/performance notes) terfilter `deletedAt: null`. `buildStaffSnapshot` dan `buildStaffTimeline` di `lib/services/staff-activity.ts` adalah fungsi pure di atas data tersebut.
- **Quick Insights (rule-based, netral):** open tasks, overdue tasks, attendance issues (ABSENT/LATE/SICK), availability count, notes by category, plus sinyal "Needs attention" / "Follow-up suggested" / "No immediate signals" disertai daftar alasan transparan. Tidak ada label ekstrem atau penilaian final terhadap orang.
- **Activity Timeline:** feed gabungan task/attendance/availability/performance note, terurut terbaru→lama, cap 20. Performance note hanya tampil sebagai kategori + tanggal (tanpa isi note). Entri audit (`entityType="Staff"`) hanya dimasukkan bila `can(user, "auditLogs:read")` (ADMIN); MANAGER melihat timeline tanpa entri audit. AuditLog tidak di-soft-delete.
- RBAC tidak berubah: page tetap `requirePermission("staff:read")`; MEMBER → `/unauthorized`.
- **Fondasi AI:** struktur `StaffSnapshot` dan `TimelineEvent` sengaja disiapkan sebagai input untuk fitur AI staff brief di masa depan. Sprint ini belum memanggil AI, belum ada prompt, dan tidak ada scoring/penilaian otomatis.

## Security Hardening

Hardening dasar setelah review keamanan berbasis kode (lihat ADR-017):

- **Auth:** password scrypt (salt random, `timingSafeEqual`); session token random 256-bit disimpan sebagai SHA-256 hash, plaintext hanya di cookie `httpOnly`/`sameSite=lax`/`secure` (production); expiry ditegakkan dan session invalid/inactive dihapus saat akses. Login menyamakan timing dengan dummy `verifyPassword` agar tidak bocor apakah email ada; error generik "Invalid email or password".
- **RBAC:** semua Server Action mutasi memakai `requirePermission` spesifik; semua protected page memakai guard read/create/update; `proxy.ts` melakukan redirect dini untuk route protected sedangkan guard server-side tetap sumber kebenaran. MEMBER terbatas pada self-service workspace/settings.
- **Soft delete:** read/list/relation-validation memfilter `deletedAt: null`; `update*`/`delete*` melakukan pre-check sehingga record terhapus tidak bisa diubah/dihapus ulang lewat request manual.
- **HTTP headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, dan CSP baseline (`next.config.ts`). CSP masih mengizinkan inline script/style untuk kompatibilitas Next; nonce-based CSP ditunda.
- **Seed/production:** user QA `manager`/`member` hanya dibuat saat `NODE_ENV !== "production"`; di production hanya admin (bila `SEED_ADMIN_PASSWORD` diset). `.env*` diabaikan git kecuali `.env.example`.
- **CSRF:** mengandalkan proteksi origin bawaan Next.js Server Actions; tidak memakai library CSRF.

Accepted risks (di luar scope MVP): tidak ada MFA/password reset/email verification/OAuth, session belum sliding/rotation, audit log belum tamper-proof, rate limiting belum production-grade untuk multi-instance/serverless.

## Error Handling Strategy

Error handling harus:

- Memberi pesan jelas untuk user.
- Tidak menampilkan stack trace di UI.
- Menangani data tidak ditemukan.
- Menangani input invalid.
- Menangani database error secara aman.

## Testing Strategy

Testing minimal:

- Unit test untuk utility dan validation.
- Integration test untuk service/database jika memungkinkan.
- Manual test checklist untuk MVP.
- Build test sebelum commit.

## AI Agent Workflow

Agent harus mengikuti:

- AGENTS.md
- CLAUDE.md
- DESIGN.md (design system UI/UX)
- docs/PROJECT_CHARTER.md
- docs/PRD.md
- docs/SRS.md
- docs/ARCHITECTURE.md

Agent harus menggunakan RTK untuk command terminal. Jika Graphify output tersedia, agent harus membaca `graphify-out/GRAPH_REPORT.md`.

## Future Architecture

Setelah MVP stabil, sistem dapat dikembangkan ke:

- PostgreSQL.
- Role-based access control.
- Fine-grained ownership rules.
- Advanced security hardening.
- Deployment to Vercel.
- CSV import/export.
- AI summary.
- Notification/reminder system.
- Multi-organization support.
