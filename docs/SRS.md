# Software Requirements Specification — Project Fable

## Introduction

Project Fable adalah aplikasi people management untuk organisasi, kepanitiaan, komunitas, dan tim mahasiswa. Dokumen ini mendefinisikan kebutuhan software dari sisi fungsional, non-fungsional, data, UI, dan batasan teknis.

## Intended Audience

- Developer
- AI coding agent
- Project owner
- Product reviewer
- Future contributor

## System Scope

MVP didefinisikan sebagai Milestone 1 sampai Milestone 6 pada `docs/ROADMAP.md`.

Sistem akan menyediakan fitur utama:

- Staff management
- Department management
- Task management
- Attendance management
- Availability management
- Performance notes sederhana (fitur sekunder, P2)
- Dashboard
- Basic search and filter

Sistem pada MVP akan berjalan sebagai web application.

## Recommended Tech Stack

- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui atau custom components sederhana
- ORM: Prisma
- Database MVP: SQLite
- Future Database: PostgreSQL
- Package Manager: npm
- Version Control: Git
- AI Agent Workflow: RTK AI + Graphify + AGENTS.md + CLAUDE.md

## User Roles

Role akun login dasar:

- ADMIN
- MANAGER
- MEMBER

Permission dasar sudah diterapkan server-side. UI juga menyembunyikan action yang tidak tersedia, tetapi server-side permission checks tetap menjadi sumber kebenaran.

### Admin

Admin dapat mengelola staff, department, task, attendance, availability, performance notes, dan dashboard.

### Manager dan Member

Manager dapat mengelola operational data, sedangkan Member hanya dapat mengakses settings sampai User dapat dihubungkan ke Staff.

## Functional Requirements

### FR-001 Staff List

Sistem harus menyediakan halaman daftar staff.

Acceptance criteria:

- User dapat melihat nama, email, divisi, position, status, dan batch.
- User dapat mencari staff berdasarkan nama atau email.
- User dapat filter berdasarkan department dan status.

### FR-002 Create Staff

Sistem harus menyediakan form tambah staff.

Field minimum:

- name
- email
- phone
- department
- position
- status
- batch
- notes

Acceptance criteria:

- Name wajib diisi.
- Email harus valid jika diisi.
- Status memiliki pilihan tetap.
- Staff tersimpan ke database.

### FR-003 Update Staff

Sistem harus memungkinkan user mengubah data staff.

Acceptance criteria:

- User dapat membuka detail staff.
- User dapat mengubah field utama.
- Perubahan tersimpan ke database.
- Updated timestamp berubah.

### FR-004 Delete or Deactivate Staff

Sistem harus memungkinkan user menghapus atau menonaktifkan staff.

Acceptance criteria:

- Penghapusan memakai soft delete (`deletedAt`) untuk semua entity utama, bukan hard delete.
- Record yang sudah dihapus tidak muncul di list, dropdown, dashboard, dan halaman edit/detail (not found).
- Data historis dan relasi terkait tetap utuh karena row tidak dihapus permanen.
- Restore, trash page, dan permanent delete belum termasuk pada tahap ini.

### FR-004a Staff Detail 360

Sistem harus menyediakan halaman detail staff read-only di `/staff/[id]`.

Acceptance criteria:

- Menampilkan profil staff (name, email, phone, position, status, department, batch, created/updated).
- Menampilkan data terkait staff: assigned tasks, attendance, availability, dan performance notes.
- Hanya menampilkan record terkait yang belum dihapus (`deletedAt: null`).
- Staff yang sudah dihapus atau tidak ditemukan menampilkan not found.
- Memerlukan permission `staff:read` (ADMIN dan MANAGER); MEMBER belum diizinkan.
- Tombol Edit hanya muncul jika user punya `staff:update`.
- Belum termasuk: inline edit, create related records dari halaman ini, pagination/filter, dan chart/export.

### FR-004d People Intelligence Center

Sistem menyediakan halaman `/insights` (People Intelligence Center) read-only berbasis rule untuk membantu manager memahami kondisi tim.

Acceptance criteria:

