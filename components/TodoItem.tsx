"use client";

import { Todo } from "@/lib/types";

export default function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm ${
        todo.done ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo)}
        className="mt-1 h-4 w-4 shrink-0 accent-indigo-600"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm text-slate-800 ${
            todo.done ? "line-through" : ""
          }`}
        >
          {todo.description}
        </p>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
          <span className="font-medium text-slate-500">
            {todo.reported_by || "Anonymous"}
          </span>
          <span>Created {new Date(todo.created_at).toLocaleDateString()}</span>
          {todo.closed_at && (
            <span>Closed {new Date(todo.closed_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(todo)}
        className="shrink-0 rounded-md px-1.5 py-0.5 text-xs text-slate-400 hover:text-red-600"
        aria-label="Delete task"
      >
        🗑
      </button>
    </div>
  );
}
