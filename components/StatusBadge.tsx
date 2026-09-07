import { BugStatus, STATUS_LABELS } from "@/lib/types";

const COLORS: Record<BugStatus, string> = {
  yet_to_review: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  planned: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  in_progress: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  to_be_tested: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  tested: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

export default function StatusBadge({ status }: { status: BugStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