- Memerlukan permission `dashboard:read` (ADMIN dan MANAGER); MEMBER → `/unauthorized`; `/insights` dilindungi proxy.
- **Organization Summary:** active staff, open/overdue/blocked tasks, attendance issues, warning/improvement notes, unassigned open tasks, staff tanpa availability, staff tanpa open task.
- **Staff Attention List:** label netral Needs attention / Follow-up suggested / Stable dengan reasons objektif; link ke `/staff/[id]`. Memakai `evaluateStaffSignals` yang sama dengan Staff Detail.
- **Workload Balance:** staff dengan open tasks terbanyak, overdue by staff, unassigned open tasks, staff tanpa open task.
- **Weekly Operations (last 7 days):** tasks completed recently (proxy `status=DONE` & `updatedAt >= window`, didokumentasikan), currently overdue, attendance issues recently, recent performance notes by category (hitungan saja).
- Populasi utama = staff ACTIVE; semua query menghormati soft delete (`deletedAt: null`).
- Tidak ada skor performa final, rekomendasi promosi/demosi/pemecatan, atau isi performance note. Dashboard menampilkan teaser ringkas.
- Struktur disiapkan sebagai fondasi AI Weekly Brief (belum diimplementasikan).

### FR-004c Staff Quick Insights and Activity Timeline

Halaman detail staff menampilkan Quick Insights dan Activity Timeline read-only dari data existing.

Acceptance criteria:

- **Quick Insights** bersifat rule-based dan netral: open tasks, overdue tasks, attendance issues (ABSENT/LATE/SICK), availability count, notes by category, dan sinyal "Needs attention" / "Follow-up suggested" / "No immediate signals" disertai alasan transparan.
- Tidak ada label ekstrem atau penilaian final terhadap staff; tidak ada AI/scoring.
- **Activity Timeline** menggabungkan task/attendance/availability/performance note terurut terbaru→lama (cap 20).
- Performance note di timeline hanya menampilkan kategori + tanggal, tidak menampilkan isi note.
- Entri audit log di timeline hanya untuk ADMIN (`auditLogs:read`); MANAGER tidak melihatnya.
- Semua sumber menghormati soft delete (`deletedAt: null`); staff yang dihapus tetap not found; MEMBER tidak boleh akses.
- Struktur snapshot/timeline disiapkan sebagai fondasi untuk AI staff brief di masa depan (belum diimplementasikan).

### FR-004b List Search, Filter, and Sort

Sistem harus menyediakan search, filter, dan sort server-side pada list page utama.

Acceptance criteria:

- Staff: search name/email/position; filter status, department; sort name, createdAt, updatedAt.
- Departments: search name; sort name, createdAt, updatedAt.
- Tasks: search title/description; filter status, priority, assignee, department; sort deadline, priority, createdAt, updatedAt.
- Attendance: search eventName; filter status, staff; sort date, createdAt.
- Availability: filter staff, dayOfWeek; sort dayOfWeek, startTime, createdAt.
- Performance Notes: search note; filter category, staff; sort createdAt, updatedAt.
- State filter disimpan di URL query params (shareable, refreshable) dan dijaga setelah Apply.
- Query param invalid diabaikan/di-default, bukan crash.
- Semua query menghormati soft delete (`deletedAt: null`) dan RBAC read permission.
- Known limitations: belum ada pagination, `contains` SQLite case-insensitive terutama ASCII, term pencarian tampil di URL, sort task priority masih alfabet (bukan severity); belum ada export, saved filter, atau advanced query builder.

### FR-004f AI Briefing & Review System

Sistem menyediakan fitur AI opt-in untuk men-generate briefing draft bagi manager.

Acceptance criteria:

