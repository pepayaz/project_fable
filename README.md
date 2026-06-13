# Project Fable

Project Fable adalah aplikasi people management ringan untuk organisasi, kepanitiaan, komunitas, dan tim kampus. Aplikasi ini membantu pengelola tim mencatat staff, department, task, attendance, availability, performance notes, dan ringkasan dashboard dalam satu workspace sederhana.

Project ini dibuat sebagai portfolio project berbasis workflow Human Capital / People Management non-enterprise, lalu dikembangkan menuju internal people operations platform yang lebih aman.

## MVP Features

Fitur MVP yang tersedia saat ini:

- Dashboard management overview dengan metric cards, breakdown (status/priority/kategori), top workload, dan recent activity (tanpa chart library)
- Staff CRUD
- Staff detail 360 read-only (profil + task, attendance, availability, performance notes)
- Staff Quick Insights (snapshot rule-based netral) dan Activity Timeline gabungan di halaman detail
- People Intelligence Center (/insights): organization summary, staff attention list, workload balance, weekly operations — rule-based & netral, dengan teaser di dashboard
- Member Self-Service Portal (/my): MEMBER yang ter-link ke Staff melihat profil/tasks/attendance/availability sendiri, mengelola availability, dan update status task miliknya (TODO/IN_PROGRESS/DONE)
- Search, filter, dan sort server-side di semua list page utama (via query params)
- Department CRUD
- Staff assignment ke department
- Task CRUD
- Task assignment ke staff dan department
- Attendance CRUD
- Availability CRUD
- Performance Notes CRUD
- Seed data demo untuk staff dan department
- Auth foundation dengan login/logout
- Protected routes untuk halaman utama
- Admin user seed via environment variable
- Coarse role-based access control untuk ADMIN, MANAGER, dan MEMBER
- Audit log foundation untuk create/update/delete entity utama (viewer ADMIN-only)
- Soft delete untuk entity utama (data historis tidak hilang permanen)

Belum termasuk MVP saat ini:

- Dashboard chart library
- Export/import
- Deployment production
- Fine-grained ownership/self-service rules
- Audit log export, filter, search, dan tamper-proofing
- Restore, trash page, dan permanent delete untuk soft delete
- Password reset, email verification, MFA, OAuth/SSO
- Production security hardening penuh

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Zod
- Server Actions
- npm

## Requirements

- Node.js 20 atau lebih baru
- npm

## Install

```bash
npm install
```

## Environment Setup

Copy file environment example:

```bash
cp .env.example .env
```

Untuk Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Default database lokal:

```env
DATABASE_URL="file:./prisma/dev.db"
```

Admin seed tidak memakai password default. Isi env ini hanya di `.env` lokal:

```env
SEED_ADMIN_NAME="Project Fable Admin"
SEED_ADMIN_EMAIL="admin@fable.local"
SEED_ADMIN_PASSWORD="change-this-local-password"
```

## Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration lokal:

```bash
npx prisma migrate dev
```

Seed data demo:

```bash
npx prisma db seed
```

Seed saat ini menambahkan department dan staff demo. Jika `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` diisi, seed juga membuat atau memperbarui admin user.

## Development

Jalankan dev server:

```bash
npm run dev
```

App berjalan di:

```text
http://localhost:3000
```

## Quality Checks

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Feature Status

| Area | Status |
| --- | --- |
| Documentation foundation | Done |
| App scaffold | Done |
| Staff management | Done |
| Staff detail 360 | Done |
| Staff insights & activity timeline | Done |
| People Intelligence Center | Done |
| List search/filter/sort | Done |
| Department management | Done |
| Task management | Done |
| Attendance tracking | Done |
| Availability tracking | Done |
| Performance notes | Done |
| Dashboard summary | Done |
| Reporting & dashboard upgrade | Done |
| Polish and demo readiness | Done |
| Auth foundation | Done |
| Protected routes | Done |
| Coarse RBAC | Done |
| Member self-service portal | Done |
| Audit log foundation | Done |
| Soft delete & data safety | Done |
| Security hardening review | Done |
| Fine-grained ownership rules | Future sprint |
| Audit log filter/search/export | Future sprint |
| Restore / trash / permanent delete | Future sprint |
| Deployment | Not included yet |

