"use client";

import { useEffect, useState } from "react";
import { Todo, TodoStageHistoryEntry, TODO_STAGE_LABELS } from "@/lib/types";
import { formatDateTime, formatDuration } from "@/lib/time";
import { computeTodoMetrics } from "@/lib/todoMetrics";
import { buildTodoActivityFeed } from "@/lib/activity";
import { ActivityFeed } from "@/components/StageHistoryTimeline";

export default function TodoDetailModal({
  todo,
  onClose,
}: {
  todo: Todo;
  onClose: () => void;
}) {
  const [history, setHistory] = useState<TodoStageHistoryEntry[] | null>(null);

  useEffect(() => {
    fetch(`/api/todos/${todo.id}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []));
  }, [todo.id]);

  const metrics = history
    ? computeTodoMetrics(todo.created_at, todo.completed_at, history)
    : null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {TODO_STAGE_LABELS[todo.stage]}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-700">{todo.description}</p>

        <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500">
          <span>Assigned By: <span className="font-medium text-slate-700">{todo.reported_by || "—"}</span></span>
          <span>Assigned To: <span className="font-medium text-slate-700">{todo.assigned_to || "Unassigned"}</span></span>
          <span>Assigned At: <span className="font-medium text-slate-700">{formatDateTime(todo.created_at)}</span></span>
          <span>Started At: <span className="font-medium text-slate-700">{formatDateTime(todo.in_progress_at)}</span></span>
          <span>Completed At: <span className="font-medium text-slate-700">{formatDateTime(todo.completed_at)}</span></span>
          <span>Last Stage Change: <span className="font-medium text-slate-700">{formatDateTime(todo.last_stage_change ?? todo.created_at)}</span></span>
        </div>

        {metrics && (
          <div className="mb-4 rounded-xl bg-slate-50 p-3">
            <h3 className="mb-2 text-sm font-semibold text-slate-700">Performance</h3>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Time to Start</span>
                <span className="font-medium text-slate-800">
                  {metrics.timeToStartMs !== null ? formatDuration(metrics.timeToStartMs) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Active Completion Time</span>
                <span className="font-medium text-slate-800">
                  {metrics.activeCompletionMs !== null
                    ? formatDuration(metrics.activeCompletionMs)
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total Turnaround</span>
                <span className="font-medium text-slate-800">
                  {metrics.totalTurnaroundMs !== null
                    ? formatDuration(metrics.totalTurnaroundMs)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Activity</h3>
          {history ? (
            <ActivityFeed events={buildTodoActivityFeed(history)} />
          ) : (
            <p className="text-sm text-slate-400">Loading activity...</p>
          )}
        </div>
      </div>
    </div>
  );
}
