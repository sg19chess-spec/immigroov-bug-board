import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("bugs").select("tags");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tags = new Set<string>();
  for (const row of data) {
    for (const tag of row.tags ?? []) {
      tags.add(tag);
    }
  }

  return NextResponse.json([...tags].sort());
}
