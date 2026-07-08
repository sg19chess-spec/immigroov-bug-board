"use client";

import { useState } from "react";
import ReporterSelect from "@/components/ReporterSelect";
import { Todo } from "@/lib/types";

export default function AddTodoForm({
  onAdded,
}: {
  onAdded: (todo: Todo) => void;
}) {
  const [description, setDescription] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Task description is required");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, reported_by: reportedBy }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to add task");
      }

      const todo = await res.json();
      onAdded(todo);
      setDescription("");
      setReportedBy("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-start md:p-5"
    >
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a task..."
        rows={2}
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="flex gap-2 md:w-56 md:flex-col">
        <div className="flex-1">
          <ReporterSelect value={reportedBy} onChange={setReportedBy} />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add Task"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 md:basis-full">{error}</p>}
    </form>
  );
}
