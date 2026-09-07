"use client";

import { useState } from "react";
import {
  TestEnvironment,
  TEST_ENVIRONMENTS,
  TEST_ENVIRONMENT_LABELS,
  TestingEntry,
} from "@/lib/types";
import CommitField from "@/components/CommitField";
import PersonSelect from "@/components/PersonSelect";
import { PEOPLE } from "@/lib/currentPerson";
import { useRequireActingPerson } from "@/components/ActingAsProvider";

export default function TestingEntryForm({
  taskId,
  defaultEnvironment = "staging",
  defaultCommit = "",
  onCreated,
  onCancel,
}: {
  taskId: string;
  defaultEnvironment?: TestEnvironment;
  defaultCommit?: string;
  onCreated: (entry: TestingEntry) => void;
  onCancel?: () => void;
}) {
  const requirePerson = useRequireActingPerson();
  const [environment, setEnvironment] = useState<TestEnvironment>(defaultEnvironment);
  const [commit, setCommit] = useState(defaultCommit);
  const [tester, setTester] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commit.trim()) {
      setError("Commit SHA or GitHub URL is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const readyBy = await requirePerson();
      const res = await fetch(`/api/bugs/${taskId}/testing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment,
          commit,
          assigned_tester: tester,
          ready_by: readyBy,
          notes,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create testing entry");
      }

      const entry = await res.json();
      onCreated(entry);
      setCommit("");
      setTester("");
      setNotes("");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Environment</label>
        <div className="flex gap-2">
          {TEST_ENVIRONMENTS.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => setEnvironment(env)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition ${
                environment === env
                  ? "bg-indigo-600 text-white ring-indigo-600"
                  : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
              }`}
            >
              {TEST_ENVIRONMENT_LABELS[env]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Commit</label>
        <CommitField value={commit} onChange={setCommit} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Assigned Tester</label>
        <PersonSelect
          value={tester}
          onChange={setTester}
          people={PEOPLE}
          placeholder="Unassigned"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Marking ready..." : "Mark Ready for Testing"}
        </button>
      </div>
    </form>
  );
}