- Memerlukan permission `ai:generate` (ADMIN dan MANAGER); MEMBER tidak boleh generate.
- Staff AI Brief tersedia di `/staff/[id]`; Weekly People Ops Brief di `/insights`.
- Default provider Google Gemini (`gemini-2.5-flash-lite`) via env `AI_PROVIDER`/`GEMINI_API_KEY`/`AI_MODEL`; provider abstraction memungkinkan Anthropic/OpenAI sebagai future provider tanpa mengubah business logic.
- Fitur graceful-disabled bila `GEMINI_API_KEY` kosong; UI menampilkan state not-configured/idle/generating/output/error dengan tombol copy dan disclaimer draft/review-only.
- Output AI tidak disimpan ke database; prompt/output tidak di-log.
- Data yang dikirim dibatasi whitelist: staff brief memakai profil, quick insights, ringkasan task/attendance/availability, dan performance-note category counts; weekly brief memakai People Intelligence summary. Tidak mengirim passwordHash, session/token/cookie, audit log mentah, atau isi penuh performance note.
- Tidak ada chatbot, AI scoring final, atau rekomendasi promosi/demosi/pemecatan; output netral dan diposisikan sebagai draft untuk review manusia.
- Audit ringan mencatat event generate (summary aman saja).

### FR-004g AI Writing Assistant

Sistem menyediakan AI writing tools opt-in untuk membantu manager menyusun draft komunikasi dan draft note.

Acceptance criteria:

- Memerlukan permission `ai:generate` (ADMIN dan MANAGER); MEMBER tidak boleh generate AI writing.
- Tools: follow-up message draft, performance note draft, dan availability reminder draft di `/staff/[id]`; team availability reminder di `/insights`.
- Semua output draft/review/copy-only: tidak auto-save, tidak auto-create performance note, tidak auto-send pesan, tidak mengirim email.
- Tone (Neutral/Concise/Supportive, default Neutral) hanya memengaruhi gaya; optional manager context dibatasi ≤500 karakter dan tidak disimpan/di-log/di-audit.
- Privacy: tidak mengirim passwordHash/session/token/cookie, audit log mentah, isi penuh performance note, atau data staff lain; output AI tidak disimpan; prompt/output/context tidak di-log.
- Output netral, supportive, plain text (tanpa markdown/Date/Subject/memo); tanpa tuduhan, diagnosis, performance score, atau rekomendasi pemecatan/demosi/promosi/hukuman.
- Audit ringan mencatat event generate (summary aman saja).
- Fitur graceful-disabled bila `GEMINI_API_KEY` kosong.

### FR-004e Member Self-Service Portal

Sistem menyediakan portal `/my` (My Workspace) untuk pengguna yang ter-link ke Staff melalui `User.linkedStaffId`.

Acceptance criteria:

- Memerlukan permission `my:read`; login MEMBER redirect ke `/my`; `/my` dilindungi proxy.
- MEMBER hanya melihat data miliknya berdasarkan `linkedStaffId` (profil, tasks, attendance, availability, performance summary), tidak pernah data staff lain.
- Profil dan attendance view-only; MEMBER tidak bisa mengedit keduanya.
- MEMBER boleh mengubah status task miliknya, terbatas TODO/IN_PROGRESS/DONE (ownership-scoped, audited).
- MEMBER boleh create/update/delete availability miliknya (ownership-scoped, audited).
- Performance notes hanya ditampilkan sebagai hitungan per kategori, tanpa isi note.
- `staffId` tidak pernah diambil dari client; boundary kepemilikan ditegakkan di service/action.
- User belum linked → empty state jelas; linked staff yang soft-deleted → unavailable state; semua query `deletedAt: null`.
- ADMIN/MANAGER tidak wajib linked; jika tidak linked dan membuka `/my`, tampil empty state.

### FR-005 Department List

Sistem harus menyediakan halaman daftar department.

Acceptance criteria:

- User dapat melihat nama department, deskripsi, dan jumlah staff.
- User dapat membuka detail department.

### FR-006 Create Department

Sistem harus menyediakan form tambah department.

Acceptance criteria:

- Name wajib diisi.
- Name unik jika memungkinkan.
- Department tersimpan ke database.

### FR-007 Task List

Sistem harus menyediakan halaman daftar task.

Acceptance criteria:

- User dapat filter task berdasarkan status, priority, assignee, dan department.
- User dapat melihat task overdue.

### FR-008 Create Task

Sistem harus menyediakan form tambah task.

Acceptance criteria:

- Title wajib diisi.
- Status default adalah todo.
- Priority default adalah medium.
- Task tersimpan ke database.

