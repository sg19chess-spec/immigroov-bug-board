"use client";

import { useState } from "react";
import { TestingEntry, TEST_ENVIRONMENT_LABELS, TEST_STATUS_LABELS } from "@/lib/types";
import CommitBadge from "@/components/CommitBadge";
import { formatDateTime } from "@/lib/time";
import { useRequireActingPerson } from "@/components/ActingAsProvider";

const STATUS_STYLES: Record<TestingEntry["status"], string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  passed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
};

export default function TestingEntryCard({
  entry,
  onUpdated,
}: {
  entry: TestingEntry;
  onUpdated: (entry: TestingEntry) => void;
}) {
  const requirePerson = useRequireActingPerson();
  const [pendingResult, setPendingResult] = useState<"passed" | "failed" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitResult(result: "passed" | "failed") {
    setSubmitting(true);
    setError(null);
    try {
      const testedBy = await requirePerson();
      const res = await fetch(`/api/bugs/${entry.task_id}/testing/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, tested_by: testedBy, test_notes: note }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to record result");
      }

      const updated = await res.json();
      onUpdated(updated);
      setPendingResult(null);
      setNote("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {TEST_ENVIRONMENT_LABELS[entry.environment]}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STATUS_STYLES[entry.status]}`}
        >
          {TEST_STATUS_LABELS[entry.status]}
        </span>
      </div>

      <div className="mt-1.5">
        <CommitBadge sha={entry.commit_sha} url={entry.commit_url} />
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
        <span>Tester: {entry.assigned_tester || "Unassigned"}</span>
        <span>Ready by {entry.ready_by || "—"}</span>
        <span>Ready at {formatDateTime(entry.ready_at)}</span>
      </div>

      {entry.status !== "pending" && (
        <div className="mt-1 text-xs text-slate-500">
          Tested by {entry.tested_by || "—"} at {formatDateTime(entry.tested_at)}
        </div>
      )}

      {entry.test_notes && (
        <p className="mt-1.5 text-xs italic text-slate-500">&ldquo;{entry.test_notes}&rdquo;</p>
      )}

      {entry.status === "pending" && (
        <div className="mt-3">
          {pendingResult ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingResult(null)}
                  className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitResult(pendingResult)}
                  disabled={submitting}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 ${
                    pendingResult === "passed"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Confirm {pendingResult === "passed" ? "Pass" : "Fail"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setPendingResult("passed")}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Pass
              </button>
              <button
                onClick={() => setPendingResult("failed")}
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Fail
              </button>
            </div>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
