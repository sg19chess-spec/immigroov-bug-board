"use client";

import { useState } from "react";
import { TestCase, TestModule } from "@/lib/types";
import TestCaseRow from "@/components/TestCaseRow";
import AddTestCaseForm from "@/components/AddTestCaseForm";

export default function ModuleSection({
  module,
  testCases,
  onAddCase,
  onFinishCase,
  onReopenCase,
  onDeleteCase,
  onDeleteModule,
}: {
  module: TestModule;
  testCases: TestCase[];
  onAddCase: (testCase: TestCase) => void;
  onFinishCase: (caseId: string, testerName: string) => void;
  onReopenCase: (caseId: string) => void;
  onDeleteCase: (caseId: string) => void;
  onDeleteModule: () => void;
}) {
  const [open, setOpen] = useState(true);
  const testedCount = testCases.filter((c) => c.tested).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 p-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span
            className={`text-slate-400 transition-transform ${open ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          <h2 className="text-sm font-semibold text-slate-900">{module.name}</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {testedCount}/{testCases.length} tested
          </span>
        </button>
        <button
          onClick={onDeleteModule}
          className="rounded-md px-1.5 py-0.5 text-xs text-slate-400 hover:text-red-600"
          aria-label="Delete module"
        >
          🗑
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-2 border-t border-slate-100 p-4">
          {testCases.map((tc) => (
            <TestCaseRow
              key={tc.id}
              testCase={tc}
              onFinish={(tester) => onFinishCase(tc.id, tester)}
              onReopen={() => onReopenCase(tc.id)}
              onDelete={() => onDeleteCase(tc.id)}
            />
          ))}
          <AddTestCaseForm moduleId={module.id} onAdded={onAddCase} />
        </div>
      )}
    </div>
  );
}
