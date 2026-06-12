# Project Fable

Project Fable adalah aplikasi people management untuk organisasi, kepanitiaan, komunitas, dan tim mahasiswa.

Aplikasi ini membantu pengelola Human Capital, HR, People Management, kepala divisi, dan project lead untuk mengelola:

- Staff
- Divisi/departemen
- Role dan status staff
- Task assignment
- Attendance
- Availability
- Performance notes
- Dashboard people management

Project ini dibuat sebagai project mandiri dan portfolio project berbasis pengalaman nyata dalam aktivitas human capital dan people management.

## Project Status

Current status:

- Documentation foundation completed (Milestone 0)
- App scaffold completed (Milestone 1): Next.js + TypeScript + Tailwind + Prisma + SQLite
- Next: Staff and department management (Milestone 2)

## Vision

Project Fable bertujuan menjadi aplikasi people management yang ringan, rapi, dan praktis untuk organisasi non-enterprise.

Aplikasi ini tidak berusaha menjadi HRIS enterprise penuh pada tahap awal. Fokus awal adalah membuat sistem yang benar-benar dapat digunakan untuk mengelola orang dan task dalam organisasi kecil sampai menengah.

## MVP Features

MVP awal akan mencakup:

- Staff management
- Department management
- Staff role and status tracking
- Task assignment
- Attendance tracking
- Availability tracking
- Basic dashboard
- Search and filter

## Planned Tech Stack

Recommended stack:

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- SQLite for MVP
- PostgreSQL for future deployment
- Git
- RTK AI
- Graphify

## Documentation

Project documentation:

- `docs/PROJECT_CHARTER.md`
- `docs/PRD.md`
- `docs/SRS.md`
- `docs/ARCHITECTURE.md` (arsitektur sistem)
- `DESIGN.md` (design system UI/UX, di root)
- `docs/ROADMAP.md`
- `docs/TEST_PLAN.md`
- `docs/USER_STORIES.md`
- `docs/DATA_MODEL.md`
- `docs/API_SPEC.md`
- `docs/UI_UX.md`
- `docs/BACKLOG.md`
- `docs/RISK_REGISTER.md`
- `docs/ADR.md`
- `AGENTS.md`
- `CLAUDE.md`

## AI Agent Workflow

This project is designed to work with AI coding agents such as:

- Claude Code CLI
- Codex CLI
- Gemini CLI
- Antigravity CLI

Agents must follow:

- `AGENTS.md`
- `CLAUDE.md`
- `DESIGN.md`
- `docs/PROJECT_CHARTER.md`
- `docs/PRD.md`
- `docs/SRS.md`
- `docs/ARCHITECTURE.md`

Recommended agent workflow:

```bash
rtk git status
rtk find .
rtk grep "keyword" .
rtk git diff
rtk test <command>
```

If Graphify output exists, agents should inspect:

```text
graphify-out/GRAPH_REPORT.md
```

before reading many files.

## Local Development

Requirements:

- Node.js 20 or newer
- npm

Setup:

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

The app runs at `http://localhost:3000` and uses a local SQLite database at `prisma/dev.db`.

Other commands:

```bash
npm run build
npm run lint
npx prisma studio
```

On Windows PowerShell, replace `cp .env.example .env` with:

```powershell
Copy-Item .env.example .env
```

If the project needs to run in WSL from Windows PowerShell:

```bash
wsl bash -lc "cd /mnt/c/Users/user/Documents/'project fable' && npm install"
wsl bash -lc "cd /mnt/c/Users/user/Documents/'project fable' && npm run dev"
```

## Roadmap Summary

1. Documentation foundation
2. App scaffold
3. Staff and department management
4. Task management
5. Attendance and availability
6. Dashboard and reporting
7. Polish and stability
8. Authentication and basic roles
9. AI-assisted features
10. Deployment

See `docs/ROADMAP.md` for detailed roadmap.

## Project Principles

- Build small but real.
- Avoid over-engineering.
- Prioritize usable workflow.
- Keep code readable.
- Keep documentation updated.
- Use Git frequently.
- Use RTK for terminal output.
- Use Graphify when the codebase grows.
- Let AI agents assist, but keep human control over product decisions.

## License

License will be decided later.
