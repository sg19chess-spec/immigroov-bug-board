"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadScreenshots } from "@/lib/uploadScreenshots";
import { usePasteImages } from "@/lib/usePasteImages";
import ReporterSelect from "@/components/ReporterSelect";
import PrioritySelect from "@/components/PrioritySelect";
import IssueTypeSelect from "@/components/IssueTypeSelect";
import { BugPriority, IssueType } from "@/lib/types";

export default function AddBugForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [priority, setPriority] = useState<BugPriority>("medium");
  const [issueType, setIssueType] = useState<IssueType>("bug");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePastedFiles = useCallback((files: File[]) => {
    setScreenshots((prev) => [...prev, ...files]);
  }, []);
  usePasteImages(handlePastedFiles);

  const previews = useMemo(
    () => screenshots.map((file) => URL.createObjectURL(file)),
    [screenshots]
  );
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function removeScreenshot(index: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      const screenshot_urls = await uploadScreenshots(screenshots);

      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          reported_by: reportedBy,
          screenshot_urls,
          priority,
          issue_type: issueType,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create bug");
      }

      router.push("/board");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Issue Type
        </label>
        <IssueTypeSelect value={issueType} onChange={setIssueType} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Title *
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary of the issue"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Steps to reproduce, expected vs actual behavior..."
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Reported by
        </label>
        <ReporterSelect value={reportedBy} onChange={setReportedBy} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Priority
        </label>
        <PrioritySelect value={priority} onChange={setPriority} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Screenshots
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) =>
            setScreenshots((prev) => [
              ...prev,
              ...Array.from(e.target.files ?? []),
            ])
          }
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="mt-1 text-xs text-slate-400">
          Tip: you can paste (Ctrl+V) a screenshot directly into this page.
        </p>

        {previews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {previews.map((url, i) => (
              <div key={url} className="relative h-16 w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Screenshot ${i + 1}`}
                  className="h-full w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                  aria-label="Remove screenshot"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 md:w-auto"
      >
        {submitting ? "Submitting..." : "Report Bug"}
      </button>
    </form>
  );
}
