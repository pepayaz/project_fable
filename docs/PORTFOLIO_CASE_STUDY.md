# Portfolio Case Study: Project Fable

## Problem Statement
Managing people, departments, tasks, and attendance often involves disjointed tools or bloated enterprise software that is too complex for small organizations, committees, student teams, and communities. These groups need a simple, centralized platform to track staff availability, manage tasks, and monitor organizational health without the overhead of enterprise HR systems.

## Target Users
- Organizations, committees, and communities.
- Student teams and university clubs.
- Small to medium-sized business human capital teams looking for a streamlined management tool.

## Product Scope
Project Fable is an MVP-focused people management application that provides:
- **Staff and Department Management:** CRUD operations for staff members and organizational structures.
- **Task Management:** Assigning and tracking tasks across staff and departments.
- **Attendance and Availability:** Tracking when staff are present or available.
- **Reporting and Dashboard:** Summarized insights for decision-making.
- **User Roles:** Coarse RBAC (Admin, Human Capital, Staff/Member Self-Service).

## Architecture Decisions
- **Tech Stack:** Next.js with App Router, React, Tailwind CSS, TypeScript.
- **Database:** SQLite (primary development/MVP), managed by Prisma ORM. Currently SQLite-first.
- **UI System:** Bespoke design system based on standard UX patterns without relying on heavily opinionated component libraries.

## Security Decisions
- **Authentication:** Custom session management with bcrypt password hashing and secure cookies.
- **Role-Based Access Control (RBAC):** Coarse-grained roles to restrict admin and human capital functions.
- **Hardening:** Environment validation, production seed safety, session cleanup, in-memory login limiter, protected-route proxy checks, and Content Security Policy (CSP) baselines.

## AI Governance Decisions
- **Opt-in Features:** AI features are strictly opt-in, disabled gracefully if API keys are absent.
- **Provider-Agnostic:** Designed to work with multiple LLM providers, defaulting to Google Gemini via unified abstraction.
- **Read/Draft Only:** AI functions strictly as a writing assistant or for summarizing data (e.g., Staff AI Brief, Draft follow-ups). It does not auto-save, auto-send, or make final HR decisions. Output is transient and not persisted to the database.

## Highlights
- **Data Recovery:** Soft-delete mechanisms with an Admin-only `/trash` portal for restoring records, coupled with detailed audit logging.
- **Import/Export:** Robust CSV import/export system with template generation and preview-confirm workflows, enabling bulk operations without direct DB access.
- **User Management:** Admin-only user management interface to create, manage, and assign roles to system users, including linking user accounts to staff profiles for self-service.

## Tradeoffs and Limitations
- **SQLite First:** The application is currently SQLite-first, which is highly portable but unsuitable for serverless deployments on platforms like Vercel or Netlify due to ephemeral file systems losing data on write.
- **Authentication:** Custom authentication instead of NextAuth/Auth.js keeps the system self-contained but may lack some out-of-the-box OAuth integrations.
- **Coarse RBAC:** Current permissions are broad (Admin vs HC vs User). Finer-grained permissions might be needed for larger teams.

## Future Roadmap
- **Deployment & PostgreSQL Migration:** Actual transition to a persistent PostgreSQL database for production serverless deployments.
- **Enhanced AI Features:** Expanded prompt templates, and exploring local LLM integrations.
- **Advanced Permissions:** Granular role definitions and department-level access scoping.
