export interface StageTransition<Stage extends string> {
  to_stage: Stage;
  changed_at: string;
}

export interface StageDurationInfo {
  firstEnteredAt: string | null;
  lastEnteredAt: string | null;
  totalMs: number;
  occurrences: number;
}

export interface StageTimeSummary<Stage extends string> {
  perStage: Partial<Record<Stage, StageDurationInfo>>;
  lastStageChange: string | null;
  /** Time from the first recorded transition to now (or to the terminal stage, if reached). */
  turnaroundMs: number | null;
}

/**
 * Derives per-stage time-in-stage, "Last Stage Change", and total turnaround
 * purely from an ordered (or unordered) list of stage transitions — nothing
 * is read from a stored duration field, so re-entering a stage or moving
 * backward is always reflected correctly.
 */
export function computeStageTimeSummary<Stage extends string>(
  history: StageTransition<Stage>[],
  options?: { now?: Date; terminalStage?: Stage }
): StageTimeSummary<Stage> {
  const sorted = [...history].sort(
    (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
  );

  if (sorted.length === 0) {
    return { perStage: {}, lastStageChange: null, turnaroundMs: null };
  }

  const now = options?.now ?? new Date();
  const perStage: Partial<Record<Stage, StageDurationInfo>> = {};

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const enteredAt = new Date(entry.changed_at).getTime();
    const leftAt =
      i + 1 < sorted.length ? new Date(sorted[i + 1].changed_at).getTime() : now.getTime();

    const info = perStage[entry.to_stage] ?? {
      firstEnteredAt: entry.changed_at,
      lastEnteredAt: entry.changed_at,
      totalMs: 0,
      occurrences: 0,
    };

    info.lastEnteredAt = entry.changed_at;
    info.totalMs += Math.max(0, leftAt - enteredAt);
    info.occurrences += 1;
    perStage[entry.to_stage] = info;
  }

  const lastStageChange = sorted[sorted.length - 1].changed_at;
  const firstEntered = new Date(sorted[0].changed_at).getTime();

  const terminalReachedAt = options?.terminalStage
    ? [...sorted].reverse().find((e) => e.to_stage === options.terminalStage)?.changed_at
    : undefined;

  const turnaroundEnd = terminalReachedAt
    ? new Date(terminalReachedAt).getTime()
    : now.getTime();

  return {
    perStage,
    lastStageChange,
    turnaroundMs: turnaroundEnd - firstEntered,
  };
}
