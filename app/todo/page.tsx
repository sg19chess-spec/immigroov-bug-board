"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { supabase } from "@/lib/supabase";
import { Todo, TodoStage, TODO_STAGES } from "@/lib/types";
import AddTodoForm from "@/components/AddTodoForm";
import TodoColumn from "@/components/TodoColumn";
import TodoMoveSheet from "@/components/TodoMoveSheet";
import TodoDetailModal from "@/components/TodoDetailModal";
import { useRequireActingPerson } from "@/components/ActingAsProvider";
import { useIsDesktop } from "@/lib/useIsDesktop";

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TodoStage>("assigned");
  const [movingTodo, setMovingTodo] = useState<Todo | null>(null);
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);
  const requirePerson = useRequireActingPerson();
  const isDesktop = useIsDesktop();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    fetch("/api/todos")
      .then((res) => res.json())
      .then((data) => {
        setTodos(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("todos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTodos((prev) =>
              prev.some((t) => t.id === payload.new.id)
                ? prev
                : [payload.new as Todo, ...prev]
            );
          } else if (payload.eventType === "UPDATE") {
            setTodos((prev) =>
              prev.map((t) => (t.id === payload.new.id ? { ...t, ...payload.new } : t))
            );
          } else if (payload.eventType === "DELETE") {
            setTodos((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStage(id: string, stage: TodoStage) {
    let changedBy: string;
    try {
      changedBy = await requirePerson();
    } catch {
      return; // user cancelled the "who's this?" prompt
    }

    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, stage } : t)));

    const res = await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, changed_by: changedBy }),
    });

    if (!res.ok) {
      const fresh = await fetch("/api/todos").then((r) => r.json());
      setTodos(fresh);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const todoId = active.id as string;
    const newStage = over.id as TodoStage;
    const todo = todos.find((t) => t.id === todoId);

    if (todo && todo.stage !== newStage) {
      updateStage(todoId, newStage);
    }
  }

  function handleDelete(todo: Todo) {
    if (!confirm("Delete this task?")) return;

    setTodos((prev) => prev.filter((t) => t.id !== todo.id));
    fetch(`/api/todos/${todo.id}`, { method: "DELETE" }).then(async (res) => {
      if (!res.ok) {
        const fresh = await fetch("/api/todos").then((r) => r.json());
        setTodos(fresh);
      }
    });
  }

  const grouped = TODO_STAGES.reduce<Record<TodoStage, Todo[]>>(
    (acc, stage) => {
      acc[stage] = todos
        .filter((t) => t.stage === stage)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
      return acc;
    },
    { assigned: [], in_progress: [], completed: [] }
  );

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading tasks...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-4 pb-24 md:p-6 md:pb-10">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
          To-Do List
        </h1>
        <p className="text-sm text-slate-500">
          Track who a task is assigned to and where it stands.
        </p>
      </div>

      <AddTodoForm onAdded={(todo) => setTodos((prev) => [todo, ...prev])} />

      {/* Mobile tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
        {TODO_STAGES.map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveTab(stage)}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeTab === stage
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {stage === "assigned" ? "Assigned" : stage === "in_progress" ? "In Progress" : "Completed"} (
            {grouped[stage].length})
          </button>
        ))}
      </div>

      {isDesktop ? (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 sm:grid-cols-3">
            {TODO_STAGES.map((stage) => (
              <TodoColumn
                key={stage}
                stage={stage}
                todos={grouped[stage]}
                onOpenDetail={setDetailTodo}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </DndContext>
      ) : (
        <TodoColumn
          stage={activeTab}
          todos={grouped[activeTab]}
          onCardClick={(todo) => setMovingTodo(todo)}
          onOpenDetail={setDetailTodo}
          onDelete={handleDelete}
          draggable={false}
        />
      )}

      {movingTodo && (
        <TodoMoveSheet
          todo={movingTodo}
          onMove={(stage) => updateStage(movingTodo.id, stage)}
          onClose={() => setMovingTodo(null)}
        />
      )}

      {detailTodo && (
        <TodoDetailModal todo={detailTodo} onClose={() => setDetailTodo(null)} />
      )}
    </div>
  );
}
