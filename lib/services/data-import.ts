import { parseCsv } from "@/lib/csv";
import { db } from "@/lib/db";
import { ServiceError } from "@/lib/services/errors";
import type { ImportEntity } from "@/lib/validations/data-tools";
import { departmentInputSchema } from "@/lib/validations/department";
import { staffInputSchema } from "@/lib/validations/staff";
import { taskInputSchema } from "@/lib/validations/task";

export type ImportRowReport = {
  rowNumber: number;
  values: Record<string, string>;
  errors: string[];
};

export type ImportPreviewReport = {
  entity: ImportEntity;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ImportRowReport[];
};

type PreparedImport = {
  preview: ImportPreviewReport;
  records: unknown[];
};

function missingHeaders(headers: string[], required: string[]) {
  const set = new Set(headers);
  return required.filter((header) => !set.has(header));
}

function addZodErrors(errors: string[], issues: { message: string }[]) {
  for (const issue of issues) {
    errors.push(issue.message);
  }
}

function parseDeadline(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date;
}

async function activeDepartmentMap() {
  const departments = await db.department.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });
  return new Map(departments.map((department) => [department.name.toLowerCase(), department]));
}

async function activeStaffIndexes() {
  const staff = await db.staff.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, email: true },
  });
  const byEmail = new Map<string, (typeof staff)[number]>();
  const byName = new Map<string, (typeof staff)[number][]>();

  for (const member of staff) {
    if (member.email) {
      byEmail.set(member.email.toLowerCase(), member);
    }
    const key = member.name.toLowerCase();
    byName.set(key, [...(byName.get(key) ?? []), member]);
  }

  return { byEmail, byName };
}

async function prepareDepartments(headers: string[], rows: Record<string, string>[]) {
  const required = ["name"];
  const headerErrors = missingHeaders(headers, required);
  const existing = new Set(
    (
      await db.department.findMany({
        where: { deletedAt: null },
        select: { name: true },
      })
    ).map((department) => department.name.toLowerCase()),
  );
  const seen = new Set<string>();
  const records: unknown[] = [];

  const reports = rows.map((row, index) => {
    const errors = [...headerErrors.map((header) => `Missing required header: ${header}.`)];
    const key = row.name?.toLowerCase();
    if (key) {
      if (seen.has(key)) errors.push("Duplicate department name in CSV.");
      if (existing.has(key)) errors.push("Duplicate existing department name.");
      seen.add(key);
    }

    const parsed = departmentInputSchema.safeParse({
      name: row.name,
      description: row.description,
    });
    if (!parsed.success) {
      addZodErrors(errors, parsed.error.issues);
    } else if (errors.length === 0) {
      records.push(parsed.data);
    }

    return { rowNumber: index + 2, values: row, errors };
  });

  return buildPrepared("departments", reports, records);
}

async function prepareStaff(headers: string[], rows: Record<string, string>[]) {
  const required = ["name", "status"];
  const headerErrors = missingHeaders(headers, required);
  const departments = await activeDepartmentMap();
  const existingEmails = new Set(
    (
      await db.staff.findMany({
        where: { deletedAt: null, email: { not: null } },
        select: { email: true },
      })
    )
      .map((staff) => staff.email?.toLowerCase())
      .filter(Boolean) as string[],
  );
  const seenEmails = new Set<string>();
  const records: unknown[] = [];

  const reports = rows.map((row, index) => {
    const errors = [...headerErrors.map((header) => `Missing required header: ${header}.`)];
    const email = row.email?.toLowerCase();
    if (email) {
      if (seenEmails.has(email)) errors.push("Duplicate staff email in CSV.");
      if (existingEmails.has(email)) errors.push("Duplicate existing staff email.");
      seenEmails.add(email);
    }

    const departmentName = row.departmentName;
    const department = departmentName ? departments.get(departmentName.toLowerCase()) : null;
    if (departmentName && !department) {
      errors.push("Unknown department.");
    }

    const parsed = staffInputSchema.safeParse({
      name: row.name,
      email: row.email,
      phone: row.phone,
      position: row.position,
      status: row.status,
      batch: row.batch,
      notes: row.notes,
      departmentId: department?.id ?? "",
    });
    if (!parsed.success) {
      addZodErrors(errors, parsed.error.issues);
    } else if (errors.length === 0) {
      records.push(parsed.data);
    }

    return { rowNumber: index + 2, values: row, errors };
  });

  return buildPrepared("staff", reports, records);
}

