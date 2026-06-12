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

Acceptance criteria:

- Task completion rate = `completed / (total non-deleted − cancelled) × 100`; 0% bila denominator 0.
- Semua metrik non-audit menghormati soft delete (`deletedAt: null`).
- Section audit hanya di-fetch dan dirender bila user punya `auditLogs:read` (ADMIN); MANAGER tidak menerima data audit.
- AuditLog tidak di-soft-delete, sehingga query audit tidak memakai filter `deletedAt`.
- Visualisasi memakai badge/list/progress bar sederhana (CSS/Tailwind), tanpa chart library.

## Non-Functional Requirements

### Usability

Aplikasi harus mudah digunakan oleh user non-teknis.

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

Audit log foundation mencatat create/update/delete pada entity utama (siapa, kapan, terhadap apa) dengan summary aman, tanpa menyimpan passwordHash, session token, raw cookie, atau dump objek. Viewer audit log read-only dan hanya untuk ADMIN.

Security hardening lanjutan masih future sprint, termasuk fine-grained ownership rules, audit log tamper-proofing/filter/search/export, pencatatan aksi gagal, rate limiting penuh, password reset, email verification, MFA, OAuth/SSO, dan deployment security headers.

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