## Project Documents

- `AGENTS.md`
- `CLAUDE.md`
- `DESIGN.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/ROADMAP.md`
- `docs/ADR.md`

## Agent Workflow

This project is designed to work with AI coding agents. Agents should follow `AGENTS.md`, use RTK for terminal output where possible, and inspect `graphify-out/GRAPH_REPORT.md` if available before reading many files.

Recommended commands:

```bash
rtk git status
rtk find .
rtk git diff
rtk test npm run lint
rtk test npm run build
```

## Scope Notes

Project Fable intentionally avoids enterprise HRIS features in the MVP. Payroll, legal contracts, complex permissions, AI analytics, and multi-tenancy are deferred until the core workflow is stable. Auth foundation, coarse RBAC, an audit log foundation, and soft delete for primary entities are available, but MEMBER self-service ownership rules, audit log filter/search/export, tamper-proofing, restore/trash/permanent delete, and production security hardening remain future work.

List search/filter/sort known limitations: belum ada pagination (semua hasil dirender), pencarian `contains` di SQLite case-insensitive terutama untuk ASCII, term pencarian muncul di URL (shareable), dan sort task priority masih urutan alfabet kolom (bukan severity).

Dashboard reporting: task completion rate = `completed / (total non-deleted − cancelled) × 100`, 0% bila denominator 0. Semua metrik non-audit menghormati soft delete (`deletedAt: null`). Section Audit hanya tampil untuk ADMIN (`auditLogs:read`); AuditLog tidak di-soft-delete sehingga query audit tidak memakai filter `deletedAt`.

Member Self-Service Portal (`/my`): pengguna yang ter-link ke Staff via `User.linkedStaffId` melihat data miliknya sendiri (boundary kepemilikan ditegakkan server-side, `staffId` tidak pernah dari client). MEMBER: profil & attendance view-only; availability self-service; status task miliknya terbatas TODO/IN_PROGRESS/DONE; performance notes hanya hitungan kategori (tanpa isi). Availability & task-status oleh MEMBER di-audit. ADMIN/MANAGER tidak wajib linked; jika tidak linked, `/my` menampilkan empty state. Seed non-production me-link `member@fable.local` ke staff demo.

People Intelligence Center (`/insights`, permission `dashboard:read`, ADMIN+MANAGER): organization summary, staff attention list (Needs attention / Follow-up suggested / Stable dengan reasons objektif), workload balance, dan weekly operations (last 7 days). Semua rule-based, netral, dan menghormati soft delete; populasi utama staff ACTIVE; tidak ada skor performa final maupun isi performance note (hanya hitungan kategori/sinyal). Catatan: "tasks completed recently" memakai proxy `status=DONE` & `updatedAt >= window` karena tidak ada kolom `completedAt`. Sinyal staff dievaluasi oleh `evaluateStaffSignals` yang sama dengan Staff Detail. Struktur ini disiapkan sebagai fondasi AI Weekly Brief — Sprint ini belum memakai AI.

Staff insights & timeline: Quick Insights bersifat rule-based, netral, dan transparan (menampilkan angka + sinyal "Needs attention"/"Follow-up suggested"/"No immediate signals" beserta alasannya), bukan penilaian final terhadap staff. Activity Timeline menggabungkan task/attendance/availability/performance note (kategori + tanggal saja, tanpa isi note) terurut terbaru→lama (cap 20); entri audit hanya muncul untuk ADMIN. Struktur snapshot/timeline ini sengaja disiapkan sebagai input untuk fitur AI staff brief di sprint berikutnya — Sprint ini belum memakai AI.

Security hardening (lihat ADR-017): security headers dasar (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`), timing login disamakan agar tidak bocor keberadaan email, proxy melindungi `/audit-logs`, `update*`/`delete*` menolak record yang sudah soft-deleted, dan seed production hanya membuat admin (`manager`/`member` hanya non-production). CSRF mengandalkan proteksi bawaan Next.js Server Actions. Accepted risks: tidak ada MFA/password reset/OAuth, session belum sliding/rotation, audit log belum tamper-proof, belum ada rate limiting penuh dan CSP.
