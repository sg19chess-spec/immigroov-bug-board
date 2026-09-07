import { TodoStageHistoryEntry } from "./types";
import { durationBetween } from "./time";

export interface TodoMetrics {
  firstInProgressAt: string | null;
  timeToStartMs: number | null;
  activeCompletionMs: number | null;
  totalTurnaroundMs: number | null;
}

/**
 * Time to Start = first_in_progress_at - assigned_at
 * Active Completion Time = completed_at - first_in_progress_at
 * Total Turnaround = completed_at - assigned_at
 *
 * Uses the *first* time the to-do entered In Progress, so a later
 * backward move (Completed -> In Progress -> Completed again) doesn't
 * shift these metrics.
 */
export function computeTodoMetrics(
  assignedAt: string,
  completedAt: string | null,
  history: TodoStageHistoryEntry[]
): TodoMetrics {
  const firstInProgress = [...history]
    .filter((h) => h.to_stage === "in_progress")
    .sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime())[0];

  const firstInProgressAt = firstInProgress?.changed_at ?? null;

  return {
    firstInProgressAt,
    timeToStartMs: firstInProgressAt ? durationBetween(assignedAt, firstInProgressAt) : null,
    activeCompletionMs:
      firstInProgressAt && completedAt
        ? durationBetween(firstInProgressAt, completedAt)
        : null,
    totalTurnaroundMs: completedAt ? durationBetween(assignedAt, completedAt) : null,
  };
}
