import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { mapDbProjectToProject, type DbProjectRow } from "@/lib/projects";

export async function GET() {
  const admin = supabaseAdmin();
  const client = admin ?? (await supabaseServer());

  const [{ data: projectsData, error: projectsError }, { data: categoriesData, error: categoriesError }] =
    await Promise.all([
      client
        .from("projects")
        .select("id,category,year,area,cover_image,images,title,category_label,location,status,description,concept,published")
        .eq("published", true)
        .order("created_at", { ascending: false }),
      client
        .from("categories")
        .select("key")
        .eq("is_active", true),
    ]);

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }
  if (categoriesError) {
    return NextResponse.json({ error: categoriesError.message }, { status: 500 });
  }

  const activeKeys = new Set((categoriesData ?? []).map((item) => item.key));
  const projects = ((projectsData ?? []) as DbProjectRow[])
    .filter((row) => activeKeys.has(row.category))
    .map(mapDbProjectToProject);

  return NextResponse.json({ projects });
}
