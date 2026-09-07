import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizeTags } from "@/lib/tags";
import { Bug, TestingEntry } from "@/lib/types";

async function enrichBugs(bugs: Bug[]): Promise<Bug[]> {
  if (bugs.length === 0) return bugs;
  const ids = bugs.map((b) => b.id);

  const [{ data: history }, { data: pendingTests }] = await Promise.all([
    supabase
      .from("task_stage_history")
      .select("task_id, changed_at")
      .in("task_id", ids),
    supabase
      .from("task_testing")
      .select("*")
      .in("task_id", ids)
      .eq("status", "pending"),
  ]);

  const lastStageChangeByTask = new Map<string, string>();
  for (const row of history ?? []) {
    const current = lastStageChangeByTask.get(row.task_id);
    if (!current || row.changed_at > current) {
      lastStageChangeByTask.set(row.task_id, row.changed_at);
    }
  }

  const pendingTestByTask = new Map<string, TestingEntry>();
  for (const row of (pendingTests ?? []) as TestingEntry[]) {
    const current = pendingTestByTask.get(row.task_id);
    if (!current || row.ready_at > current.ready_at) {
      pendingTestByTask.set(row.task_id, row);
    }
  }

  return bugs.map((bug) => ({
    ...bug,
    last_stage_change: lastStageChangeByTask.get(bug.id) ?? bug.created_at,
    pending_test: pendingTestByTask.get(bug.id) ?? null,
  }));
}

export async function GET() {
  const { data, error } = await supabase
    .from("bugs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(await enrichBugs(data as Bug[]));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    title,
    description,
    screenshot_urls,
    reported_by,
    handled_by,
    priority,
    issue_type,
    tags,
  } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bugs")
    .insert({
      title,
      description,
      screenshot_urls,
      reported_by,
      handled_by,
      priority,
      issue_type,
      tags: normalizeTags(tags),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reuse the row's own created_at (same insert, same DB clock) rather than
  // a fresh now() here, so this can never drift from other timestamps.
  await supabase.from("task_stage_history").insert({
    task_id: data.id,
    from_stage: null,
    to_stage: data.status,
    changed_by: reported_by ?? null,
    changed_at: data.created_at,
  });

  return NextResponse.json({ ...data, last_stage_change: data.created_at }, { status: 201 });
}
