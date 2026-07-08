"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Todo } from "@/lib/types";
import AddTodoForm from "@/components/AddTodoForm";
import TodoItem from "@/components/TodoItem";

const PAGE_SIZE = 8;

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

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
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Todo) : t
              )
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

  async function handleToggle(todo: Todo) {
    const done = !todo.done;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === todo.id
          ? { ...t, done, closed_at: done ? new Date().toISOString() : null }
          : t
      )
    );

    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });

    if (!res.ok) {
      const fresh = await fetch("/api/todos").then((r) => r.json());
      setTodos(fresh);
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

  const open = todos
    .filter((t) => !t.done)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const done = todos
    .filter((t) => t.done)
    .sort((a, b) =>
      (b.closed_at ?? b.created_at).localeCompare(a.closed_at ?? a.created_at)
    );

  const combined = [...open, ...done];
  const totalPages = Math.max(1, Math.ceil(combined.length / PAGE_SIZE));
  const pageItems = combined.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (loading) {
    return <div className="p-6 text-sm text-slate-400">Loading tasks...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-4 md:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900 md:text-2xl">
          To-Do List
        </h1>
        <p className="text-sm text-slate-500">
          Open tasks first, completed tasks at the bottom.
        </p>
      </div>

      <AddTodoForm
        onAdded={(todo) => {
          setTodos((prev) => [todo, ...prev]);
          setPage(1);
        }}
      />

      {combined.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
          No tasks yet
        </p>
      ) : (
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
          {pageItems.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg px-3 py-1.5 text-slate-600 ring-1 ring-slate-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