### FR-009 Update Task Status

Sistem harus memungkinkan perubahan status task.

### FR-010 Attendance Record

Sistem harus menyediakan fitur pencatatan attendance.

### FR-011 Availability Record

Sistem harus menyediakan fitur pencatatan availability.

### FR-012 Dashboard

Sistem harus menyediakan dashboard sebagai management overview.

Dashboard menampilkan:

- Metric cards: total staff, active staff, departments, open tasks, overdue tasks, completion rate, unassigned open tasks, performance notes.
- Tasks: breakdown by status dan by priority (completed, blocked, cancelled, total ikut diperhitungkan).
- People: staff by status, staff by department, top workload by open tasks.
- Attendance & Performance: attendance by status, performance notes by category.
- Recent activity: recent tasks, attendance, performance notes.
- Audit (ADMIN-only): recent audit logs dan activity by action.
- CSS-only visual analytics: Tasks by Status, Tasks by Priority, Staff by Department, Staff by Status, Attendance by Status, Performance Notes by Category, dan Top Staff by Open Tasks.

Acceptance criteria:

- Task completion rate = `completed / (total non-deleted − cancelled) × 100`; 0% bila denominator 0.
- Semua metrik non-audit menghormati soft delete (`deletedAt: null`).
- Section audit hanya di-fetch dan dirender bila user punya `auditLogs:read` (ADMIN); MANAGER tidak menerima data audit.
- AuditLog tidak di-soft-delete, sehingga query audit tidak memakai filter `deletedAt`.
- Visualisasi memakai reusable CSS/Tailwind components, tanpa chart library.

### FR-013 Trash and Restore

Sistem harus menyediakan halaman `/trash` untuk ADMIN agar soft-deleted records bisa direview dan direstore.

Acceptance criteria:

- `/trash` hanya bisa diakses ADMIN lewat permission `trash:read`.
- Restore hanya bisa dilakukan ADMIN lewat permission `trash:restore`.
- Entity yang tampil: Staff, Department, Task, Attendance, Availability, PerformanceNote.
- AuditLog, User, dan Session tidak tampil di trash.
- Restore hanya boleh untuk record dengan `deletedAt` tidak null, dan mengubah record target menjadi `deletedAt: null`.
- Restore tidak cascade. Child restore ditolak bila parent terkait masih soft-deleted.
- Department restore mengecek conflict unique name dan menampilkan error aman.
- Restore sukses dicatat ke AuditLog dengan action `RESTORE`.
- Permanent delete tidak tersedia pada sprint ini.

### FR-014 Audit Log Usability

Sistem harus menyediakan audit log viewer ADMIN-only yang mudah difilter.

Acceptance criteria:

- `/audit-logs` tetap ADMIN-only lewat permission `auditLogs:read`.
- Viewer mendukung `q`, `action`, `entityType`, `actorRole`, `from`, `to`, `sort=createdAt`, dan `dir`.
- Empty state membedakan audit kosong dan filter tanpa hasil.
- Filtering audit tidak membuat audit event baru.
- Export dan tamper-proofing audit log tetap future.

### FR-015 CSV Import and Export

Sistem menyediakan Data Tools untuk pertukaran data CSV.

Acceptance criteria:

- `/data-tools` dapat diakses ADMIN dan MANAGER lewat permission `export:read`.
- Export tersedia untuk Staff, Departments, Tasks, Attendance, Availability, dan Performance Notes.
- Export default hanya record aktif (`deletedAt: null`) dan tidak menyertakan User, Session, AuditLog, AI output, secret, passwordHash, atau session token.
- Performance Notes full-note export hanya boleh ADMIN.
- ADMIN dapat download template CSV untuk Departments, Staff, dan Tasks.
- Import hanya ADMIN lewat permission `import:manage`.
- Import memakai paste CSV, preview, validation report, dan confirm; tidak boleh import bila ada invalid rows.
- Confirm import harus re-parse dan re-validate server-side sebelum write.
- Import mencatat audit `IMPORT`; export mencatat audit `EXPORT`; CSV raw tidak masuk audit.

### FR-016 Admin User Management

