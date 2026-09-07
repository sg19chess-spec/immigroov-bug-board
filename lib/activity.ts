import {
  STATUS_LABELS,
  StageHistoryEntry,
  TEST_ENVIRONMENT_LABELS,
  TestingEntry,
  TODO_STAGE_LABELS,
  TodoStageHistoryEntry,
} from "@/lib/types";
import { shortSha } from "@/lib/commit";

export interface ActivityEvent {
  at: string;
  text: string;
}

function sortByTime(events: ActivityEvent[]): ActivityEvent[] {
  return [...events].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function buildBugActivityFeed(
  history: StageHistoryEntry[],
  testingEntries: TestingEntry[]
): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const h of history) {
    const actor = h.changed_by || "Someone";
    events.push(
      h.from_stage
        ? { at: h.changed_at, text: `${actor} moved ${STATUS_LABELS[h.from_stage]} → ${STATUS_LABELS[h.to_stage]}` }
        : { at: h.changed_at, text: `Task created in ${STATUS_LABELS[h.to_stage]}` }
    );
  }

  for (const t of testingEntries) {
    const commit = shortSha(t.commit_sha) ?? "a commit";
    events.push({
      at: t.ready_at,
      text: `${t.ready_by || "Someone"} marked \`${commit}\` ready for ${TEST_ENVIRONMENT_LABELS[t.environment]} testing`,
    });

    if (t.status !== "pending" && t.tested_at) {
      const result = t.status === "passed" ? "Passed" : "Failed";
      events.push({
        at: t.tested_at,
        text: `${t.tested_by || "Someone"} tested \`${commit}\` in ${TEST_ENVIRONMENT_LABELS[t.environment]} — ${result}`,
      });
    }
  }

  return sortByTime(events);
}

export function buildTodoActivityFeed(history: TodoStageHistoryEntry[]): ActivityEvent[] {
  const events = history.map((h): ActivityEvent => {
    const actor = h.changed_by || "Someone";
    return h.from_stage
      ? { at: h.changed_at, text: `${actor} moved ${TODO_STAGE_LABELS[h.from_stage]} → ${TODO_STAGE_LABELS[h.to_stage]}` }
      : { at: h.changed_at, text: `${actor} assigned this task` };
  });

  return sortByTime(events);
}
