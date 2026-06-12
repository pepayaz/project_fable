# Data Model — Project Fable

## Purpose

Dokumen ini menjelaskan rancangan data model Project Fable. Data model digunakan sebagai acuan saat membuat database schema, Prisma model, service layer, dan UI.

## Entity Overview

Entity utama MVP:

- Staff
- Department
- Task
- Attendance
- Availability
- PerformanceNote
- User
- Session

Entity tambahan yang dapat ditambahkan nanti:

- Organization
- Event
- RecruitmentCandidate
- EvaluationCycle
- FeedbackForm
- Notification
- Attachment

AuditLog sudah diimplementasikan sebagai foundation (lihat bagian AuditLog di bawah).

Semua entity utama (Staff, Department, Task, Attendance, Availability, PerformanceNote) memakai soft delete melalui kolom `deletedAt`. Lihat bagian Soft Delete di bawah.

## Department

Fields:

- id
- name
- description
- deletedAt
- createdAt
- updatedAt

Relationships:

- Department has many Staff.
- Department has many Task.

Rules:

- Department name should be required.
- Department name should be unique if possible.
- Department should not be deleted if it still has active staff, unless reassignment is handled.

## Staff

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
- deletedAt
- createdAt
- updatedAt

Relationships:

- Staff belongs to Department.
- Staff has many Task.
- Staff has many Attendance.
- Staff has many Availability.
- Staff has many PerformanceNote.

Rules:

- Name is required.
- Email should be valid if provided.
- Status must use predefined enum.
- Staff can exist without department only if organization allows unassigned staff.
- Prefer deactivation over hard delete.

## Task

Fields:

- id
- title
- description
- status
- priority
- deadline
- assignedToStaffId
- departmentId
- deletedAt
- createdAt
- updatedAt

Relationships:

- Task may belong to Staff.
- Task may belong to Department.

Rules:

- Title is required.
- Status defaults to TODO.
- Priority defaults to MEDIUM.
- Task can be assigned to staff, department, or both.
- Overdue task is calculated when deadline is before current date and status is not DONE or CANCELLED.

## Attendance

Fields:

- id
- staffId
- eventName
- date
- status
- notes
- deletedAt
- createdAt
- updatedAt

Relationships:

- Attendance belongs to Staff.

Rules:

- Staff is required.
- Date is required.
- Status must use predefined enum.
- Event name should be required for context.

## Availability

Fields:

- id
- staffId
- dayOfWeek
- startTime
- endTime
- notes
- deletedAt
- createdAt
- updatedAt

Relationships:

- Availability belongs to Staff.

Rules:

- Staff is required.
- Day of week is required.
- Start time must be before end time.
- Overlapping availability should be handled later.

## PerformanceNote

Fields:

- id
- staffId
- category
- note
- deletedAt
- createdAt
- updatedAt

Relationships:

- PerformanceNote belongs to Staff.

Possible categories:

- POSITIVE
- IMPROVEMENT
- WARNING
- GENERAL

## User

User merepresentasikan akun yang dapat login ke aplikasi.

User adalah akun login aplikasi dan harus tetap terpisah dari Staff. Staff merepresentasikan personel organisasi, sedangkan User merepresentasikan kredensial dan sesi akses aplikasi.

Fields:

- id
- name
- email
- passwordHash
- role
- isActive
- createdAt
- updatedAt

Possible roles:

- ADMIN
- MANAGER
- MEMBER

Rules:

- Email harus unique.
- Password tidak pernah disimpan plaintext.
- Role disimpan sebagai String sesuai ADR-012.
- RBAC detail belum diimplementasikan pada auth foundation.

## Session

Session merepresentasikan login session yang tersimpan di database.

Fields:

- id
- userId
- tokenHash
- expiresAt
- createdAt
- updatedAt

Relationships:

- Session belongs to User.

Rules:

- Cookie menyimpan plaintext token, database hanya menyimpan hash token.
- Session harus memiliki expiry.
- Logout harus menghapus session dari database.
- Expired atau inactive user session harus ditolak.

## AuditLog

AuditLog mencatat aksi penting (create/update/delete) pada entity utama untuk akuntabilitas dasar.

Fields:

- id
- action
- entityType
- entityId
- summary
- actorId
- actorName
- actorRole
- createdAt

Rules:

- Dicatat untuk Staff, Department, Task, Attendance, Availability, dan PerformanceNote.
- Actor disimpan sebagai snapshot (`actorId`, `actorName`, `actorRole`), tanpa relasi foreign key ke User, agar log immutable.
- `summary` hanya memakai field aman. Untuk PerformanceNote hanya kategori dan nama staff, tidak pernah isi note.
- Tidak pernah menyimpan passwordHash, session token, raw cookie, atau dump objek lama/baru.
- Index pada `entityType, entityId` dan `createdAt`.
- Hanya ADMIN yang dapat membaca audit log lewat permission `auditLogs:read`.

Possible action values:

- CREATE
- UPDATE
- DELETE

## Soft Delete

Entity utama tidak dihapus permanen. Penghapusan men-set `deletedAt` ke timestamp saat ini.

Rules:

- `deletedAt` null berarti record aktif; berisi nilai berarti sudah dihapus.
- Semua read normal (list, dropdown options, getById, validasi relasi) memfilter `deletedAt: null`.
- Halaman edit/detail untuk record yang sudah dihapus menampilkan not found.
- Dashboard mengabaikan record yang sudah dihapus.
- Department hanya boleh dihapus jika tidak punya staff aktif (non-deleted).
- Audit log tetap mencatat action DELETE.

Known limitations (tahap ini):

- Child records (Attendance/Availability/PerformanceNote) tidak ikut dihapus saat Staff dihapus, dan tidak difilter berdasarkan `staff.deletedAt`, sehingga tetap muncul di list-nya. Ini menjaga histori tetap utuh.
- Nama Department yang sudah soft-deleted tetap menempati unique constraint, sehingga nama itu belum bisa dipakai ulang sampai ada permanent delete/restore.
- Belum ada restore, trash page, atau permanent delete.

## Enum Definitions

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

### PerformanceNoteCategory

- POSITIVE
- IMPROVEMENT
- WARNING
- GENERAL

## Data Integrity Rules

- Deleting Department should be restricted if staff exists.
- Staff deletion should prefer status change.
- Task should not break if assignee is removed.
- Attendance must always reference a valid staff.
- Availability must always reference a valid staff.
- PerformanceNote must always reference a valid staff.
- User and Staff must remain separate entities.
- Session token hash must be unique and should not expose plaintext token.

## Future Data Model Enhancements

Future entities:

- Organization
- Event
- RecruitmentCandidate
- EvaluationCycle
- FeedbackForm
- Notification
- AuditLog
- Attachment
