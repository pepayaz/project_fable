# UI/UX Specification — Project Fable

## Purpose

Dokumen ini menjelaskan rancangan UI/UX Project Fable. Fokus utama adalah membuat aplikasi yang mudah digunakan, rapi, dan cocok untuk workflow people management.

## UX Principles

- Simple first.
- Fast to understand.
- Minimal clicks for common tasks.
- Clear empty states.
- Clear error messages.
- Consistent layout.
- Useful dashboard.
- Friendly for non-technical users.

## Main Navigation

Sidebar navigation:

- Dashboard
- Staff
- Departments
- Tasks
- Attendance
- Availability
- Performance Notes
- Settings

For MVP, Settings can be placeholder.

## Layout

Recommended layout:

```text
+----------------------------------------------------+
| Header                                             |
+-------------------+--------------------------------+
| Sidebar           | Main Content                    |
|                   |                                |
| Dashboard         | Page title                      |
| Staff             | Filters / Actions               |
| Departments       | Table / Cards                   |
| Tasks             |                                |
| Attendance        |                                |
| Availability      |                                |
+-------------------+--------------------------------+
```

## Dashboard Page

Goal: memberi gambaran cepat tentang kondisi organisasi.

Components:

- Summary cards
- Task status summary
- Staff by department
- Recent tasks
- Attendance summary
- Overdue task alert

Summary cards:

- Total Staff
- Active Staff
- Departments
- Open Tasks
- Overdue Tasks
- Attendance This Month

Empty state:

```text
No data yet. Start by adding departments and staff.
```

## Staff Page

Goal: memudahkan Human Capital melihat, mencari, dan mengelola staff.

Components:

- Page title
- Add Staff button
- Search input
- Department filter
- Status filter
- Staff table

Staff table columns:

- Name
- Email
- Department
- Position
- Status
- Batch
- Actions

## Staff Detail Page

Sections:

- Profile summary
- Department and position
- Current tasks
- Attendance history
- Availability
- Performance notes

## Department Page

Components:

- Department list
- Add Department button
- Department card/table
- Staff count

Department detail sections:

- Department info
- Staff in department
- Department tasks
- Department workload summary

## Task Page

Components:

- Add Task button
- Search
- Status filter
- Priority filter
- Assignee filter
- Department filter
- Task table

Task table columns:

- Title
- Status
- Priority
- Assignee
- Department
- Deadline
- Actions

Visual indicators:

- Overdue task should be highlighted.
- Urgent priority should be visually clear.
- Done task should look completed.

## Attendance Page

Components:

- Add Attendance button
- Event filter
- Date filter
- Status filter
- Attendance table

## Availability Page

Components:

- Add Availability button
- Staff filter
- Day filter
- Availability table

## Performance Notes Page

Components:

- Add Note button
- Staff filter
- Category filter
- Notes list

## Forms

General form rules:

- Required fields must be clearly marked.
- Validation error shown near field.
- Submit button should be clear.
- Cancel action should be available.
- Avoid too many fields in one screen.

## Empty States

Every major page must handle empty data.

Good empty state includes:

- Short explanation.
- Suggested next action.
- Button to create data.

## Error States

Error messages should be clear and human-friendly.

Bad:

```text
Database error code P2002
```

Good:

```text
A department with this name already exists.
```

## Loading States

Use simple loading indicators:

- Skeleton for tables/cards.
- Loading text for forms.
- Disabled submit button during submission.

## Responsive Design

MVP should be usable on:

- Laptop
- Desktop
- Tablet width if possible

Mobile polish can be improved later.

## Design Style

Recommended visual style:

- Clean dashboard
- Neutral color palette
- Clear spacing
- Rounded cards
- Simple icons
- Minimal distractions

## Accessibility

Minimum accessibility:

- Buttons must have clear labels.
- Form inputs must have labels.
- Color should not be the only indicator.
- Text contrast must be readable.
- Keyboard navigation should not be broken.
