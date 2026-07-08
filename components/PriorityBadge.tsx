import { BugPriority, PRIORITY_LABELS } from "@/lib/types";

const COLORS: Record<BugPriority, string> = {
  high: "bg-red-50 text-red-700 ring-1 ring-red-200",
  medium: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
  low: "bg-green-50 text-green-700 ring-1 ring-green-200",
};

const DOT_COLORS: Record<BugPriority, string> = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export function PriorityDot({ priority }: { priority: BugPriority }) {
  return <span className={`h-2 w-2 rounded-full ${DOT_COLORS[priority]}`} />;
}

export default function PriorityBadge({
  priority,
}: {
  priority: BugPriority;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[priority]}`}
    >
      <PriorityDot priority={priority} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
