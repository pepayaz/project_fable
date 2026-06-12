# DESIGN.md — Project Fable Design System

Dokumen ini adalah design system UI/UX (warna, typography, komponen, page patterns). Untuk arsitektur sistem dan data model, lihat `docs/ARCHITECTURE.md`.

## 1. Design Direction

Project Fable is a people management application for student organizations, committees, communities, and small teams.

The interface should feel:

- calm
- structured
- trustworthy
- people-focused
- modern
- operational
- readable
- professional without feeling corporate-heavy

Avoid generic AI-looking dashboards, excessive gradients, glassmorphism, neon colors, and overly flashy visual effects.

The product should feel like a practical people operations workspace, not a decorative landing page.

## 2. Visual Personality

Project Fable should combine:

- the clarity of a modern SaaS dashboard
- the warmth of a people-centered workspace
- the structure of an operations tool
- the calmness of a productivity app

Reference vibe:

- Linear-like clarity
- Notion-like simplicity
- modern HR dashboard
- warm operational workspace

Do not copy any specific brand directly.

## 3. Color System

### Primary

Use indigo as the primary action color.

```css
--color-primary: #4F46E5;
--color-primary-hover: #4338CA;
--color-primary-soft: #EEF2FF;
--color-primary-border: #C7D2FE;
```

### Background

Use warm off-white backgrounds instead of pure white.

```css
--color-background: #FAF9F6;
--color-surface: #FFFFFF;
--color-surface-muted: #F4F3EF;
--color-sidebar: #F7F5EF;
```

### Text

```css
--color-text-primary: #1F2937;
--color-text-secondary: #4B5563;
--color-text-muted: #6B7280;
--color-text-subtle: #9CA3AF;
```

### Border

```css
--color-border: #E5E7EB;
--color-border-strong: #D1D5DB;
```

### Status Colors

Use restrained status colors. Do not make the UI look noisy.

```css
--color-success: #16A34A;
--color-success-soft: #DCFCE7;

--color-warning: #D97706;
--color-warning-soft: #FEF3C7;

--color-danger: #DC2626;
--color-danger-soft: #FEE2E2;

--color-info: #2563EB;
--color-info-soft: #DBEAFE;
```

## 4. Typography

Recommended fonts:

- Inter
- Geist Sans
- system-ui fallback

Typography should prioritize readability.

### Font Scale

```css
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
```

### Rules

- Page titles should be clear and concise.
- Avoid oversized marketing-style headings inside the app.
- Tables and forms should use readable text sizes.
- Use muted text for metadata and secondary information.

## 5. Spacing

Use consistent spacing.

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
```

Rules:

- Use generous spacing for dashboards.
- Use compact spacing for tables.
- Keep forms comfortable but not too loose.
- Avoid cramming too many cards into one view.

## 6. Radius and Shadows

Use soft but not childish corners.

```css
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-xl: 1rem;
```

Cards:

- Use `radius-lg` or `radius-xl`.
- Use subtle border.
- Use very soft shadow only when needed.

```css
--shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-popover: 0 8px 24px rgba(15, 23, 42, 0.08);
```

Avoid heavy shadows.

## 7. Layout

The app should use a dashboard layout.

Required structure:

- left sidebar navigation
- top header
- main content area
- responsive content width
- clear page header
- action area near page title

Main navigation:

- Dashboard
- Staff
- Departments
- Tasks
- Attendance
- Availability
- Performance Notes
- Settings

## 8. Components

### Buttons

Primary button:

- indigo background
- white text
- medium radius
- clear hover state

Secondary button:

- white or muted surface
- border
- dark text

Danger button:

- red tone
- use sparingly

Rules:

- Button labels must be specific.
- Avoid vague labels like "Submit" when possible.
- Prefer "Add Staff", "Create Task", "Save Changes".

### Cards

Cards should be simple and informative.

Use cards for:

- dashboard metrics
- summaries
- staff profile blocks
- task summaries
- empty states

Card rules:

- subtle border
- warm white surface
- clear title
- optional muted description
- no unnecessary decoration

### Tables

Tables are central to the product.

Table rules:

- readable row height
- clear column labels
- sticky or clear header if needed
- status badges
- action column on the right
- hover state for rows
- empty state when no data exists

Avoid overly decorative tables.

### Forms

Forms should be calm and easy to scan.

Form rules:

- label above input
- required field indicator
- inline validation message
- clear submit and cancel actions
- group related fields

### Badges

Use badges for:

- staff status
- task status
- priority
- attendance status

Badge style:

- soft background
- readable text
- restrained colors
- not too saturated

Examples:

- Active: green soft
- Probation: amber soft
- Resigned: gray soft
- Overdue: red soft
- In Progress: blue soft

## 9. Page Patterns

### Dashboard

Dashboard should include:

- total staff card
- active staff card
- open tasks card
- overdue tasks card
- staff by department section
- task workload section
- recent attendance section
- quick actions

Dashboard should help the user understand the organization condition quickly.

### Staff Page

Staff page should include:

- page title
- add staff button
- search input
- department filter
- status filter
- staff table
- empty state

### Staff Detail Page

Staff detail should include:

- profile summary
- department and position
- status
- task history
- attendance history
- availability
- performance notes

### Task Page

Task page should include:

- search
- status filter
- priority filter
- assignee filter
- task table
- overdue indicator
- create task button

### Attendance Page

Attendance page should include:

- event/date filter
- staff filter
- status filter
- attendance table
- add attendance button

### Availability Page

Availability page should include:

- staff filter
- day filter
- availability table
- add availability button

## 10. Empty States

Every major page must have an empty state.

Good empty state includes:

- short message
- explanation
- suggested action

Example:

"No staff yet. Add your first staff member to start organizing your team."

Action:

"Add Staff"

## 11. Error States

Errors should be human-readable.

Bad:

"Prisma error P2002"

Good:

"A department with this name already exists."

Rules:

- show error near the relevant field when possible
- do not expose technical stack traces
- keep tone calm and helpful

## 12. Loading States

Use:

- skeleton rows for tables
- subtle loading indicator for forms
- disabled submit button while saving

Avoid dramatic loading animations.

## 13. Accessibility

Minimum requirements:

- labels for all form inputs
- visible focus states
- readable color contrast
- buttons must have clear text
- color must not be the only status indicator
- tables must have clear headers

## 14. Do

Do:

- keep UI calm and readable
- use consistent spacing
- prioritize table usability
- use status badges consistently
- make dashboard metrics useful
- keep forms simple
- provide empty states
- make actions clear

## 15. Do Not

Do not:

- create generic purple gradient AI dashboards
- use excessive glassmorphism
- add random decorative blobs
- overuse shadows
- invent new colors without approval
- make every card huge
- hide important actions
- create overly complex navigation
- copy a brand exactly

## 16. Implementation Guidance for AI Agents

Before implementing UI, read this file.

When creating a page:

1. identify the page purpose
2. choose the correct page pattern
3. use existing design tokens
4. keep components consistent
5. avoid introducing new visual styles
6. explain how the UI follows this design system

If a design decision is ambiguous, prefer clarity, usability, and consistency.
