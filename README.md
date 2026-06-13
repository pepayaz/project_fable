# Project Fable

Project Fable adalah aplikasi people management ringan untuk organisasi, kepanitiaan, komunitas, dan tim kampus. Aplikasi ini membantu pengelola tim mencatat staff, department, task, attendance, availability, performance notes, dan ringkasan dashboard dalam satu workspace sederhana.

Project ini dibuat sebagai portfolio project berbasis workflow Human Capital / People Management non-enterprise, lalu dikembangkan menuju internal people operations platform yang lebih aman.

## 🔗 Demo & Screenshots

> **Note:** Deployment publik sedang dalam persiapan (Sprint 25).
> [Live Demo URL akan ditambahkan di sini]

### Screenshots

*(Placeholder untuk screenshot aplikasi)*
- `[Screenshot Dashboard]`
- `[Screenshot Staff Detail]`
- `[Screenshot People Intelligence Center]`
- `[Screenshot Data Tools]`

## 🚀 Project Summary & Feature Highlights

Fitur utama yang tersedia saat ini:
- **Dashboard & Analytics:** Dashboard management overview dengan metric cards, CSS-only visual analytics, top workload, dan recent activity (tanpa external chart library).
- **Core Entities:** Staff, Department, Task, Attendance, Availability, dan Performance Notes CRUD dengan search, filter, dan sort (server-side).
- **People Intelligence Center:** Insight organisasi, staff attention list, workload balance, dan analisis availability.
- **Member Self-Service Portal:** Staff/Member dapat mengelola availability dan status task miliknya sendiri dengan akses terbatas secara aman.
- **Data Tools:** Import (dengan pre-validation) & Export CSV untuk entity utama.
- **User & Access Management:** Admin user management dengan coarse Role-Based Access Control (RBAC) untuk ADMIN, MANAGER, dan MEMBER.
- **Data Safety:** Soft delete untuk entity utama, trash & restore (ADMIN-only), dan Audit Log untuk akuntabilitas aksi penting.

## 🛡️ Security Posture Summary

Meskipun ini adalah project portfolio, keamanan diutamakan:
- **Authentication:** First-party auth foundation dengan password hashing (scrypt + salt + timing-safe equal) dan session berbasis token yang di-hash di database.
- **Authorization:** Server-side RBAC checks di tingkat Server Actions. Member portal menggunakan verifikasi kepemilikan via `linkedStaffId` yang di-resolve server-side.
- **Hardening:** Environment validation, production seed aman (tanpa demo data & menolak password lemah), session cleanup opportunistik, in-memory failed-login limiter, dan HTTP security headers dasar (termasuk CSP awal). Proxy digunakan untuk melarang akses bypass ke route terproteksi.
- **Data Integrity:** Soft delete mencegah kehilangan data tak sengaja. Semua mutasi vital (create/update/delete/restore/import) diaudit. Proteksi level logic menolak pembaruan untuk data yang sudah di-soft-delete.

## 🤖 AI Safety Summary

Project ini mencakup fitur AI cerdas (opt-in) menggunakan Google Gemini (atau provider lain lewat abstraksi) untuk **membantu** manager, bukan mengambil keputusan akhir:
- **AI Briefing & Review:** Menghasilkan draft Staff AI Brief dan Weekly People Ops Brief.
- **AI Writing Assistant:** Draft follow-up messages, performance notes, dan reminders.
- **Privacy First:** Data payload di-whitelist. **Tidak pernah** mengirim passwordHash, isi detail performance note yang sensitif, raw audit log, atau session token ke API AI.
- **No Side-effects:** Output AI murni **draft review-only**. Output tidak otomatis disimpan ke database, tidak otomatis dikirimkan ke user, dan prompt/output tidak disimpan ke audit log.

## 🗄️ Database Status

