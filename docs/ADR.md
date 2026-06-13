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

## ADR-017 Security Hardening Review for Portfolio MVP

Status: Accepted

### Context

Setelah auth, RBAC, audit log, dan soft delete, dilakukan review keamanan dasar berbasis kode. Postur sudah kuat (password scrypt + salt + timingSafeEqual, session token hashed, cookie httpOnly/secure, RBAC server-side menyeluruh, soft delete konsisten, audit tanpa data sensitif). Review menemukan beberapa perbaikan realistis tanpa menambah dependency atau mengubah schema.

### Decision

Terapkan hardening berikut:

- `proxy.ts` menambahkan `/audit-logs` ke protected prefixes dan matcher agar redirect dini konsisten (page guard `auditLogs:read` tetap authoritative).
- `next.config.ts` menambahkan security headers dasar: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, dan `Permissions-Policy` minimal. CSP ditunda agar tidak mengganggu Next.js.
- `authenticateUser` selalu menjalankan `verifyPassword` (terhadap dummy hash konstan bila user tidak ada/inactive) untuk menyamakan timing dan mencegah enumerasi email; error tetap generik.
- Service `update*`/`delete*` melakukan pre-check `deletedAt: null` sehingga record yang sudah soft-deleted tidak bisa diubah/dihapus ulang lewat request manual; ditolak dengan pesan aman.
- `seed.js` hanya membuat user QA `manager`/`member` saat `NODE_ENV !== "production"`; di production hanya admin yang dibuat bila `SEED_ADMIN_PASSWORD` tersedia.

### Consequences

Positive:

- Permukaan serangan dasar berkurang tanpa dependency baru.
- Perilaku auth/RBAC fungsional tidak berubah.

Accepted risks (di luar scope MVP):

- Belum ada MFA, password reset, email verification, atau OAuth/SSO.
- Session belum sliding/rotation; session lama bertahan sampai expiry; logout hanya device saat ini.
- CSRF mengandalkan proteksi origin bawaan Next.js Server Actions (tanpa library CSRF).
- Audit log belum tamper-proof.
- Belum ada rate limiting penuh dan CSP.

## ADR-018 Member Self-Service Portal via Optional User–Staff Link

Status: Accepted

### Context

Role MEMBER sebelumnya hanya bisa login dan membuka Settings karena `User` belum terhubung ke `Staff`. Dibutuhkan self-service portal agar MEMBER berguna, tanpa memberi akses global ke data staff lain.

### Decision

Tambahkan relasi optional `User.linkedStaffId String? @unique` ke `Staff`, dan bangun portal `/my`.

- `linkedStaffId` opsional: ADMIN/MANAGER tidak wajib linked; `@unique` menjamin satu Staff ↔ satu User.
- Permission baru: `my:read`, `my:availability:manage`, `my:tasks:update` (ADMIN via spread; MANAGER & MEMBER mendapat ketiganya; MEMBER tidak mendapat permission global staff/tasks).
- **Boundary keamanan utama = scoping `linkedStaffId` di server**, bukan UI hiding. Semua My-service memakai `staffId` hasil resolve dari sesi (`getMyStaff`), tidak pernah dari client; mutasi memverifikasi kepemilikan record.
- MEMBER hanya melihat data miliknya: profil (view-only), tasks (boleh update status terbatas TODO/IN_PROGRESS/DONE), attendance (view-only), availability (self-service CRUD), performance notes (hanya hitungan kategori, tanpa isi).
- Availability dan task-status oleh MEMBER dicatat di audit log dengan summary aman.
- `getDefaultRedirectForRole(MEMBER)` → `/my`. `/my` dilindungi proxy.
- User belum linked → empty state; linked staff yang soft-deleted → unavailable state. Semua query `deletedAt: null`.

### Consequences

Positive:

- MEMBER memiliki workspace berguna tanpa kebocoran data staff lain.
- Boundary kepemilikan ditegakkan server-side dan dapat ditinjau.
- Tidak menambah dependency; satu schema change minimal.

Negative / accepted:

- MEMBER tidak bisa mengedit profil sendiri (dikelola manager).
- Isi performance note tidak terlihat MEMBER (hanya hitungan kategori).
- Linking dilakukan manual/seed; belum ada UI admin untuk mengelola link User↔Staff.

