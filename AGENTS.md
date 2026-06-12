# AGENTS.md — Project Fable

This file defines the working rules for AI coding agents such as Claude Code, Codex CLI, Gemini CLI, and Antigravity CLI.

## Project Context

Project Fable is a people management application for organizations, committees, communities, and student teams.

The application focuses on:

- Staff management
- Department/division management
- Role and status tracking
- Task assignment
- Attendance tracking
- Availability tracking
- Simple performance notes
- Dashboard and reporting

This is a portfolio project based on real Human Capital / People Management workflows.

## Token-Efficient Workflow

Always use a token-efficient workflow.

Do not read the entire repository.

Before reading many files:

1. Inspect the project structure with:

```bash
rtk find .
```

2. If Graphify output exists, read:

```text
graphify-out/GRAPH_REPORT.md
```

3. Identify the 5–7 most relevant candidate files.
4. Explain why those files are relevant.
5. Read only the necessary files.

## Terminal Commands

Use RTK whenever possible for terminal output:

```bash
rtk git status
rtk git diff
rtk git log
rtk find .
rtk grep "keyword" .
rtk test <command>
```

Avoid raw commands that produce large output.

## WSL Rule

Some projects may need to run inside WSL.

If build, test, or runtime commands require Linux, use:

```bash
wsl bash -lc "cd /mnt/c/Users/user/Documents/'project fable' && <command>"
```

Do not run Linux-only commands directly in PowerShell.

## Before Editing

Before editing files:

1. Explain the problem or task understanding.
2. Identify candidate files.
3. Propose a minimal implementation plan.
4. Wait for approval if the user has not explicitly granted permission.

## Code Change Rules

When editing code:

- Make minimal scoped changes.
- Do not add unnecessary comments.
- Follow the existing code style.
- Avoid unrelated refactors.
- Avoid changing public behavior unless required.
- Keep file structure simple.
- Prefer clarity over cleverness.

## Documentation Rules

When adding or changing features, update relevant documentation if needed.

## Testing Rules

After implementation:

1. Run the most relevant test command.
2. If no test exists, run the build or lint command.
3. Use RTK for test output.
4. Summarize what was tested.

## Git Rules

Before changes:

```bash
rtk git status
```

After changes:

```bash
rtk git diff
```

Summarize:

- Files changed
- Why each file changed
- Test result
- Any remaining risks

## AI Behavior Rules

The agent must not:

- Read the entire repository without reason.
- Modify unrelated files.
- Add unnecessary comments.
- Invent requirements not present in docs.
- Over-engineer the MVP.
- Add enterprise HR features before the MVP is stable.

The agent should:

- Ask for clarification when requirements are ambiguous.
- Prefer small incremental changes.
- Keep the MVP realistic.
- Use the project documents as the source of truth.


## Design System

Before creating or modifying UI, read `DESIGN.md`.

All UI work must follow the design system defined in `DESIGN.md`, including:

- colors
- typography
- spacing
- radius
- shadows
- layout patterns
- buttons
- forms
- tables
- cards
- badges
- empty states
- error states

Do not create generic AI-looking UI.
Do not introduce new colors or component styles unless explicitly approved.