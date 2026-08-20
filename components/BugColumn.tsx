"use client";

import { useDroppable } from "@dnd-kit/core";
import { Bug, BugStatus, STATUS_LABELS } from "@/lib/types";
import BugCard from "./BugCard";

const DOT_COLORS: Record<BugStatus, string> = {
  yet_to_review: "bg-slate-400",
  in_progress: "bg-amber-500",
  to_be_tested: "bg-sky-500",
  completed: "bg-emerald-500",
};

export default function BugColumn({
  status,
  bugs,
  onCardClick,
  onEdit,
  onDelete,
  draggable = true,
  className,
}: {
  status: BugStatus;
  bugs: Bug[];
  onCardClick?: (bug: Bug) => void;
  onEdit?: (bug: Bug) => void;
  onDelete?: (bug: Bug) => void;
  draggable?: boolean;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-slate-100/70 p-3 transition ${
        isOver ? "ring-2 ring-indigo-400 bg-indigo-50/60" : ""
      } ${className ?? ""}`}
    >
      <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
        <span className={`h-2 w-2 rounded-full ${DOT_COLORS[status]}`} />
        {STATUS_LABELS[status]}
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
          {bugs.length}
        </span>
      </h2>
      <div className="flex min-h-[4rem] flex-col gap-2">
        {bugs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">
            No bugs here
          </p>
        ) : (
          bugs.map((bug) => (
            <BugCard
              key={bug.id}
              bug={bug}
              onClick={() => onCardClick?.(bug)}
              onEdit={onEdit ? () => onEdit(bug) : undefined}
              onDelete={onDelete ? () => onDelete(bug) : undefined}
              draggable={draggable}
            />
          ))
        )}
      </div>
    </div>
  );
}
