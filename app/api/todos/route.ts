import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Todo } from "@/lib/types";

async function enrichTodos(todos: Todo[]): Promise<Todo[]> {
  if (todos.length === 0) return todos;
  const ids = todos.map((t) => t.id);

  const { data: history } = await supabase
    .from("task_todo_stage_history")
    .select("todo_id, changed_at")
    .in("todo_id", ids);

  const lastStageChangeByTodo = new Map<string, string>();
  for (const row of history ?? []) {
    const current = lastStageChangeByTodo.get(row.todo_id);
    if (!current || row.changed_at > current) {
      lastStageChangeByTodo.set(row.todo_id, row.changed_at);
    }
  }

  return todos.map((todo) => ({
    ...todo,
    last_stage_change: lastStageChangeByTodo.get(todo.id) ?? todo.created_at,
  }));
}

export async function GET() {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(await enrichTodos(data as Todo[]));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { description, reported_by, assigned_to } = body;

  if (!description || typeof description !== "string") {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("todos")
    .insert({ description, reported_by, assigned_to })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reuse the row's own created_at (same insert, same DB clock) rather than
  // a fresh now() here, so this can never drift from other timestamps.
  await supabase.from("task_todo_stage_history").insert({
    todo_id: data.id,
    from_stage: null,
    to_stage: data.stage,
    changed_by: reported_by ?? null,
    changed_at: data.created_at,
  });

  return NextResponse.json({ ...data, last_stage_change: data.created_at }, { status: 201 });
}
