"use client";

import { useState } from "react";
import Image from "next/image";
import { Bug, BugPriority } from "@/lib/types";
import { uploadScreenshots } from "@/lib/uploadScreenshots";
import ReporterSelect from "@/components/ReporterSelect";
import PrioritySelect from "@/components/PrioritySelect";

export default function EditBugModal({
  bug,
  onSaved,
  onDeleted,
  onClose,
}: {
  bug: Bug;
  onSaved: (bug: Bug) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(bug.title);
  const [description, setDescription] = useState(bug.description ?? "");
  const [reportedBy, setReportedBy] = useState(bug.reported_by ?? "");
  const [priority, setPriority] = useState<BugPriority>(bug.priority);
  const [existingUrls, setExistingUrls] = useState(bug.screenshot_urls);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const uploadedUrls = await uploadScreenshots(newFiles);
      const screenshot_urls = [...existingUrls, ...uploadedUrls];

      const res = await fetch(`/api/bugs/${bug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          reported_by: reportedBy,
          screenshot_urls,
          priority,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save bug");
      }

      const updated = await res.json();
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this bug? This cannot be undone.")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/bugs/${bug.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bug");
      onDeleted(bug.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Edit Bug</h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Title *
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            {existingUrls.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {existingUrls.map((url) => (
                  <div key={url} className="relative h-16 w-16">
                    <Image
                      src={url}
                      alt="screenshot"
                      fill
                      unoptimized
                      className="rounded-lg object-cover"
                    />
                    <button
                      onClick={() =>
                        setExistingUrls((prev) => prev.filter((u) => u !== url))
                      }
                      className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                      aria-label="Remove screenshot"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewFiles(Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete bug"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
