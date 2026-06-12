# Test Plan — Project Fable

## Test Plan Purpose

Dokumen ini menjelaskan strategi testing Project Fable agar aplikasi tidak hanya bisa dibuat, tetapi juga lancar digunakan.

Fokus testing awal adalah memastikan fitur inti people management berjalan stabil.

## Testing Goals

Testing bertujuan untuk memastikan:

- CRUD staff berjalan benar.
- CRUD department berjalan benar.
- Task assignment berjalan benar.
- Attendance recording berjalan benar.
- Availability recording berjalan benar.
- Dashboard menampilkan data yang benar.
- Form validation bekerja.
- UI tidak rusak pada data kosong.
- Aplikasi dapat dijalankan lokal.

## Testing Levels

### Manual Testing

Manual testing digunakan pada awal MVP untuk memvalidasi user flow utama.

### Unit Testing

Unit testing digunakan untuk validation schema, utility functions, formatting functions, dan status helper functions.

### Integration Testing

Integration testing digunakan untuk service layer, database operations, dan CRUD workflows.

### Build Testing

Build testing digunakan untuk memastikan aplikasi bisa di-build tanpa error.

### Regression Testing

Regression testing dilakukan setelah perubahan fitur utama.

## Recommended Commands

Command umum:

```bash
npm run dev
npm run build
npm run lint
npm test
```

Dengan RTK:

```bash
rtk test npm run build
rtk test npm run lint
rtk test npm test
```

Jika harus dijalankan di WSL:

```bash
wsl bash -lc "cd /mnt/c/Users/user/Documents/'project fable' && npm run build"
wsl bash -lc "cd /mnt/c/Users/user/Documents/'project fable' && npm test"
```

## Manual Test Checklist

### App Startup

Steps:

1. Install dependencies.
2. Run development server.
3. Open app in browser.
4. Confirm dashboard loads.

Expected result:

- App loads without runtime error.
- Main navigation visible.
- Dashboard visible.

### Staff Management

Test cases:

- Add staff with valid data.
- Add staff with missing required name.
- Add staff with invalid email.
- Edit staff data.
- Change staff department.
- Change staff status.
- View staff detail.
- Filter staff by department.
- Filter staff by status.
- Search staff by name.

Expected result:

- Valid data saved.
- Invalid data rejected.
- Filters work.
- Detail page shows correct data.

### Department Management

Test cases:

- Add department.
- Edit department.
- View department detail.
- See staff in department.
- Create department with empty name.
- Create duplicate department if unique constraint exists.

### Task Management

Test cases:

- Create task.
- Assign task to staff.
- Assign task to department.
- Change task status.
- Change task priority.
- Set deadline.
- View overdue task.
- Filter task by status.
- Filter task by priority.
- Filter task by assignee.

### Attendance Management

Test cases:

- Create attendance record.
- Mark staff present.
- Mark staff absent.
- Mark staff excused.
- Mark staff sick.
- Mark staff late.
- View attendance history per staff.

### Availability Management

Test cases:

- Add availability for staff.
- Edit availability.
- View availability by staff.
- View availability by day.
- Add invalid time range.

### Dashboard

Test cases:

- Dashboard with no data.
- Dashboard with staff data.
- Dashboard with task data.
- Dashboard with attendance data.
- Dashboard with overdue tasks.

## Validation Testing

Validation rules:

- Staff name required.
- Staff email valid if provided.
- Department name required.
- Task title required.
- Task status valid.
- Task priority valid.
- Attendance staff required.
- Attendance status valid.
- Availability time range valid.

## Data Integrity Testing

Test cases:

- Delete or deactivate staff with existing tasks.
- Delete department with staff.
- Change staff department.
- Create task without assignee.
- Create task without department.
- Attendance linked to existing staff.

## UI Testing

Check:

- Sidebar navigation.
- Table readability.
- Button consistency.
- Form spacing.
- Empty states.
- Error messages.
- Mobile responsiveness.
- Loading states.

## Performance Testing

For MVP, test with seed data:

- 100 staff
- 10 departments
- 500 tasks
- 1.000 attendance records

Catatan: seed data ini adalah data praktis untuk testing lokal, bukan target kapasitas sistem. Target kapasitas yang lebih besar (500 staff, 50 department, 5.000 task, 10.000 attendance records) didefinisikan di SRS.md sebagai batas desain, dan tidak perlu di-seed penuh saat development.

Expected result:

- Pages remain usable.
- Search/filter still responsive.
- Dashboard loads reasonably fast.

## AI Agent Testing Workflow

Before AI agent changes:

```bash
rtk git status
```

After AI agent changes:

```bash
rtk git diff
```

Agent must summarize:

- Files changed
- Why changed
- Test command run
- Test result
- Remaining risk

## Definition of Ready for Testing

A feature is ready to test when:

- Implementation is complete.
- App runs locally.
- Data model exists.
- Form or UI flow exists.
- No obvious compile error.

## Definition of Done

A feature is done when:

- Manual test passes.
- Build or lint passes.
- Relevant docs updated.
- Diff reviewed.
- Commit created.
