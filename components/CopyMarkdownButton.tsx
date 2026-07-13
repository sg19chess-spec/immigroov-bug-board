"use client";

import { useEffect, useRef, useState } from "react";
import { Bug, BUG_STATUSES, BugStatus, STATUS_LABELS } from "@/lib/types";
import { bugsToMarkdown } from "@/lib/exportMarkdown";

export default function CopyMarkdownButton({ bugs }: { bugs: Bug[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<BugStatus>>(new Set(BUG_STATUSES));
  const [copied, setCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
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

  function toggleStatus(status: BugStatus) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  async function handleCopy() {
    const markdown = bugsToMarkdown(bugs.filter((b) => selected.has(b.status)));
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
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
            <p className="mb-1 text-xs font-semibold text-slate-500">Include</p>
            <div className="mb-3 flex flex-col gap-1">
              {BUG_STATUSES.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  {STATUS_LABELS[status]}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={selected.size === 0}
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
