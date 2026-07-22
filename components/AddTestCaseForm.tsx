"use client";

import { useState } from "react";
import ReporterSelect from "@/components/ReporterSelect";
import { TestCase } from "@/lib/types";

export default function AddTestCaseForm({
  moduleId,
  onAdded,
}: {
  moduleId: string;
  onAdded: (testCase: TestCase) => void;
}) {
  const [description, setDescription] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: moduleId,
          description,
          added_by: addedBy,
        }),
      });
      if (!res.ok) throw new Error("Failed to add test case");
      const testCase = await res.json();
      onAdded(testCase);
      setDescription("");
      setAddedBy("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3 md:flex-row md:items-start"
    >
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add a test case..."
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <div className="flex gap-2 md:w-56">
        <div className="flex-1">
          <ReporterSelect value={addedBy} onChange={setAddedBy} />
        </div>
        <button
          type="submit"
          disabled={submitting || !description.trim()}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </form>
  );
}
