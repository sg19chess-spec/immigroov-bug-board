"use client";

import { useState } from "react";
import { Bug } from "@/lib/types";
import { bugsToMarkdown } from "@/lib/exportMarkdown";

export default function CopyMarkdownButton({ bugs }: { bugs: Bug[] }) {
  const [copied, setCopied] = useState(false);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  async function handleCopy() {
    const markdown = bugsToMarkdown(bugs);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFallbackText(markdown);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
      >
        {copied ? "✓ Copied!" : "📋 Copy as Markdown"}
      </button>

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
