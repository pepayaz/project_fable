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

Pada auth foundation, role disimpan di User tetapi belum dipakai untuk permission detail. Semua user aktif yang berhasil login dapat mengakses halaman utama.

### Admin

Admin dapat mengelola staff, department, task, attendance, availability, performance notes, dan dashboard.

### Manager dan Member

Role Manager dan Member disiapkan untuk RBAC sprint berikutnya. Pada tahap ini, permission detail belum dibedakan.

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

- Pada MVP, prefer soft delete melalui status inactive/resigned.
- Hard delete hanya digunakan jika aman.
- Data task/attendance terkait tidak rusak.

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

Sistem harus menyediakan dashboard ringkas.

Dashboard menampilkan:

- Total staff.
- Active staff.
- Total department.
- Total task.
- Task by status.
- Overdue task.
- Attendance summary.
- Staff workload summary.

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

Operasi CRUD tidak boleh merusak relasi data.

### Portability

Aplikasi harus dapat dijalankan lokal dengan instruksi yang jelas.

### Security

Aplikasi harus menghindari exposure data sensitif. Auth foundation tersedia dengan password hashing, database session, httpOnly cookie, protected routes, dan logout.

Security hardening lanjutan masih future sprint, termasuk RBAC detail, audit log, rate limiting penuh, password reset, email verification, MFA, OAuth/SSO, dan deployment security headers.

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
