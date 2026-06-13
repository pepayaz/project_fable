# Roadmap — Project Fable

## Roadmap Philosophy

Project Fable harus dibangun secara bertahap. Tujuan utama bukan membuat aplikasi besar sekaligus, tetapi membuat aplikasi yang benar-benar berjalan lancar, stabil, dan dapat digunakan.

Setiap milestone harus menghasilkan aplikasi yang tetap bisa dijalankan.

## MVP Definition

MVP didefinisikan sebagai Milestone 1 sampai Milestone 6.

MVP mencakup staff management, department management, task management, attendance, availability, dashboard, dan polish dasar. Performance notes termasuk dalam MVP sebagai fitur sekunder (P2). Authentication (Milestone 7), AI features (Milestone 8), dan deployment (Milestone 9) berada di luar MVP.

## Milestone 0 — Project Foundation

Goal: mempersiapkan repository agar siap dikembangkan secara profesional.

Deliverables:

- PROJECT_CHARTER.md
- PRD.md
- SRS.md
- DESIGN.md (design system UI/UX di root)
- ARCHITECTURE.md (arsitektur sistem)
- ROADMAP.md
- TEST_PLAN.md
- README.md
- AGENTS.md
- CLAUDE.md
- Git repository initialized
- RTK AI working
- Graphify planned

Acceptance criteria:

- Semua dokumen dasar tersedia.
- Agent workflow jelas.
- Repository dapat direview dengan Git.
- Project direction sudah jelas.

## Milestone 1 — App Scaffold

Goal: membuat fondasi aplikasi web.

Deliverables:

- Next.js app initialized
- TypeScript enabled
- Tailwind configured
- Basic layout
- Sidebar navigation
- Dashboard placeholder
- Prisma installed
- SQLite configured

Acceptance criteria:

- App dapat dijalankan lokal.
- Homepage/dashboard muncul.
- Struktur folder sesuai docs/ARCHITECTURE.md.
- No major runtime error.

## Milestone 2 — Staff and Department Management

Goal: membuat fitur inti people management.

Deliverables:

- Staff model
- Department model
- Staff list page
- Staff create form
- Staff detail page
- Staff edit feature
- Department list page
- Department create form
- Department detail page
- Filter staff by department and status

Acceptance criteria:

- User dapat CRUD staff.
- User dapat CRUD department.
- Staff dapat dihubungkan ke department.
- Data tersimpan di database.
- UI cukup nyaman digunakan.

## Milestone 3 — Task Management

Goal: membuat fitur assignment dan tracking pekerjaan.

Deliverables:

- Task model
- Task list page
- Task create form
- Task detail page
- Task status update
- Assign task to staff
- Assign task to department
- Filter by status, priority, assignee, department
- Overdue task indicator

Acceptance criteria:

- User dapat membuat dan mengelola task.
- Task dapat ditugaskan ke staff atau department.
- Status task dapat diubah.
- Dashboard dapat menampilkan ringkasan task.

## Milestone 4 — Attendance and Availability

Goal: membuat fitur monitoring kehadiran dan ketersediaan staff.

Deliverables:

- Attendance model
- Attendance page
- Attendance create form
- Attendance history per staff
- Availability model
- Availability page
- Availability create form
- Staff availability summary
- PerformanceNote model (P2, fitur sekunder)
- Performance notes page (P2)
- Performance note create form (P2)

Acceptance criteria:

- User dapat mencatat attendance.
- User dapat melihat attendance history.
- User dapat mencatat availability.
- User dapat melihat availability staff.
- User dapat menambah dan melihat performance notes (P2, boleh digeser ke Milestone 5 jika perlu).

## Milestone 5 — Dashboard and Reporting

Goal: membuat aplikasi lebih useful untuk decision making.

Deliverables:

- Dashboard real data
- Staff count summary
- Department summary
- Task status summary
- Attendance summary
- Overdue task summary
- Staff workload summary

Acceptance criteria:

- Dashboard mengambil data dari database.
- Dashboard tetap aman ketika data kosong.
- Summary membantu user memahami kondisi organisasi.

## Milestone 6 — Polish and Stability

Goal: membuat aplikasi terasa lancar dan layak digunakan.

Deliverables:

- Better loading states
- Empty states
- Error states
- Form validation
- Responsive UI
- Consistent styling
- Seed data
- README improvement
- Manual QA checklist completed

## Milestone 7 — Authentication and Basic Roles

Goal: menambahkan kontrol akses dasar.

Deliverables:

- Login page
- User model
- Session management
- Admin role
- Human Capital role
- Optional division lead role

Lanjutan (sudah dikerjakan): coarse RBAC, security hardening baseline, dan Member Self-Service Portal (`/my`) melalui relasi optional `User.linkedStaffId` ke `Staff` (lihat ADR-018).

## Milestone 8 — AI-Assisted Features

Goal: menambahkan fitur AI yang relevan dan tidak gimmick.

Fondasi non-AI sudah disiapkan: People Intelligence Center (`/insights`) dan Staff Quick Insights menghasilkan struktur rule-based (signals, reasons, workload, weekly ops) yang akan menjadi input untuk AI Weekly Brief. Sprint-sprint terakhir belum memakai AI sama sekali.

Possible deliverables:

- AI Weekly Brief dari struktur People Intelligence (rule-based input → ringkasan natural language).
- Generate staff performance summary.
- Generate follow-up message.
- Recommend staff for task based on availability and workload.
- Detect overloaded staff.
- Summarize department condition.

## Milestone 9 — Deployment

Goal: membuat project dapat diakses publik untuk portfolio.

Deliverables:

- PostgreSQL migration if needed
- Vercel deployment
- Environment variables
- Production README
- Demo data
- Portfolio description

## Priority Order

1. Documentation foundation
2. App scaffold
3. Staff and department CRUD
4. Task assignment
5. Attendance and availability
6. Dashboard
7. Polish
8. Auth
9. AI features
10. Deployment

## Definition of Done

Sebuah milestone dianggap selesai jika:

- Fitur berjalan lokal.
- Tidak ada error utama.
- UI dapat digunakan.
- Data tersimpan benar.
- Dokumentasi diperbarui jika perlu.
- `rtk git diff` sudah direview.
- Commit dibuat dengan pesan yang jelas.
