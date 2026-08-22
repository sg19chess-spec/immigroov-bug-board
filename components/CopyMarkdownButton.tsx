"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bug,
  BUG_PRIORITIES,
  BUG_STATUSES,
  BugPriority,
  BugStatus,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/lib/types";
import {
  collectPeople,
  matchesPeople,
  PersonField,
  personLabel,
} from "@/lib/people";
import { bugsToMarkdown } from "@/lib/exportMarkdown";

function PeopleSection({
  title,
  field,
  people,
  selected,
  onToggle,
}: {
  title: string;
  field: PersonField;
  people: string[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  if (people.length === 0) return null;

  return (
    <>
      <p className="mb-1 text-xs font-semibold text-slate-500">{title}</p>
      <div className="mb-3 flex max-h-28 flex-col gap-1 overflow-y-auto">
        {people.map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.has(key)}
              onChange={() => onToggle(key)}
              className="h-4 w-4 accent-indigo-600"
            />
            {personLabel(key, field)}
          </label>
        ))}
      </div>
    </>
  );
}

export default function CopyMarkdownButton({ bugs }: { bugs: Bug[] }) {
  const [open, setOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Set<BugStatus>>(
    new Set(BUG_STATUSES)
  );
  const [selectedPriorities, setSelectedPriorities] = useState<Set<BugPriority>>(
    new Set(BUG_PRIORITIES)
  );
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selectedReporters, setSelectedReporters] = useState<Set<string>>(
    new Set()
  );
  const [selectedHandlers, setSelectedHandlers] = useState<Set<string>>(
    new Set()
  );
  const [includeImages, setIncludeImages] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const bug of bugs) {
      for (const tag of bug.tags) tags.add(tag);
    }
    return [...tags].sort();
  }, [bugs]);

  const allReporters = useMemo(() => collectPeople(bugs, "reported_by"), [bugs]);
  const allHandlers = useMemo(() => collectPeople(bugs, "handled_by"), [bugs]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleStatus(status: BugStatus) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  function togglePriority(priority: BugPriority) {
    setSelectedPriorities((prev) => {
      const next = new Set(prev);
      if (next.has(priority)) next.delete(priority);
      else next.add(priority);
      return next;
    });
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  function togglePerson(
    setter: Dispatch<SetStateAction<Set<string>>>,
    key: string
  ) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function getFilteredBugs() {
    return bugs.filter(
      (b) =>
        selectedStatuses.has(b.status) &&
        selectedPriorities.has(b.priority) &&
        (selectedTags.size === 0 || b.tags.some((t) => selectedTags.has(t))) &&
        matchesPeople(selectedReporters, b.reported_by) &&
        matchesPeople(selectedHandlers, b.handled_by)
    );
  }

  async function handleCopy() {
    const markdown = bugsToMarkdown(getFilteredBugs(), { includeImages });
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setOpen(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallbackText(markdown);
      setOpen(false);
    }
  }

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
        >
          {copied ? "✓ Copied!" : "📋 Copy as Markdown"}
        </button>

        {open && (
          <div className="absolute right-0 z-20 mt-2 w-64 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-500">Stages</p>
            <div className="mb-3 flex flex-col gap-1">
              {BUG_STATUSES.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedStatuses.has(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  {STATUS_LABELS[status]}
                </label>
              ))}
            </div>

            <p className="mb-1 text-xs font-semibold text-slate-500">Priority</p>
            <div className="mb-3 flex flex-col gap-1">
              {BUG_PRIORITIES.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedPriorities.has(priority)}
                    onChange={() => togglePriority(priority)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  {PRIORITY_LABELS[priority]}
                </label>
              ))}
            </div>

            <PeopleSection
              title="Reported By"
              field="reported_by"
              people={allReporters}
              selected={selectedReporters}
              onToggle={(key) => togglePerson(setSelectedReporters, key)}
            />

            <PeopleSection
              title="Handled By"
              field="handled_by"
              people={allHandlers}
              selected={selectedHandlers}
              onToggle={(key) => togglePerson(setSelectedHandlers, key)}
            />

            {allTags.length > 0 && (
              <>
                <p className="mb-1 text-xs font-semibold text-slate-500">Tags</p>
                <div className="mb-3 flex max-h-28 flex-col gap-1 overflow-y-auto">
                  {allTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTags.has(tag)}
                        onChange={() => toggleTag(tag)}
                        className="h-4 w-4 accent-indigo-600"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </>
            )}

            <label className="mb-3 flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="h-4 w-4 accent-indigo-600"
              />
              Include image links
            </label>

            <button
              type="button"
              onClick={handleCopy}
              disabled={selectedStatuses.size === 0 || selectedPriorities.size === 0}
              className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {fallbackText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setFallbackText(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-sm font-medium text-slate-700">
              Clipboard access was blocked — select all and copy manually:
            </p>
            <textarea
              readOnly
              autoFocus
              value={fallbackText}
              onFocus={(e) => e.currentTarget.select()}
              rows={12}
              className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setFallbackText(null)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
