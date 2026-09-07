import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TODO_STAGES } from "@/lib/types";
import { recordTodoStageChange } from "@/lib/todoStages";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { description, reported_by, assigned_to, stage, changed_by } = body;

  if (stage !== undefined && !TODO_STAGES.includes(stage)) {
    return NextResponse.json({ error: "invalid stage" }, { status: 400 });
  }

  if (stage !== undefined && (typeof changed_by !== "string" || !changed_by.trim())) {
    return NextResponse.json(
      { error: "changed_by is required when changing stage" },
      { status: 400 }
    );
  }

  if (stage !== undefined) {
    const { data: existing, error: fetchError } = await supabase
      .from("todos")
      .select("stage")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (existing.stage !== stage) {
      try {
        await recordTodoStageChange(id, existing.stage, stage, changed_by);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to change stage";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }
  }

  const update: Record<string, unknown> = {};
  if (description !== undefined) update.description = description;
  if (reported_by !== undefined) update.reported_by = reported_by;
  if (assigned_to !== undefined) update.assigned_to = assigned_to;

  if (Object.keys(update).length === 0) {
    const { data, error } = await supabase.from("todos").select("*").eq("id", id).single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("todos")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