## ADR-019 AI Briefing & Review System (Provider-Agnostic, Gemini-First)

Status: Accepted

### Context

Project Fable membutuhkan fitur AI yang benar-benar berguna namun constrained dan aman — bukan chatbot umum atau AI slop. Fokusnya membantu manager dengan briefing draft dari data yang sudah ada (staff brief dan weekly people-ops brief), bukan mengambil keputusan HR.

### Decision

Bangun AI Briefing & Review System dengan provider abstraction, default provider Google Gemini.

- **Provider abstraction** (`lib/ai/`): interface `AiProvider` generic; `getAiProvider()` membaca `AI_PROVIDER` (default `gemini`). Implementasi utama `gemini.ts` memakai REST Google Generative Language API via `fetch` native (tanpa dependency baru). Anthropic/OpenAI disebut sebagai future provider; business logic tidak hardcode ke satu provider.
- **Env:** `AI_PROVIDER="gemini"`, `GEMINI_API_KEY=""`, `AI_MODEL="gemini-2.5-flash-lite"`. Secret tidak di-commit; hanya dibaca server-side. Fitur graceful-disabled bila `GEMINI_API_KEY` kosong.
- **Safety framework** (`lib/ai/safety.ts`): system prompt reusable yang melarang mengarang data, keputusan HR sensitif (promosi/demosi/pemecatan/hukuman), scoring final; mewajibkan bahasa netral, menyebut keterbatasan data, dan memosisikan output sebagai draft untuk review manusia.
- **Fitur:** Staff AI Brief di `/staff/[id]` dan Weekly People Ops Brief di `/insights`, lewat Server Actions dengan guard permission baru `ai:generate` (ADMIN via spread + MANAGER; MEMBER tidak).
- **Privacy boundary:** data contract whitelist (`lib/services/ai-brief.ts`) — profil, quick insights, ringkasan task/attendance/availability, dan performance-note **category counts**. Tidak mengirim passwordHash, session/token/cookie, audit log mentah, atau isi penuh performance note.
- **Tidak menyimpan output AI ke database**; **tidak me-log prompt/output**. Audit ringan mencatat event generate (`action: GENERATE`, `entityType: AiBrief`) dengan summary aman saja.
- UI `AiBriefCard` menyediakan state not-configured/idle/generating/output/error, tombol copy, dan disclaimer draft/review-only. Bukan chatbot, tanpa conversation history.

### Consequences

Positive:

- Fitur AI berguna namun aman, constrained, dan provider-agnostic.
- Tidak menambah dependency; tidak ubah schema.
- Boundary privacy dan RBAC ditegakkan server-side.

Negative / accepted:

- Memerlukan API key eksternal; saat tidak ada, fitur disabled.
- Output bergantung kualitas model; diposisikan sebagai draft, bukan keputusan final.
- Belum ada personal AI brief untuk MEMBER, dan belum ada Anthropic/OpenAI provider (future).

## ADR-020 AI Writing Assistant & Review Workflow

Status: Accepted

### Context

Setelah AI Briefing (ADR-019), dibutuhkan bantuan AI untuk menyusun draft komunikasi dan draft note bagi manager — tetap constrained, netral, dan review-only, bukan AI yang mengambil aksi.

### Decision

Tambahkan AI writing tools draft-only di atas provider abstraction yang sudah ada, tanpa dependency atau schema change.

- **Tools:** follow-up message draft, performance note draft, dan availability reminder draft di `/staff/[id]`; team availability reminder di `/insights`.
- **Draft/review/copy-only:** output tidak disimpan ke database; performance note tidak otomatis dibuat (preview + copy, manager submit manual); pesan tidak otomatis dikirim; tidak ada email/notification.
- **Permission:** reuse `ai:generate` (ADMIN + MANAGER); MEMBER tidak boleh generate AI writing; belum ada personal AI writing untuk MEMBER.
- **Safety:** `AI_WRITING_SAFETY` (reuse core + formatting rules ADR-019, plus writing-specific): draft untuk review manusia; tanpa mengarang fakta; tanpa tuduhan; tanpa diagnosis perilaku/kesehatan; tanpa rekomendasi pemecatan/demosi/promosi/hukuman/gaji; tanpa performance score; tanpa data privat yang tidak diberikan; netral, profesional, ringkas; plain text tanpa markdown/Date/Subject/memo.
- **Input:** tone (Neutral/Concise/Supportive, default Neutral) memengaruhi gaya saja; optional manager context dibatasi ≤500 karakter server-side.
- **Privacy:** whitelist staff facts (tanpa isi penuh performance note), tanpa passwordHash/session/token/cookie/audit mentah/data staff lain. Manager context dan prompt/output tidak di-log; output tidak disimpan; context tidak masuk audit.
- **Audit ringan:** `action: GENERATE`, `entityType: AiWriting`, summary aman (tanpa prompt/output/context).