async function resolveStaff(
  row: Record<string, string>,
  indexes: Awaited<ReturnType<typeof activeStaffIndexes>>,
  errors: string[],
) {
  if (row.assignedStaffEmail) {
    const staff = indexes.byEmail.get(row.assignedStaffEmail.toLowerCase());
    if (!staff) errors.push("Unknown staff email.");
    return staff?.id ?? "";
  }

  if (row.assignedStaffName) {
    const matches = indexes.byName.get(row.assignedStaffName.toLowerCase()) ?? [];
    if (matches.length === 0) errors.push("Unknown staff name.");
    if (matches.length > 1) errors.push("Ambiguous staff name. Use assignedStaffEmail.");
    return matches.length === 1 ? matches[0].id : "";
  }

  return "";
}

async function prepareTasks(headers: string[], rows: Record<string, string>[]) {
  const required = ["title", "status", "priority"];
  const headerErrors = missingHeaders(headers, required);
  const departments = await activeDepartmentMap();
  const staffIndexes = await activeStaffIndexes();
  const seen = new Set<string>();
  const records: unknown[] = [];

  const reports = await Promise.all(
    rows.map(async (row, index) => {
      const errors = [...headerErrors.map((header) => `Missing required header: ${header}.`)];
      const key = `${row.title?.toLowerCase()}|${row.deadline}|${row.assignedStaffEmail}|${row.assignedStaffName}`;
      if (seen.has(key)) errors.push("Duplicate task row in CSV.");
      seen.add(key);

      const departmentName = row.departmentName;
      const department = departmentName ? departments.get(departmentName.toLowerCase()) : null;
      if (departmentName && !department) {
        errors.push("Unknown department.");
      }
      const assignedToStaffId = await resolveStaff(row, staffIndexes, errors);
      const parsed = taskInputSchema.safeParse({
        title: row.title,
        description: row.description,
        status: row.status,
        priority: row.priority,
        deadline: parseDeadline(row.deadline),
        assignedToStaffId,
        departmentId: department?.id ?? "",
      });
      if (!parsed.success) {
        addZodErrors(errors, parsed.error.issues);
      } else if (errors.length === 0) {
        records.push(parsed.data);
      }

      return { rowNumber: index + 2, values: row, errors };
    }),
  );

  return buildPrepared("tasks", reports, records);
}

function buildPrepared(entity: ImportEntity, rows: ImportRowReport[], records: unknown[]): PreparedImport {
  const invalidRows = rows.filter((row) => row.errors.length > 0).length;
  return {
    preview: {
      entity,
      totalRows: rows.length,
      validRows: rows.length - invalidRows,
      invalidRows,
      rows,
    },
    records,
  };
}

export async function previewImport(entity: ImportEntity, csvText: string) {
  const parsed = parseCsv(csvText);

  switch (entity) {
    case "departments":
      return (await prepareDepartments(parsed.headers, parsed.rows)).preview;
    case "staff":
      return (await prepareStaff(parsed.headers, parsed.rows)).preview;
    case "tasks":
      return (await prepareTasks(parsed.headers, parsed.rows)).preview;
  }
}

export async function confirmImport(entity: ImportEntity, csvText: string) {
  const parsed = parseCsv(csvText);
  const prepared =
    entity === "departments"
      ? await prepareDepartments(parsed.headers, parsed.rows)
      : entity === "staff"
        ? await prepareStaff(parsed.headers, parsed.rows)
        : await prepareTasks(parsed.headers, parsed.rows);

  if (prepared.preview.invalidRows > 0) {
    throw new ServiceError("Import has validation errors. Preview and fix the CSV before importing.");
  }

  await db.$transaction(async (tx) => {
    for (const record of prepared.records) {
      if (entity === "departments") await tx.department.create({ data: departmentInputSchema.parse(record) });
      if (entity === "staff") await tx.staff.create({ data: staffInputSchema.parse(record) });
      if (entity === "tasks") await tx.task.create({ data: taskInputSchema.parse(record) });
    }
  });

  return prepared.records.length;
}
