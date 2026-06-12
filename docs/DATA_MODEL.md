# Data Model — Project Fable

## Purpose

Dokumen ini menjelaskan rancangan data model Project Fable. Data model digunakan sebagai acuan saat membuat database schema, Prisma model, service layer, dan UI.

## Entity Overview

Entity utama:

- User
- Staff
- Department
- Task
- Attendance
- Availability
- PerformanceNote

Entity tambahan yang dapat ditambahkan nanti:

- Organization
- Event
- RecruitmentCandidate
- EvaluationCycle
- FeedbackForm
- Notification
- AuditLog
- Attachment

## Department

Fields:

- id
- name
- description
- createdAt
- updatedAt

Relationships:

- Department has many Staff.
- Department has many Task.

Rules:

- Department name should be required.
- Department name should be unique if possible.
- Department should not be deleted if it still has active staff, unless reassignment is handled.

## Staff

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

Relationships:

- Staff belongs to Department.
- Staff has many Task.
- Staff has many Attendance.
- Staff has many Availability.
- Staff has many PerformanceNote.

Rules:

- Name is required.
- Email should be valid if provided.
- Status must use predefined enum.
- Staff can exist without department only if organization allows unassigned staff.
- Prefer deactivation over hard delete.

## Task

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

Relationships:

- Task may belong to Staff.
- Task may belong to Department.

Rules:

- Title is required.
- Status defaults to TODO.
- Priority defaults to MEDIUM.
- Task can be assigned to staff, department, or both.
- Overdue task is calculated when deadline is before current date and status is not DONE or CANCELLED.

## Attendance

Fields:

- id
- staffId
- eventName
- date
- status
- notes
- createdAt
- updatedAt

Relationships:

- Attendance belongs to Staff.

Rules:

- Staff is required.
- Date is required.
- Status must use predefined enum.
- Event name should be required for context.

## Availability

Fields:

- id
- staffId
- dayOfWeek
- startTime
- endTime
- notes
- createdAt
- updatedAt

Relationships:

- Availability belongs to Staff.

Rules:

- Staff is required.
- Day of week is required.
- Start time must be before end time.
- Overlapping availability should be handled later.

## PerformanceNote

Fields:

- id
- staffId
- category
- note
- createdAt
- updatedAt

Relationships:

- PerformanceNote belongs to Staff.

Possible categories:

- POSITIVE
- IMPROVEMENT
- WARNING
- GENERAL

## User

User merepresentasikan akun yang dapat login ke aplikasi. Untuk MVP awal, authentication dapat ditunda.

Fields:

- id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

Possible roles:

- ADMIN
- HUMAN_CAPITAL
- DIVISION_LEAD
- VIEWER

## Enum Definitions

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

### PerformanceNoteCategory

- POSITIVE
- IMPROVEMENT
- WARNING
- GENERAL

## Data Integrity Rules

- Deleting Department should be restricted if staff exists.
- Staff deletion should prefer status change.
- Task should not break if assignee is removed.
- Attendance must always reference a valid staff.
- Availability must always reference a valid staff.
- PerformanceNote must always reference a valid staff.

## Future Data Model Enhancements

Future entities:

- Organization
- Event
- RecruitmentCandidate
- EvaluationCycle
- FeedbackForm
- Notification
- AuditLog
- Attachment
