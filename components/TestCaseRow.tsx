"use client";

import { useState } from "react";
import { TestCase } from "@/lib/types";
import ReporterSelect from "@/components/ReporterSelect";

export default function TestCaseRow({
  testCase,
  onFinish,
  onReopen,
  onDelete,
}: {
  testCase: TestCase;
  onFinish: (testerName: string) => void;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const [finishing, setFinishing] = useState(false);
  const [tester, setTester] = useState("");

  function confirmFinish() {
    if (!tester.trim()) return;
    onFinish(tester);
    setFinishing(false);
    setTester("");
  }

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-3 ${
        testCase.tested ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-800">{testCase.description}</p>
        <button
          onClick={onDelete}
          className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-slate-400 hover:text-red-600"
          aria-label="Delete test case"
        >
          🗑
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span>Added by {testCase.added_by || "Anonymous"}</span>
        {testCase.tested ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 ring-1 ring-emerald-200">
            ✓ Tested by {testCase.tested_by || "Anonymous"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500 ring-1 ring-slate-200">
            Pending
          </span>
        )}
      </div>

      <div className="mt-2">
        {testCase.tested ? (
          <button
            onClick={onReopen}
            className="text-xs font-medium text-slate-500 hover:text-indigo-600"
          >
            Reopen
          </button>
        ) : finishing ? (
          <div className="flex items-center gap-2">
            <div className="w-40">
              <ReporterSelect value={tester} onChange={setTester} />
            </div>
            <button
              onClick={confirmFinish}
              disabled={!tester.trim()}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Confirm
            </button>
            <button
              onClick={() => setFinishing(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setFinishing(true)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Finish Testing
          </button>
        )}
      </div>
    </div>
  );
}
