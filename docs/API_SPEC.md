# API Specification — Project Fable

## Purpose

Dokumen ini adalah operation contract untuk Project Fable: daftar operasi, input, output, dan aturan validasi yang harus disediakan sistem.

Sesuai ADR-011, implementasi utama MVP menggunakan Next.js Server Actions dengan service layer (`lib/services/` dan `lib/validations/`). API Routes ditunda kecuali ada kebutuhan nyata. Notasi endpoint HTTP di dokumen ini menjelaskan operasi dan parameternya, bukan endpoint literal yang wajib dibuat.

Dokumen ini bersifat desain awal. Detail operasi dapat berubah saat implementasi.

## API Design Principles

- Keep API simple.
- Prefer predictable naming.
- Validate input on server.
- Return clear errors.
- Avoid over-engineering.
- Keep MVP focused.

## Response Format

Recommended success response:

```json
{
  "success": true,
  "data": {}
}
```

Recommended error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name is required"
  }
}
```

## Staff API

### Get Staff List

`GET /api/staff`

Query params:

- search
- departmentId
- status

### Get Staff Detail

`GET /api/staff/:id`

Response includes staff profile, department, tasks, attendance, availability, and performance notes.

### Create Staff

`POST /api/staff`

Body:

```json
{
  "name": "Fayyaz Akmal",
  "email": "fayyaz@example.com",
  "phone": "08123456789",
  "departmentId": "dept_001",
  "position": "HC Staff",
  "status": "ACTIVE",
  "batch": "2026",
  "notes": "Initial staff data"
}
```

Validation:

- name required
- email valid if provided
- status must be valid enum

### Update Staff

`PATCH /api/staff/:id`

### Delete or Deactivate Staff

`DELETE /api/staff/:id`

MVP recommendation: prefer changing status to INACTIVE or RESIGNED.

## Department API

### Get Department List

`GET /api/departments`

Response includes id, name, description, staffCount.

### Get Department Detail

`GET /api/departments/:id`

### Create Department

`POST /api/departments`

### Update Department

`PATCH /api/departments/:id`

### Delete Department

`DELETE /api/departments/:id`

Rule: blocked if active staff still exists in department.

## Task API

### Get Task List

`GET /api/tasks`

Query params:

- search
- status
- priority
- assignedToStaffId
- departmentId
- overdue

### Get Task Detail

`GET /api/tasks/:id`

### Create Task

`POST /api/tasks`

### Update Task

`PATCH /api/tasks/:id`

### Update Task Status

`PATCH /api/tasks/:id/status`

### Delete Task

`DELETE /api/tasks/:id`

## Attendance API

### Get Attendance List

`GET /api/attendance`

Query params:

- staffId
- status
- dateFrom
- dateTo
- eventName

### Create Attendance

`POST /api/attendance`

### Update Attendance

`PATCH /api/attendance/:id`

### Delete Attendance

`DELETE /api/attendance/:id`

## Availability API

### Get Availability List

`GET /api/availability`

Query params:

- staffId
- dayOfWeek

### Create Availability

`POST /api/availability`

### Update Availability

`PATCH /api/availability/:id`

### Delete Availability

`DELETE /api/availability/:id`

## Performance Notes API

### Get Performance Notes

`GET /api/performance-notes`

### Create Performance Note

`POST /api/performance-notes`

### Delete Performance Note

`DELETE /api/performance-notes/:id`

## Dashboard API

### Get Dashboard Summary

`GET /api/dashboard/summary`

Response includes:

- totalStaff
- activeStaff
- totalDepartments
- totalTasks
- openTasks
- overdueTasks
- attendanceThisMonth

## Error Codes

- VALIDATION_ERROR
- NOT_FOUND
- DUPLICATE_DATA
- RELATION_CONSTRAINT_ERROR
- INTERNAL_ERROR
- UNAUTHORIZED
- FORBIDDEN

## Implementation Note

Sesuai ADR-011, MVP menggunakan Server Actions, bukan API Routes. Keep equivalent operations in:

- `lib/services/`
- `lib/validations/`

The important part is clean separation between UI, validation, business logic, and database access.
