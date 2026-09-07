import { supabase } from "@/lib/supabase";
import { BugStatus } from "@/lib/types";

/** Updates a task's stage and appends a permanent history record. Never overwrites prior history. */
export async function recordBugStageChange(
  taskId: string,
  fromStage: BugStatus | null,
  toStage: BugStatus,
  changedBy: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from("bugs")
    .update({ status: toStage })
    .eq("id", taskId);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("task_stage_history").insert({
    task_id: taskId,
    from_stage: fromStage,
    to_stage: toStage,
    changed_by: changedBy,
  });
  if (historyError) throw historyError;
}
