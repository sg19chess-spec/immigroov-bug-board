"use client";

import { BUG_PRIORITIES, BugPriority, PRIORITY_LABELS } from "@/lib/types";

const ACTIVE_CLASSES: Record<BugPriority, string> = {
  high: "bg-red-500 text-white ring-red-500",
  medium: "bg-yellow-500 text-white ring-yellow-500",
  low: "bg-green-500 text-white ring-green-500",
};

export default function PrioritySelect({
  value,
  onChange,
}: {
  value: BugPriority;
  onChange: (value: BugPriority) => void;
}) {
  return (
    <div className="flex gap-2">
      {BUG_PRIORITIES.map((priority) => (
        <button
          key={priority}
          type="button"
          onClick={() => onChange(priority)}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ${
            value === priority
              ? ACTIVE_CLASSES[priority]
              : "bg-white text-slate-600 ring-slate-300 hover:bg-slate-50"
          }`}
        >
          {PRIORITY_LABELS[priority]}
        </button>
      ))}
    </div>
  );
}
