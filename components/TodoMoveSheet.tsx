"use client";

import { Todo, TODO_STAGES, TODO_STAGE_LABELS } from "@/lib/types";

export default function TodoMoveSheet({
  todo,
  onMove,
  onClose,
}: {
  todo: Todo;
  onMove: (stage: (typeof TODO_STAGES)[number]) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-20 flex items-end bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-2xl bg-white p-4 pb-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
        <p className="mb-3 truncate text-sm font-medium text-slate-500">
          {todo.description}
        </p>
        <div className="flex flex-col gap-2">
          {TODO_STAGES.map((stage) => (
            <button
              key={stage}
              disabled={stage === todo.stage}
              onClick={() => {
                onMove(stage);
                onClose();
              }}
              className="rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              Move to {TODO_STAGE_LABELS[stage]}
            </button>
          ))}
          <button
            onClick={onClose}
            className="mt-1 rounded-lg py-2.5 text-sm text-slate-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
