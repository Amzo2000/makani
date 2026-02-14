import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { mapDbProjectToProject, type DbProjectRow } from "@/lib/projects";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = supabaseAdmin();
  const client = admin ?? (await supabaseServer());

  const { data, error } = await client
    .from("projects")
    .select("id,category,year,area,cover_image,images,title,category_label,location,status,description,concept,published")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const project = mapDbProjectToProject(data as DbProjectRow);
  return NextResponse.json({ project });
}
