import { ServiceError } from "@/lib/services/errors";

export const CSV_MAX_CHARS = 20_000;
export const CSV_MAX_ROWS = 200;
export const CSV_MAX_COLUMNS = 50;

export type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

export function escapeCsvValue(value: unknown) {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildCsv(headers: string[], rows: Record<string, unknown>[]) {
  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ].join("\r\n");
}

function parseCsvCells(input: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        currentCell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
      continue;
    }

    if (char === '"') {
      if (currentCell.length > 0) {
        throw new ServiceError("Invalid CSV: quote found in the middle of an unquoted value.");
      }
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (char === "\n") {
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    if (char !== "\r") {
      currentCell += char;
    }
  }

  if (inQuotes) {
    throw new ServiceError("Invalid CSV: quoted value is not closed.");
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

export function parseCsv(input: string): ParsedCsv {
  if (input.length > CSV_MAX_CHARS) {
    throw new ServiceError(`CSV is too large. Keep it under ${CSV_MAX_CHARS} characters.`);
  }

  const parsedRows = parseCsvCells(input.trim());
  if (parsedRows.length === 0) {
    throw new ServiceError("CSV is empty.");
  }
  if (parsedRows.length - 1 > CSV_MAX_ROWS) {
    throw new ServiceError(`CSV has too many rows. Maximum is ${CSV_MAX_ROWS}.`);
  }

  const headers = parsedRows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) {
    throw new ServiceError("CSV headers cannot be blank.");
  }
  if (headers.length > CSV_MAX_COLUMNS) {
    throw new ServiceError(`CSV has too many columns. Maximum is ${CSV_MAX_COLUMNS}.`);
  }
  if (new Set(headers).size !== headers.length) {
    throw new ServiceError("CSV headers must be unique.");
  }

  const rows = parsedRows.slice(1).map((cells) => {
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });
    return row;
  });

  return { headers, rows };
}
