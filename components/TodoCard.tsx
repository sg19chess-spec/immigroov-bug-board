"use client";

import { useDraggable } from "@dnd-kit/core";
import { Todo } from "@/lib/types";
import { formatDateTime } from "@/lib/time";

export default function TodoCard({
  todo,
  onClick,
  onOpenDetail,
  onDelete,
  draggable = true,
}: {
  todo: Todo;
  onClick?: () => void;
  onOpenDetail?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: todo.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 10 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={draggable ? style : undefined}
      {...(draggable ? listeners : undefined)}
      {...(draggable ? attributes : undefined)}
      onClick={onClick}
      className={`group relative rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md cursor-pointer ${
        draggable ? "touch-none active:cursor-grabbing" : ""
      }`}
    >
      <div className="absolute right-2 top-2 z-10 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        {onOpenDetail && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-indigo-600"
            aria-label="View details"
          >
            ⓘ
          </button>
        )}
        {onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-xs text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-red-600"
            aria-label="Delete task"
          >
            🗑
          </button>
        )}
      </div>

      <p
        className={`pr-14 text-sm text-slate-800 ${
          todo.stage === "completed" ? "text-slate-400 line-through" : ""
        }`}
      >
        {todo.description}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
        <span>{todo.reported_by || "Anonymous"}</span>
        {todo.assigned_to && (
          <span className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-indigo-700">
            {todo.assigned_to}
          </span>
        )}
      </div>

      <div className="mt-1 text-[10px] text-slate-400">
        Last Stage Change: {formatDateTime(todo.last_stage_change ?? todo.created_at)}
      </div>
    </div>
  );
}
