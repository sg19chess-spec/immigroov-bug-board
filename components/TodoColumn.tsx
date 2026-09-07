"use client";

import { useDroppable } from "@dnd-kit/core";
import { Todo, TodoStage, TODO_STAGE_LABELS } from "@/lib/types";
import TodoCard from "@/components/TodoCard";

const DOT_COLORS: Record<TodoStage, string> = {
  assigned: "bg-slate-400",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
};

export default function TodoColumn({
  stage,
  todos,
  onCardClick,
  onOpenDetail,
  onDelete,
  draggable = true,
  className,
}: {
  stage: TodoStage;
  todos: Todo[];
  onCardClick?: (todo: Todo) => void;
  onOpenDetail: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  draggable?: boolean;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl bg-slate-100/70 p-3 transition ${
        isOver ? "ring-2 ring-indigo-400 bg-indigo-50/60" : ""
      } ${className ?? ""}`}
    >
      <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
        <span className={`h-2 w-2 rounded-full ${DOT_COLORS[stage]}`} />
        {TODO_STAGE_LABELS[stage]}
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
          {todos.length}
        </span>
      </h2>
      <div className="flex min-h-[4rem] flex-col gap-2">
        {todos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 py-6 text-center text-xs text-slate-400">
            No tasks here
          </p>
        ) : (
          todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onClick={() => onCardClick?.(todo)}
              onOpenDetail={() => onOpenDetail(todo)}
              onDelete={() => onDelete(todo)}
              draggable={draggable}
            />
          ))
        )}
      </div>
    </div>
  );
}
