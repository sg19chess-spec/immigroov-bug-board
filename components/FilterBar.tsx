"use client";

import { useEffect, useRef, useState } from "react";
import {
  BUG_PRIORITIES,
  BugPriority,
  ISSUE_TYPES,
  ISSUE_TYPE_LABELS,
  IssueType,
  PRIORITY_LABELS,
} from "@/lib/types";
import { PriorityDot } from "@/components/PriorityBadge";

export type SortOption = "newest" | "oldest" | "priority_high" | "priority_low";

export default function FilterBar({
  activePriorities,
  onTogglePriority,
  activeIssueTypes,
  onToggleIssueType,
  allTags,
  activeTags,
  onToggleTag,
  sort,
  onSortChange,
}: {
  activePriorities: Set<BugPriority>;
  onTogglePriority: (priority: BugPriority) => void;
  activeIssueTypes: Set<IssueType>;
  onToggleIssueType: (type: IssueType) => void;
  allTags: string[];
  activeTags: Set<string>;
  onToggleTag: (tag: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isFiltered =
    activeIssueTypes.size < ISSUE_TYPES.length ||
    activePriorities.size < BUG_PRIORITIES.length ||
    activeTags.size > 0;

  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="relative" ref={containerRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <svg
            className="h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h18M6 8h12M10 12h4M11 16h2"
            />
          </svg>
          Filters
          {isFiltered && (
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
          )}
          <svg
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-500">Issue Type</p>
            <div className="mb-3 flex flex-col gap-1">
              {ISSUE_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={activeIssueTypes.has(type)}
                    onChange={() => onToggleIssueType(type)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  {ISSUE_TYPE_LABELS[type]}
                </label>
              ))}
            </div>

            <p className="mb-1 text-xs font-semibold text-slate-500">Priority</p>
            <div className="flex flex-col gap-1">
              {BUG_PRIORITIES.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={activePriorities.has(priority)}
                    onChange={() => onTogglePriority(priority)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <PriorityDot priority={priority} />
                  {PRIORITY_LABELS[priority]}
                </label>
              ))}
            </div>

            {allTags.length > 0 && (
              <>
                <p className="mb-1 mt-3 text-xs font-semibold text-slate-500">Tags</p>
                <div className="flex max-h-32 flex-col gap-1 overflow-y-auto">
                  {allTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={activeTags.has(tag)}
                        onChange={() => onToggleTag(tag)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-medium text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="priority_high">Priority: High → Low</option>
        <option value="priority_low">Priority: Low → High</option>
      </select>
    </div>
  );
}
