import { z } from "zod";

export const exportEntities = [
  "staff",
  "departments",
  "tasks",
  "attendance",
  "availability",
  "performance-notes",
] as const;

export const importEntities = ["departments", "staff", "tasks"] as const;

export type ExportEntity = (typeof exportEntities)[number];
export type ImportEntity = (typeof importEntities)[number];

export const exportEntitySchema = z.enum(exportEntities);
export const importEntitySchema = z.enum(importEntities);

export function isImportEntity(value: string): value is ImportEntity {
  return (importEntities as readonly string[]).includes(value);
}

export function isExportEntity(value: string): value is ExportEntity {
  return (exportEntities as readonly string[]).includes(value);
}
