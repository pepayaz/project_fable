# Architecture Decision Records — Project Fable

## Purpose

Dokumen ini mencatat keputusan arsitektur penting untuk Project Fable. Architecture Decision Record membantu menjaga alasan teknis tetap jelas, terutama jika project berkembang.

## ADR-001 Use Next.js for MVP

Status: Accepted

### Context

Project Fable membutuhkan aplikasi web yang bisa dibuat cepat, mudah dideploy, dan cocok untuk portfolio. Aplikasi membutuhkan frontend, backend ringan, form, database access, dan dashboard.

### Decision

Gunakan Next.js sebagai framework utama.

### Consequences

Positive:

- Frontend dan backend dapat berada dalam satu project.
- Cocok untuk TypeScript.
- Mudah deploy ke Vercel.
- Banyak dukungan dari AI coding agents.
- Cocok untuk dashboard app.

Negative:

- Perlu memahami App Router.
- Perlu disiplin memisahkan UI dan business logic.

## ADR-002 Use TypeScript

Status: Accepted

### Decision

Gunakan TypeScript.

### Consequences

Positive:

- Data model lebih jelas.
- Refactor lebih aman.
- Cocok dengan Prisma.
- Portfolio terlihat lebih profesional.

Negative:

- Ada learning curve tambahan.

## ADR-003 Use Prisma ORM

Status: Accepted

### Decision

Gunakan Prisma ORM.

### Consequences

Positive:

- Schema database terdokumentasi.
- Query lebih type-safe.
- Mudah menggunakan SQLite lalu migrate ke PostgreSQL.
- Cocok untuk AI-assisted coding.

Negative:

- Perlu memahami migration.

## ADR-004 Use SQLite for MVP

Status: Accepted

### Decision

Gunakan SQLite untuk MVP.

### Consequences

Positive:

- Setup sederhana.
- Cocok untuk development lokal.
- Tidak perlu database server.
- Mudah dibuat seed data.

Negative:

- Tidak ideal untuk production multi-user besar.
- Perlu migrasi ke PostgreSQL saat deployment serius.

## ADR-005 Delay Authentication Until Core Workflow Works

Status: Accepted

### Decision

Tunda authentication sampai staff, department, task, attendance, availability, dan dashboard dasar berjalan.

### Consequences

Positive:

- Fokus pada core product.
- MVP lebih cepat selesai.
- Risiko over-engineering berkurang.

Negative:

- App awal belum aman untuk data sensitif.
- Deployment publik harus menunggu auth atau menggunakan demo data.

## ADR-006 Use RTK AI for Terminal Output

Status: Accepted

### Decision

Gunakan RTK AI untuk command terminal yang berpotensi menghasilkan output besar.

Recommended commands:

```bash
rtk git status
rtk git diff
rtk find .
rtk grep "keyword" .
rtk test <command>
```

### Consequences

Positive:

- Token lebih hemat.
- Output terminal lebih ringkas.
- Agent lebih fokus pada informasi penting.

Negative:

- Tidak semua agent/extension otomatis memakai RTK.
- User harus memberi instruksi eksplisit.

## ADR-007 Use Graphify After Codebase Exists

Status: Proposed

### Decision

Gunakan Graphify setelah app scaffold dan struktur kode mulai tersedia.

### Consequences

Positive:

- Agent dapat memahami relasi file.
- Membantu context selection.
- Mengurangi kebutuhan membaca seluruh repo.

Negative:

- Perlu regenerate graph setelah perubahan struktur besar.

## ADR-008 Use AI Agents with Human Approval

Status: Accepted

### Decision

AI agent harus meminta persetujuan sebelum perubahan besar.

Workflow:

1. Inspect structure.
2. Identify candidate files.
3. Propose plan.
4. Wait for approval.
5. Implement minimal changes.
6. Run test/build.
7. Summarize diff.

## ADR-009 Keep MVP Non-Enterprise

Status: Accepted

### Decision

MVP hanya fokus pada organisasi/kepanitiaan/komunitas.

Out of scope:

- Payroll.
- Contract management.
- Tax.
- Benefit.
- Enterprise compliance.
- Multi-company.

## ADR-010 Prefer Small Commits

Status: Accepted

### Decision

Gunakan commit kecil per milestone atau per fitur.

Example commit messages:

```text
docs: initialize planning documents
chore: scaffold next app
feat: add staff model
feat: add staff list page
feat: add task assignment
test: add staff validation tests
```

## ADR-011 Use Server Actions with Service Layer for MVP

Status: Accepted

### Context

API_SPEC.md membuka dua opsi implementasi: Next.js Server Actions atau API Routes. Membangun keduanya sekaligus menambah kompleksitas tanpa manfaat untuk MVP.

### Decision

Gunakan Next.js Server Actions sebagai mekanisme mutasi dan data access untuk MVP. Business logic ditempatkan di `lib/services/` dan validasi di `lib/validations/` agar terpisah dari UI. API Routes ditunda sampai ada kebutuhan nyata (misalnya integrasi eksternal atau mobile client).

### Consequences

Positive:

- Lebih sedikit boilerplate dibanding API Routes.
- Validasi dan business logic tetap di server.
- Service layer dapat dipakai ulang jika API Routes dibutuhkan nanti.

Negative:

- Endpoint HTTP publik tidak tersedia sampai API Routes dibuat.
- API_SPEC.md berfungsi sebagai kontrak operasi, bukan dokumentasi endpoint literal.

## ADR-012 Store Enum-Like Values as String in SQLite

Status: Accepted

### Context

Data model menggunakan banyak enum (StaffStatus, TaskStatus, TaskPriority, AttendanceStatus, DayOfWeek, PerformanceNoteCategory), tetapi Prisma tidak mendukung native enum pada provider SQLite.

### Decision

Simpan nilai enum-like sebagai `String` di Prisma schema selama MVP menggunakan SQLite. Validasi nilai dilakukan dengan Zod menggunakan daftar konstanta yang didefinisikan satu kali di `lib/validations/`. Native enum dapat dipertimbangkan saat migrasi ke PostgreSQL.

### Consequences

Positive:

- Schema tetap berjalan di SQLite tanpa workaround.
- Satu sumber kebenaran nilai enum di Zod schema.
- Migrasi ke PostgreSQL enum tetap terbuka.

Negative:

- Database tidak memvalidasi nilai pada level kolom.
- Semua tulisan ke database harus melalui validasi Zod agar data konsisten.
