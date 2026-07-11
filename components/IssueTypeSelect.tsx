"use client";

import { ISSUE_TYPES, ISSUE_TYPE_LABELS, IssueType } from "@/lib/types";

export default function IssueTypeSelect({
  value,
  onChange,
}: {
  value: IssueType;
  onChange: (value: IssueType) => void;
}) {
  return (
    <div className="flex gap-2">
      {ISSUE_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ${
            value === type
              ? "bg-indigo-600 text-white ring-indigo-600"
              : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
          }`}
        >
          {ISSUE_TYPE_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
