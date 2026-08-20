import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { BUG_PRIORITIES, BUG_STATUSES, ISSUE_TYPES } from "@/lib/types";
import { normalizeTags } from "@/lib/tags";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    status,
    title,
    description,
    reported_by,
    screenshot_urls,
    priority,
    issue_type,
    tags,
  } = body;

  if (status !== undefined && !BUG_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  if (priority !== undefined && !BUG_PRIORITIES.includes(priority)) {
    return NextResponse.json({ error: "invalid priority" }, { status: 400 });
  }

  if (issue_type !== undefined && !ISSUE_TYPES.includes(issue_type)) {
    return NextResponse.json({ error: "invalid issue_type" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (status !== undefined) update.status = status;
  if (title !== undefined) update.title = title;
  if (description !== undefined) update.description = description;
  if (reported_by !== undefined) update.reported_by = reported_by;
  if (screenshot_urls !== undefined) update.screenshot_urls = screenshot_urls;
  if (priority !== undefined) update.priority = priority;
  if (issue_type !== undefined) update.issue_type = issue_type;
  if (tags !== undefined) update.tags = normalizeTags(tags);

  const { data, error } = await supabase
    .from("bugs")
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

  const { error } = await supabase.from("bugs").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
