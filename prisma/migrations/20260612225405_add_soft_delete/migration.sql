-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Availability" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "PerformanceNote" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN "deletedAt" DATETIME;
