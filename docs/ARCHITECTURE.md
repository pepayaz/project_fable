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
Server Actions / API Routes
    |
Service Layer
    |
Prisma ORM
    |
SQLite Database
```

Untuk MVP, monolith Next.js sudah cukup. Tidak perlu memisahkan backend dan frontend ke repository berbeda.

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
- Authentication.
- Role-based access control.
- Deployment to Vercel.
- CSV import/export.
- AI summary.
- Notification/reminder system.
- Multi-organization support.
