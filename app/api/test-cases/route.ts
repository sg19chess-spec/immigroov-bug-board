import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("test_cases")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { module_id, description, added_by } = body;

  if (!module_id || typeof module_id !== "string") {
    return NextResponse.json({ error: "module_id is required" }, { status: 400 });
  }
  if (!description || typeof description !== "string") {
    return NextResponse.json(
      { error: "description is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("test_cases")
    .insert({ module_id, description, added_by })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
