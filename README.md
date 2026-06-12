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

- Documentation foundation in progress
- App scaffold not started yet
- MVP planning completed through docs

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
- `docs/DESIGN.md`
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
- `docs/PROJECT_CHARTER.md`
- `docs/PRD.md`
- `docs/SRS.md`
- `docs/DESIGN.md`

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

Development setup will be added after the app scaffold is created.

Expected future commands:

```bash
npm install
npm run dev
npm run build
npm run lint
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
