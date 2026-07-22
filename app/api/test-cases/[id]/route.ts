import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { tested, tested_by, description, added_by } = body;

  const update: Record<string, unknown> = {};
  if (description !== undefined) update.description = description;
  if (added_by !== undefined) update.added_by = added_by;
  if (tested !== undefined) {
    update.tested = tested;
    update.tested_by = tested ? tested_by ?? null : null;
    update.tested_at = tested ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from("test_cases")
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

  const { error } = await supabase.from("test_cases").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
