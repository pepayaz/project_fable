# Project Fable

Project Fable adalah aplikasi people management ringan untuk organisasi, kepanitiaan, komunitas, dan tim kampus. Aplikasi ini membantu pengelola tim mencatat staff, department, task, attendance, availability, performance notes, dan ringkasan dashboard dalam satu workspace sederhana.

Project ini dibuat sebagai portfolio project berbasis workflow Human Capital / People Management non-enterprise.

## MVP Features

Fitur MVP yang tersedia saat ini:

- Dashboard summary dari data nyata
- Staff CRUD
- Department CRUD
- Staff assignment ke department
- Task CRUD
- Task assignment ke staff dan department
- Attendance CRUD
- Availability CRUD
- Performance Notes CRUD
- Seed data demo untuk staff dan department

Belum termasuk MVP saat ini:

- Authentication
- User model
- Role-based access control
- Dashboard chart library
- Export/import
- Deployment production

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite
- Zod
- Server Actions
- npm

## Requirements

- Node.js 20 atau lebih baru
- npm

## Install

```bash
npm install
```

## Environment Setup

Copy file environment example:

```bash
cp .env.example .env
```

Untuk Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Default database lokal:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration lokal:

```bash
npx prisma migrate dev
```

Seed data demo:

```bash
npx prisma db seed
```

Seed saat ini menambahkan department dan staff demo. Data lain dapat dibuat lewat UI.

## Development

Jalankan dev server:

```bash
npm run dev
```

App berjalan di:

```text
http://localhost:3000
```

## Quality Checks

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Feature Status

| Area | Status |
| --- | --- |
| Documentation foundation | Done |
| App scaffold | Done |
| Staff management | Done |
| Department management | Done |
| Task management | Done |
| Attendance tracking | Done |
| Availability tracking | Done |
| Performance notes | Done |
| Dashboard summary | Done |
| Polish and demo readiness | In progress |
| Authentication/User/Roles | Not included yet |
| Deployment | Not included yet |

## Project Documents

- `AGENTS.md`
- `CLAUDE.md`
- `DESIGN.md`
- `docs/ARCHITECTURE.md`
- `docs/DATA_MODEL.md`
- `docs/ROADMAP.md`
- `docs/ADR.md`

## Agent Workflow

This project is designed to work with AI coding agents. Agents should follow `AGENTS.md`, use RTK for terminal output where possible, and inspect `graphify-out/GRAPH_REPORT.md` if available before reading many files.

Recommended commands:

```bash
rtk git status
rtk find .
rtk git diff
rtk test npm run lint
rtk test npm run build
```

## Scope Notes

Project Fable intentionally avoids enterprise HRIS features in the MVP. Payroll, legal contracts, complex permissions, AI analytics, multi-tenancy, and authentication are deferred until the core workflow is stable.
