import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { TEST_ENVIRONMENTS } from "@/lib/types";
import { parseCommitInput } from "@/lib/commit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("task_testing")
    .select("*")
    .eq("task_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { environment, commit, assigned_tester, ready_by, notes } = body;

  if (!TEST_ENVIRONMENTS.includes(environment)) {
    return NextResponse.json({ error: "invalid environment" }, { status: 400 });
  }

  if (typeof commit !== "string" || !commit.trim()) {
    return NextResponse.json({ error: "commit is required" }, { status: 400 });
  }

  if (typeof ready_by !== "string" || !ready_by.trim()) {
    return NextResponse.json({ error: "ready_by is required" }, { status: 400 });
  }

  const { sha, url } = parseCommitInput(commit);

  const { data, error } = await supabase
    .from("task_testing")
    .insert({
      task_id: id,
      environment,
      commit_sha: sha,
      commit_url: url,
      assigned_tester: assigned_tester || null,
      ready_by,
      test_notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
