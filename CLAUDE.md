# CLAUDE.md — Claude Code Instructions for Project Fable

You are working on Project Fable, a people management application for organizations, committees, communities, and student teams.

Follow all rules in `AGENTS.md`.

## Primary Objective

Help build Project Fable as a clean, realistic, portfolio-quality application.

The project should start small and grow in milestones.

Do not over-engineer.

## Required Reading Order

Before starting major implementation work, read documents in this order:

1. `docs/PROJECT_CHARTER.md`
2. `docs/PRD.md`
3. `docs/SRS.md`
4. `docs/ARCHITECTURE.md`
5. `docs/ROADMAP.md`
6. `docs/TEST_PLAN.md`
7. `AGENTS.md`

Untuk pekerjaan UI, baca juga `DESIGN.md` di root (design system UI/UX).

If some documents do not exist yet, help create them before implementing major features.

## Token Efficiency

Use RTK for terminal commands:

```bash
rtk git status
rtk git diff
rtk find .
rtk grep "keyword" .
rtk test <command>
```

If Graphify output exists, inspect:

```text
graphify-out/GRAPH_REPORT.md
```

Do not scan the whole repository.

## Planning Before Coding

Before editing files, provide:

1. Current understanding of the task.
2. Candidate files to inspect.
3. Minimal implementation plan.
4. Expected files to change.
5. Risks or assumptions.

Wait for user approval unless the user explicitly requests immediate implementation.

## Project Direction

The MVP is defined as Milestone 1 through Milestone 6 in `docs/ROADMAP.md`.

The MVP should focus on:

- Staff CRUD
- Department/division CRUD
- Assigning staff to departments
- Task assignment
- Simple attendance tracking
- Availability tracking
- Simple performance notes (secondary, P2)
- Basic dashboard

Avoid the following until later milestones:

- Payroll
- Legal contracts
- Enterprise HRIS features
- Complex permission systems
- Complex AI analytics
- Multi-tenant architecture

## Coding Style

- Use simple, readable code.
- Do not add unnecessary comments.
- Keep components small.
- Keep business logic clear.
- Avoid premature abstraction.
- Prefer explicit names over clever shortcuts.

## After Coding

After making changes:

1. Run the relevant test/build/lint command.
2. Run:

```bash
rtk git diff
```

3. Summarize what changed, why, how it was tested, and what remains to do.


## UI Design Rule

For any UI implementation task, read `DESIGN.md` (root, design system UI/UX) first. System architecture lives in `docs/ARCHITECTURE.md`.

Before coding a UI page, briefly explain how the planned UI follows the design system.