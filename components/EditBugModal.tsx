"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Bug,
  BugPriority,
  BUG_STATUSES,
  IssueType,
  StageHistoryEntry,
  STATUS_LABELS,
  TestingEntry,
} from "@/lib/types";
import { uploadScreenshots } from "@/lib/uploadScreenshots";
import ReporterSelect from "@/components/ReporterSelect";
import HandlerSelect from "@/components/HandlerSelect";
import PrioritySelect from "@/components/PrioritySelect";
import IssueTypeSelect from "@/components/IssueTypeSelect";
import ScreenshotField from "@/components/ScreenshotField";
import TagInput from "@/components/TagInput";
import StatusBadge from "@/components/StatusBadge";
import { formatDateTime } from "@/lib/time";
import { computeStageTimeSummary } from "@/lib/stageTime";
import { buildBugActivityFeed } from "@/lib/activity";
import { ActivityFeed, StageDurationList } from "@/components/StageHistoryTimeline";
import TestingEntryForm from "@/components/TestingEntryForm";
import TestingEntryCard from "@/components/TestingEntryCard";
import { shortSha } from "@/lib/commit";

type Tab = "details" | "activity" | "testing";

function DetailsTab({
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
  const [handledBy, setHandledBy] = useState(bug.handled_by ?? "");
  const [priority, setPriority] = useState<BugPriority>(bug.priority);
  const [issueType, setIssueType] = useState<IssueType>(bug.issue_type);
  const [tags, setTags] = useState<string[]>(bug.tags ?? []);
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
          handled_by: handledBy,
          screenshot_urls,
          priority,
          issue_type: issueType,
          tags,
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
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Issue Type</label>
        <IssueTypeSelect value={issueType} onChange={setIssueType} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Reported by</label>
        <ReporterSelect value={reportedBy} onChange={setReportedBy} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Handled by</label>
        <HandlerSelect value={handledBy} onChange={setHandledBy} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
        <PrioritySelect value={priority} onChange={setPriority} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Tags</label>
        <TagInput value={tags} onChange={setTags} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Screenshots</label>
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
                  onClick={() => setExistingUrls((prev) => prev.filter((u) => u !== url))}
                  className="absolute -right-1 -top-1 rounded-full bg-black/70 px-1 text-xs text-white"
                  aria-label="Remove screenshot"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <ScreenshotField files={newFiles} setFiles={setNewFiles} />
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
  );
}

function ActivityTab({ bug }: { bug: Bug }) {
  const [history, setHistory] = useState<StageHistoryEntry[] | null>(null);
  const [testingEntries, setTestingEntries] = useState<TestingEntry[]>([]);

  useEffect(() => {
    fetch(`/api/bugs/${bug.id}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []));
    fetch(`/api/bugs/${bug.id}/testing`)
      .then((res) => res.json())
      .then((data) => setTestingEntries(Array.isArray(data) ? data : []));
  }, [bug.id]);

  if (!history) {
    return <p className="text-sm text-slate-400">Loading activity...</p>;
  }

  const summary = computeStageTimeSummary(history, { terminalStage: "completed" });
  const events = buildBugActivityFeed(history, testingEntries);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Time in Each Stage</h3>
        <StageDurationList summary={summary} stages={BUG_STATUSES} labels={STATUS_LABELS} />
        {summary.turnaroundMs !== null && (
          <p className="mt-2 text-xs text-slate-500">
            Total turnaround so far:{" "}
            <span className="font-medium text-slate-700">
              {Math.round(summary.turnaroundMs / 60000)} min
            </span>
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Activity</h3>
        <ActivityFeed events={events} />
      </div>
    </div>
  );
}

function TestingTab({ bug }: { bug: Bug }) {
  const [entries, setEntries] = useState<TestingEntry[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [prefill, setPrefill] = useState<{ environment: "staging" | "production"; commit: string } | null>(
    null
  );

  useEffect(() => {
    fetch(`/api/bugs/${bug.id}/testing`)
      .then((res) => res.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []));
  }, [bug.id]);

  if (!entries) {
    return <p className="text-sm text-slate-400">Loading testing history...</p>;
  }

  const latestPassedStaging = entries
    .filter((t) => t.environment === "staging" && t.status === "passed")
    .sort(
      (a, b) =>
        new Date(b.tested_at ?? b.created_at).getTime() -
        new Date(a.tested_at ?? a.created_at).getTime()
    )[0];

  const canCreate = bug.status === "to_be_tested";

  return (
    <div className="flex flex-col gap-4">
      {canCreate && !showForm && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setPrefill(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Mark Ready for Testing
          </button>
          {latestPassedStaging && (
            <button
              onClick={() => {
                setPrefill({
                  environment: "production",
                  commit: latestPassedStaging.commit_url ?? latestPassedStaging.commit_sha ?? "",
                });
                setShowForm(true);
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Use {shortSha(latestPassedStaging.commit_sha)} for Production
            </button>
          )}
        </div>
      )}

      {showForm && (
        <TestingEntryForm
          taskId={bug.id}
          defaultEnvironment={prefill?.environment}
          defaultCommit={prefill?.commit}
          onCreated={(entry) => {
            setEntries((prev) => [entry, ...(prev ?? [])]);
            setShowForm(false);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-sm text-slate-400">
          No testing attempts yet
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <TestingEntryCard
              key={entry.id}
              entry={entry}
              onUpdated={(updated) =>
                setEntries((prev) => (prev ?? []).map((e) => (e.id === updated.id ? updated : e)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [tab, setTab] = useState<Tab>("details");

  const TABS: { key: Tab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "activity", label: "Activity" },
    { key: "testing", label: "Testing" },
  ];

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {bug.issue_type === "feature_request" ? "Feature Request" : "Bug"}
          </h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {bug.ref_id}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <StatusBadge status={bug.status} />
          <span>
            Last Stage Change: {formatDateTime(bug.last_stage_change ?? bug.created_at)}
          </span>
        </div>

        <div className="mb-4 flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-2 text-sm font-medium ${
                tab === t.key
                  ? "border-b-2 border-indigo-600 text-indigo-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "details" && (
          <DetailsTab bug={bug} onSaved={onSaved} onDeleted={onDeleted} onClose={onClose} />
        )}
        {tab === "activity" && <ActivityTab bug={bug} />}
        {tab === "testing" && <TestingTab bug={bug} />}
      </div>
    </div>
  );
}
