"use client";

import {
  BUG_PRIORITIES,
  BugPriority,
  ISSUE_TYPES,
  ISSUE_TYPE_LABELS,
  IssueType,
  PRIORITY_LABELS,
} from "@/lib/types";

export type SortOption = "newest" | "oldest" | "priority_high" | "priority_low";

const PRIORITY_CHIP_ACTIVE: Record<BugPriority, string> = {
  high: "bg-red-500 text-white ring-red-500",
  medium: "bg-yellow-500 text-white ring-yellow-500",
  low: "bg-green-500 text-white ring-green-500",
};

export default function FilterBar({
  activePriorities,
  onTogglePriority,
  activeIssueTypes,
  onToggleIssueType,
  sort,
  onSortChange,
}: {
  activePriorities: Set<BugPriority>;
  onTogglePriority: (priority: BugPriority) => void;
  activeIssueTypes: Set<IssueType>;
  onToggleIssueType: (type: IssueType) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-slate-500">Type:</span>
      {ISSUE_TYPES.map((type) => {
        const active = activeIssueTypes.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggleIssueType(type)}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
              active
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "bg-white text-slate-500 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            {ISSUE_TYPE_LABELS[type]}
          </button>
        );
      })}

      <span className="ml-2 text-xs font-medium text-slate-500">Priority:</span>
      {BUG_PRIORITIES.map((priority) => {
        const active = activePriorities.has(priority);
        return (
          <button
            key={priority}
            onClick={() => onTogglePriority(priority)}
            className={`rounded-full px-3 py-1 text-xs font-medium ring-1 transition ${
              active
                ? PRIORITY_CHIP_ACTIVE[priority]
                : "bg-white text-slate-500 ring-slate-300 hover:bg-slate-50"
            }`}
          >
            {PRIORITY_LABELS[priority]}
          </button>
        );
      })}

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="priority_high">Priority: High → Low</option>
        <option value="priority_low">Priority: Low → High</option>
      </select>
    </div>
  );
}
