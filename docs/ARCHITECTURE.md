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
- `MEMBER` can only access settings until User-to-Staff linking and self-service ownership rules exist.

All protected pages use read permissions. All mutating Server Actions use create/update/delete permissions. UI actions are hidden when permission is missing, but server-side permission checks remain the source of truth.

## Audit Log Strategy

Audit log foundation mencatat aksi penting pada entity utama untuk akuntabilitas dasar.

- Model `AuditLog` menyimpan `action`, `entityType`, `entityId`, `summary`, dan snapshot actor (`actorId`, `actorName`, `actorRole`).
- `recordAuditLog` dipanggil di action layer setelah service berhasil dan sebelum redirect, untuk create/update/delete pada Staff, Department, Task, Attendance, Availability, dan PerformanceNote.
- Pencatatan bersifat best-effort: kegagalan audit tidak menggagalkan aksi user.
- `summary` memakai whitelist field aman dan tidak menyimpan passwordHash, session token, raw cookie, atau dump objek. Untuk PerformanceNote hanya kategori dan nama staff.
- Viewer `/audit-logs` read-only dan ADMIN-only lewat permission `auditLogs:read`.
- Foundation ini belum tamper-proof, belum mencatat aksi gagal/auth, dan belum punya filter, search, export, atau pagination.

## Soft Delete Strategy

Entity utama (Staff, Department, Task, Attendance, Availability, PerformanceNote) memakai soft delete melalui kolom `deletedAt DateTime?`.

- `delete*` service men-set `deletedAt` alih-alih menghapus row, sehingga data historis dan audit trail tetap utuh.
- Semua read normal (list, dropdown options, getById, validasi relasi di service) memfilter `deletedAt: null`. `getById` memakai `findFirst` agar record yang sudah dihapus mengembalikan null dan halaman edit menampilkan not found.
- Dashboard mengabaikan record yang sudah dihapus.
- Department hanya boleh dihapus jika tidak punya staff aktif (non-deleted).
- Audit log tetap mencatat action DELETE.
- Known limitation: child records milik staff yang sudah dihapus tetap tampil (tidak difilter `staff.deletedAt`), nama Department soft-deleted tetap menempati unique constraint, dan belum ada restore/trash/permanent delete.

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