### Consequences

Positive:

- Manager dibantu menyusun komunikasi/note dengan aman dan netral.
- Tidak menambah dependency, tidak ubah schema, reuse safety & provider abstraction.
- Boundary privacy/RBAC ditegakkan server-side.

Negative / accepted:

- Performance note draft memakai preview + copy (manager paste manual), bukan prefill form, untuk menghindari coupling.
- Kualitas draft bergantung model; diposisikan sebagai draft, bukan keputusan final.
- Fitur disabled bila API key tidak ada.

## ADR-021 Visual Analytics, Trash Restore, and Audit Usability

Status: Accepted

### Context

Project Fable sudah memiliki CRUD, dashboard reporting, soft delete, RBAC, audit log foundation, People Intelligence, dan AI review workflows. Sprint berikutnya perlu meningkatkan readability data, memberi ADMIN cara memulihkan soft-deleted records, dan membuat audit log lebih usable tanpa menambah kompleksitas production-grade seperti export, hash chain, atau hard delete policy.

### Decision

Bangun Sprint 20 sebagai module gabungan visual analytics, trash/restore, dan audit usability tanpa dependency baru dan tanpa schema change.

- **Chart strategy:** gunakan CSS-only visualization components (`ChartCard`, `HorizontalBarList`, `StatusDistribution`) di atas Tailwind/design tokens existing. Tidak memakai Recharts/chart library karena data saat ini berupa categorical counts dan top-N bars.
- **Dashboard visual analytics:** `/dashboard` memakai pola metric cards -> chart overview -> actionable/recent lists. Chart yang dipakai: Tasks by Status, Tasks by Priority, Staff by Department, Staff by Status, Attendance by Status, Performance Notes by Category, dan Top Staff by Open Tasks.
- **Insights visual analytics:** `/insights` menampilkan Attention Levels, Availability Coverage, Open vs Overdue task pressure, Top Open Task Load, dan Overdue by Staff. Staff Attention List tetap menjadi actionable detail utama.
- **Trash route:** `/trash` ADMIN-only via `trash:read`, menampilkan soft-deleted Staff, Department, Task, Attendance, Availability, dan PerformanceNote grouped by entity type. AuditLog, User, dan Session tidak masuk trash.
- **Restore policy:** restore ADMIN-only via `trash:restore`; restore hanya set `deletedAt = null` pada record target, tidak cascade. Child restore ditolak bila parent terkait masih soft-deleted. Department restore mengecek conflict nama. Staff email tidak dicek karena schema saat ini tidak unique.
- **Permanent delete:** tidak dibuat pada Sprint 20. Hard delete memerlukan retention/cascade policy terpisah dan tidak boleh tersedia untuk active records.
- **Audit usability:** `/audit-logs` mendukung `q`, `action`, `entityType`, `actorRole`, `from`, `to`, `sort=createdAt`, dan `dir`, dengan empty state no matching logs dan cap 200 row.
- **Audit events:** restore sukses dicatat sebagai `RESTORE` dengan summary aman. Filtering audit tidak diaudit.

### Consequences

Positive:

- Dashboard dan People Intelligence lebih mudah dibaca tanpa menambah dependency/bundle chart library.
- ADMIN bisa memulihkan data yang soft-deleted tanpa membuka database.
- Audit viewer lebih berguna untuk review operasional dasar.
- Restore path tetap konservatif dan tidak mengubah behavior soft delete normal.

Negative / accepted:

- CSS-only charts tidak punya tooltip/legend interaktif kompleks.
- Trash belum memiliki permanent delete; ini sengaja ditunda sampai ada policy retention/cascade.
- Audit log belum tamper-proof dan belum punya export.