- **Status Saat Ini:** Branch `main` adalah **SQLite-first** dan stabil. Aplikasi secara default berjalan menggunakan SQLite (`dev.db`).
- **PostgreSQL:** **Belum live**. Pengaturan `DATABASE_URL` yang diarahkan ke PostgreSQL saat ini hanya memvalidasi URL, namun provider Prisma di skema masih dikonfigurasi untuk SQLite. Migrasi ke PostgreSQL direncanakan akan dilakukan melalui *migration branch* yang terpisah.
- **Alasan Penundaan Deployment Cloud:** Platform cloud serverless (seperti Vercel/Netlify) menggunakan filesystem ephemeral yang **tidak cocok** untuk menampung write file SQLite. Data akan hilang setelah instance serverless mati. Karena itu, PostgreSQL mutlak diperlukan sebelum deployment sungguhan ke cloud. Hal ini dipisahkan untuk ditangani pada sprint khusus (Option D: Decoupled approach).

## ⚠️ Current Limitations

- **Search Case-Sensitivity:** Search `contains` di SQLite bersifat case-insensitive, tetapi akan berubah menjadi case-sensitive saat beralih ke PostgreSQL.
- **Pagination:** Belum ada global pagination di semua tabel (semua hasil diload/di-cap pada batas wajar).
- **Authentication Features:** Belum mendukung OAuth/SSO, 2FA/MFA, email verification, dan password reset flow.
- **Audit Logs:** Audit log belum memiliki tamper-proofing (hash chaining).
- **Data Retention:** Fitur permanent delete (hard delete) belum tersedia.

## 🗺️ Roadmap to Production Deployment

Sprint 24 fokus pada *GitHub Readiness* & *Documentation*. Langkah deployment sesungguhnya dibagi ke dalam sprint berikutnya:
1. **Repository Readiness (Selesai Sprint 24):** Codebase bersih, dokumentasi solid, portfolio-ready.
2. **Migration Planning (Sprint 25):** Strategi *switch branch* untuk PostgreSQL dan perencanaan prototipe migrasi.
3. **Database Migration (Sprint 26):** Eksekusi *switch branch* untuk PostgreSQL (ubah provider Prisma, adaptasi schema).
4. **Cloud Deployment (Sprint 27):** Staging test, lalu deploy produksi ke platform seperti Vercel/Netlify (deployment cloud saat ini **belum selesai/live**).

---

## 💻 Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (for local dev)
- Zod
- Server Actions
- npm

## ⚙️ Requirements

- Node.js 20 atau lebih baru
- npm

## 🛠️ Install & Setup

```bash
npm install
```

Copy file environment example:
```bash
# Unix/Mac
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Default database lokal (SQLite):
```env
DATABASE_URL="file:./prisma/dev.db"
```

Admin seed demo configuration (hanya untuk lokal):
```env
SEED_ADMIN_NAME="Project Fable Admin"
SEED_ADMIN_EMAIL="admin@fable.local"
SEED_ADMIN_PASSWORD="change-this-local-password"
```

## 💾 Prisma Configuration

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
Seed menambahkan department dan staff demo. Jika `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` diisi, seed juga membuat/memperbarui user admin.

## 🏃 Development & Checks

Jalankan dev server:
```bash
npm run dev
```
Akses di: `http://localhost:3000`

Quality Checks:
```bash
npm run lint
npm run build
```

## 📄 Project Documents

- `AGENTS.md` - Aturan AI agent workflow
- `CLAUDE.md` - General instructions
- `DESIGN.md` - UI/UX Design System
- `docs/ARCHITECTURE.md` - Arsitektur aplikasi
- `docs/DATA_MODEL.md` - Skema entitas
- `docs/ROADMAP.md` - Rencana fitur & milestone
- `docs/ADR.md` - Architecture Decision Records
- `docs/DB_MIGRATION.md` - Panduan migrasi ke PostgreSQL
- `docs/OPERATIONS.md` - Panduan operasional & deployment checklist

## 🤖 Agent Workflow

This project is designed to work with AI coding agents. Agents should follow `AGENTS.md`, use RTK for terminal output where possible, and inspect `graphify-out/GRAPH_REPORT.md` if available before reading many files.

Recommended commands:
```bash
rtk git status
rtk find .
rtk git diff
rtk test npm run lint
rtk test npm run build
```