Sistem menyediakan `/users` untuk ADMIN mengelola akun aplikasi.

Acceptance criteria:

- `/users` hanya ADMIN lewat `users:read`; mutasi memakai `users:manage`.
- ADMIN dapat list users, create user, activate/deactivate, change role, link/unlink User ke Staff aktif.
- Create user memakai temporary password minimal 8 karakter dan menyimpan hash saja.
- Password hash, session token, dan session hash tidak pernah ditampilkan.
- Deactivate revoke sessions user tersebut.
- Current admin tidak boleh deactivate diri sendiri atau melepas role ADMIN sendiri.
- Tidak ada delete user, password reset email, invitation email, MFA, OAuth, atau email notification.

### FR-017 Production Readiness and Security Hardening

Sistem menyediakan hardening dasar untuk staging/production preparation.

Acceptance criteria:

- Environment validation memvalidasi `DATABASE_URL`, AI provider/model defaults, dan seed admin env secara lazy.
- Empty `GEMINI_API_KEY` tetap membuat AI graceful disabled.
- Production seed tidak membuat demo data/accounts dan menolak admin password kosong/lemah/default.
- Session cookie memakai `HttpOnly`, `SameSite=Lax`, dan `Secure` di production.
- Expired sessions dapat dibersihkan opportunistically.
- Login memakai in-memory failed-attempt limiter dengan pesan generic.
- Protected route prefixes mencakup dashboard, data tools, users, trash, audit logs, insights, member workspace, dan CRUD pages.
- Global error boundary dan not-found page tidak menampilkan stack trace.
- Dokumentasi operasi mencakup seed, backup/restore SQLite, smoke tests, dan deployment checklist.
### Performance

Aplikasi MVP harus responsif untuk data kecil sampai menengah.

Target awal:

- 500 staff
- 50 department
- 5.000 task
- 10.000 attendance records

### Maintainability

Kode harus modular, readable, dan mudah dikembangkan.

### Reliability

Operasi CRUD tidak boleh merusak relasi data. Penghapusan memakai soft delete agar data historis tidak hilang permanen.

### Portability

Aplikasi harus dapat dijalankan lokal dengan instruksi yang jelas.

### Security

Aplikasi harus menghindari exposure data sensitif. Auth foundation tersedia dengan password hashing, database session, httpOnly cookie, protected routes, dan logout.

Audit log foundation mencatat create/update/delete/restore/generate/export/import pada entity utama (siapa, kapan, terhadap apa) dengan summary aman, tanpa menyimpan passwordHash, session token, raw cookie, CSV raw, temporary password, atau dump objek. Viewer audit log read-only, filterable, dan hanya untuk ADMIN.

Hardening dasar sudah diterapkan (lihat ADR-017): security headers HTTP dasar (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`), timing login disamakan agar tidak bocor keberadaan email, proxy melindungi `/audit-logs`, service `update*`/`delete*` menolak record yang sudah soft-deleted, dan seed production hanya membuat admin. CSRF mengandalkan proteksi bawaan Next.js Server Actions.

Accepted risks / future sprint: MFA, password reset, email verification, OAuth/SSO, audit log tamper-proofing/export, permanent delete policy, pencatatan aksi gagal, session sliding/rotation, dan production-grade distributed rate limiting.

### AI-Agent Compatibility

Repository harus memiliki:

- AGENTS.md
- CLAUDE.md
- docs
- README.md
- RTK workflow
- Graphify workflow setelah struktur kode tersedia

## Data Requirements

Entity utama MVP:

- Staff
- Department
- Task
- Attendance
- Availability
- PerformanceNote
- User
- Session
- AuditLog


## Error Handling Requirements

Sistem harus menangani:

- Input kosong pada field wajib.
- Email invalid.
- Department tidak ditemukan.
- Staff tidak ditemukan.
- Task tidak ditemukan.
- Deadline invalid.
- Relasi database gagal.
- Data kosong pada dashboard.

## Constraints

- MVP tidak boleh terlalu kompleks.
- Fokus pada web app.
- Hindari enterprise HRIS features di awal.
- Hindari complex authorization sebelum fitur inti stabil.
- Hindari over-engineering.
