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

## ADR-013 Use First-Party Database Sessions for Auth Foundation

Status: Accepted

### Context

Project Fable sudah melewati MVP demo dan mulai diarahkan menjadi internal people operations platform. Sistem membutuhkan login/logout, protected routes, dan akun admin seed tanpa langsung membawa kompleksitas RBAC detail, OAuth/SSO, MFA, atau audit log.

### Decision

Gunakan auth foundation first-party dengan model `User` dan `Session`.

- User dan Staff tetap entity terpisah.
- Role disimpan sebagai String: `ADMIN`, `MANAGER`, `MEMBER`.
- Password di-hash dengan Node built-in `crypto.scrypt` dan random salt.
- Verifikasi password memakai `timingSafeEqual`.
- Session token dibuat dengan random bytes, plaintext token disimpan hanya di cookie, dan database menyimpan hash token.
- Protected routes memakai `proxy.ts` untuk redirect awal.
- Server Actions yang mengubah data tetap memanggil guard server-side.

### Consequences

Positive:

- Tidak menambah dependency auth baru.
- Session dapat dicabut lewat database.
- Password plaintext tidak pernah disimpan.
- Pola auth tetap sederhana dan cocok untuk platform internal tahap awal.

Negative:

- Belum ada RBAC detail.
- Belum ada audit log.
- Belum ada rate limiting penuh, password reset, email verification, MFA, atau OAuth/SSO.
- Perlu security hardening lanjutan sebelum production publik.

## ADR-014 Use Coarse Role-Based Access Control Before Ownership Rules

Status: Accepted

### Context

Project Fable needs server-side authorization after auth foundation. The app has roles (`ADMIN`, `MANAGER`, `MEMBER`) but User is not linked to Staff yet, so self-service ownership rules cannot be enforced safely.

### Decision

Implement coarse RBAC using explicit permission strings and a role-to-permission map.

- `ADMIN` receives all permissions.
- `MANAGER` can view dashboard, CRUD staff, tasks, attendance, availability, and performance notes, and view departments.
- `MEMBER` can only access settings for now.
- Server Components use read permissions.
- Server Actions use create/update/delete permissions.
- UI hides unavailable actions, but server-side guards remain authoritative.

### Consequences

Positive:

- Authorization is enforced server-side.
- Permission behavior is centralized and reviewable.
- MEMBER access remains conservative until `linkedStaffId` or equivalent ownership mapping exists.

Negative:

- No fine-grained ownership checks yet.
- No audit log yet.
- Department mutation is ADMIN-only for now.

## ADR-015 Add Audit Log Foundation for Primary Entities

Status: Accepted

### Context

Setelah auth dan RBAC, Project Fable membutuhkan jejak siapa mengubah apa pada data internal. Kebutuhan ini cukup untuk akuntabilitas dasar, belum untuk kepatuhan formal atau tamper-proofing.

### Decision

Tambahkan model `AuditLog` dan helper `recordAuditLog` yang dipanggil di action layer setelah service berhasil dan sebelum redirect.

- Dicatat untuk create/update/delete pada Staff, Department, Task, Attendance, Availability, dan PerformanceNote.
- `AuditLog` menyimpan snapshot actor (`actorId`, `actorName`, `actorRole`) tanpa relasi foreign key ke User, agar log immutable dan independen dari lifecycle User.
- `summary` memakai whitelist field aman. PerformanceNote hanya menyimpan kategori dan nama staff, bukan isi note.
- `recordAuditLog` bersifat best-effort: kegagalan audit tidak menggagalkan aksi user.
- Viewer `/audit-logs` read-only dan hanya untuk ADMIN lewat permission `auditLogs:read`.

### Consequences

Positive:

- Akuntabilitas dasar tersedia tanpa dependency baru.
- Tidak menyimpan passwordHash, session token, raw cookie, atau dump objek lama/baru.
- Pola pencatatan terpusat dan mudah ditinjau.

Negative:

- Belum tamper-proof (log bisa diubah langsung di database).
- Belum mencatat aksi yang gagal atau aksi auth (login/logout).
- Belum ada filter, search, export, atau pagination.
- Pencatatan tidak transaksional dengan mutasi, sehingga ada celah kecil log hilang jika audit gagal.

## ADR-016 Use Soft Delete for Primary Entities

Status: Accepted

### Context

Project Fable menyimpan data operasional yang bernilai historis (staff, task, attendance, dll). Hard delete menghapus data permanen dan merusak jejak histori serta audit. Sistem membutuhkan penghapusan yang aman tanpa langsung membawa kompleksitas restore, trash, atau permanent delete.

### Decision

Gunakan soft delete dengan kolom `deletedAt DateTime?` pada Staff, Department, Task, Attendance, Availability, dan PerformanceNote.

- `delete*` service men-set `deletedAt` alih-alih menghapus row.
- Semua read normal (list, options, getById, validasi relasi) memakai filter `deletedAt: null`.
- `getById` memakai `findFirst` karena `deletedAt` bukan kolom unik; record yang sudah deleted mengembalikan null sehingga halaman edit menampilkan 404.
- Dashboard mengabaikan record yang sudah deleted.
- Department hanya boleh dihapus jika tidak punya staff aktif (non-deleted).
- Audit log tetap mencatat action DELETE seperti sebelumnya.
- Child records (Attendance/Availability/PerformanceNote) tidak ikut ter-soft-delete saat Staff dihapus, agar histori tetap utuh.

### Consequences

Positive:

- Data historis tidak hilang permanen.
- Audit trail tetap konsisten.
- Tidak menambah dependency baru.

Negative:

- Belum ada restore, trash page, atau permanent delete.
- Child records milik staff yang sudah dihapus tetap muncul di list-nya (tidak difilter berdasarkan `staff.deletedAt`).
- Nama Department yang sudah soft-deleted tetap menempati unique constraint, sehingga nama itu belum bisa dipakai ulang sampai ada permanent delete/restore.
- Ukuran database tumbuh karena row tidak benar-benar dihapus.
