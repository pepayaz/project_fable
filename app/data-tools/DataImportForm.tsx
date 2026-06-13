"use client";

import { useActionState } from "react";
import {
  confirmImportAction,
  initialImportState,
  previewImportAction,
  type ImportActionState,
} from "@/app/data-tools/actions";
import { importEntities } from "@/lib/validations/data-tools";

function EntitySelect({ value }: { value: string }) {
  return (
    <select
      name="entity"
      defaultValue={value}
      className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary-border focus:outline-none"
    >
      {importEntities.map((entity) => (
        <option key={entity} value={entity}>
          {entity}
        </option>
      ))}
    </select>
  );
}

function Report({ state }: { state: ImportActionState }) {
  if (!state.report) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-4">
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-text-muted">Total rows</p>
          <p className="font-semibold text-text-primary">{state.report.totalRows}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Valid rows</p>
          <p className="font-semibold text-success">{state.report.validRows}</p>
        </div>
        <div>
          <p className="text-xs text-text-muted">Invalid rows</p>
          <p className="font-semibold text-danger">{state.report.invalidRows}</p>
        </div>
      </div>
      <div className="mt-4 max-h-72 overflow-auto rounded-md border border-border bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Row</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {state.report.rows.map((row) => (
              <tr key={row.rowNumber}>
                <td className="px-3 py-2 text-text-secondary">{row.rowNumber}</td>
                <td className="px-3 py-2">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      row.errors.length === 0
                        ? "bg-success-soft text-success"
                        : "bg-danger-soft text-danger"
                    }`}
                  >
                    {row.errors.length === 0 ? "Valid" : "Invalid"}
                  </span>
                </td>
                <td className="px-3 py-2 text-text-secondary">
                  {row.errors.length === 0 ? "Ready to import" : row.errors.join(" ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DataImportForm() {
  const [previewState, previewAction, previewPending] = useActionState(
    previewImportAction,
    initialImportState,
  );
  const [confirmState, confirmAction, confirmPending] = useActionState(
    confirmImportAction,
    initialImportState,
  );
  const state = confirmState.success || confirmState.error ? confirmState : previewState;
  const canImport = Boolean(previewState.report && previewState.report.invalidRows === 0);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
      <div>
        <h2 className="text-sm font-semibold text-text-primary">Import CSV</h2>
        <p className="mt-1 text-sm text-text-muted">
          Paste CSV, preview validation, then confirm. Imports are ADMIN-only and capped at 200 rows.
        </p>
      </div>

      {state.error && (
        <div className="mt-4 rounded-md border border-danger-soft bg-danger-soft px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mt-4 rounded-md border border-success-soft bg-success-soft px-4 py-3 text-sm text-success">
          {state.success}
        </div>
      )}

      <form action={previewAction} className="mt-4 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-muted">Entity</label>
          <EntitySelect value={state.entity} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="csvText" className="text-xs font-medium text-text-muted">
            CSV
          </label>
          <textarea
            id="csvText"
            name="csvText"
            defaultValue={state.csvText}
            rows={10}
            className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm text-text-primary placeholder:text-text-subtle focus:border-primary-border focus:outline-none"
            placeholder="Paste CSV with headers here"
          />
        </div>
        <button
          type="submit"
          disabled={previewPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {previewPending ? "Previewing..." : "Preview import"}
        </button>
      </form>

      <div className="mt-4">
        <Report state={state} />
      </div>

      {canImport && (
        <form action={confirmAction} className="mt-4">
          <input type="hidden" name="entity" value={previewState.entity} />
          <input type="hidden" name="csvText" value={previewState.csvText} />
          <button
            type="submit"
            disabled={confirmPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {confirmPending ? "Importing..." : "Confirm import"}
          </button>
        </form>
      )}
    </div>
  );
}
