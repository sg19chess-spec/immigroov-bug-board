"use client";

import { Bug, BUG_STATUSES, STATUS_LABELS } from "@/lib/types";

export default function MoveSheet({
  bug,
  onMove,
  onClose,
}: {
  bug: Bug;
  onMove: (status: (typeof BUG_STATUSES)[number]) => void;
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
          {bug.title}
        </p>
        <div className="flex flex-col gap-2">
          {BUG_STATUSES.map((status) => (
            <button
              key={status}
              disabled={status === bug.status}
              onClick={() => {
                onMove(status);
                onClose();
              }}
              className="rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-40"
            >
              Move to {STATUS_LABELS[status]}
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
