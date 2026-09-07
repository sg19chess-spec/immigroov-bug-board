import { ActivityEvent } from "@/lib/activity";
import { formatDateTime, formatDuration } from "@/lib/time";
import { StageTimeSummary } from "@/lib/stageTime";

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-400">No activity yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {[...events].reverse().map((event, i) => (
        <li key={i} className="border-l-2 border-slate-200 pl-3 text-sm">
          <p className="text-slate-700">{event.text}</p>
          <p className="text-xs text-slate-400">{formatDateTime(event.at, { seconds: false })}</p>
        </li>
      ))}
    </ol>
  );
}

export function StageDurationList<Stage extends string>({
  summary,
  stages,
  labels,
}: {
  summary: StageTimeSummary<Stage>;
  stages: Stage[];
  labels: Record<Stage, string>;
}) {
  const withTime = stages.filter((stage) => summary.perStage[stage]);
  if (withTime.length === 0) {
    return <p className="text-sm text-slate-400">No stage time recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {withTime.map((stage) => {
        const info = summary.perStage[stage]!;
        return (
          <div key={stage} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{labels[stage]}</span>
            <span className="font-medium text-slate-800">{formatDuration(info.totalMs)}</span>
          </div>
        );
      })}
    </div>
  );
}
