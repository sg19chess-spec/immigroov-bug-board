import { supabase } from "@/lib/supabase";
import { TodoStage } from "@/lib/types";

/** Updates a to-do's stage and appends a permanent history record. Never overwrites prior history. */
export async function recordTodoStageChange(
  todoId: string,
  fromStage: TodoStage | null,
  toStage: TodoStage,
  changedBy: string
): Promise<void> {
  // Use one timestamp for both writes: the todos row and its history entry
  // must agree exactly, or duration math between them (e.g. Active
  // Completion Time) can go negative from cross-request clock drift.
  const changedAt = new Date().toISOString();
  const update: Record<string, unknown> = { stage: toStage };
  if (toStage === "in_progress") update.in_progress_at = changedAt;
  if (toStage === "completed") update.completed_at = changedAt;

  const { error: updateError } = await supabase.from("todos").update(update).eq("id", todoId);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("task_todo_stage_history").insert({
    todo_id: todoId,
    from_stage: fromStage,
    to_stage: toStage,
    changed_by: changedBy,
    changed_at: changedAt,
  });
  if (historyError) throw historyError;
}
