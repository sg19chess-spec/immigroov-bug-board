import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ refId: string }> }
) {
  const { refId } = await params;

  const { data, error } = await supabase
    .from("bugs")
    .select("*")
    .eq("ref_id", refId.toUpperCase())
    .single();

  if (error) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}
