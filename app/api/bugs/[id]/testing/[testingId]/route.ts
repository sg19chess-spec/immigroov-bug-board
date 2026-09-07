import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { recordBugStageChange } from "@/lib/boardStages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; testingId: string }> }
) {
  const { id, testingId } = await params;
  const body = await request.json();
  const { result, tested_by, test_notes } = body;

  if (result !== "passed" && result !== "failed") {
    return NextResponse.json({ error: "result must be 'passed' or 'failed'" }, { status: 400 });
  }

  if (typeof tested_by !== "string" || !tested_by.trim()) {
    return NextResponse.json({ error: "tested_by is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("task_testing")
    .update({
      status: result,
      tested_by,
      tested_at: new Date().toISOString(),
      test_notes: test_notes || null,
    })
    .eq("id", testingId)
    .eq("task_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (result === "passed") {
    const { data: bug, error: bugError } = await supabase
      .from("bugs")
      .select("status")
      .eq("id", id)
      .single();

    if (bugError) {
      return NextResponse.json({ error: bugError.message }, { status: 500 });
    }

    if (bug.status === "to_be_tested") {
      try {
        await recordBugStageChange(id, "to_be_tested", "tested", tested_by);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to move to Tested";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  }

  return NextResponse.json(data);
}
