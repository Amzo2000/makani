import AdminLogin from "@/components/AdminLogin";
import AdminProjectEdit from "@/components/AdminProjectEdit";
import type { CategoryRow } from "@/lib/categories";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

type Localized = { en: string; fr: string; ar: string };
type StatusValue = Localized | string | null;

type ProjectRow = {
  id: string;
  title: Localized;
  category: string;
  category_label: Localized;
  location: Localized;
  year: string | null;
  area: string | null;
  status: StatusValue;
  description: Localized;
  concept: Localized;
  cover_image: string;
  images: string[];
  published: boolean;
};

export default async function AdminProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const admin = supabaseAdmin();
  const [projectResult, categoriesResult] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    admin
      ? admin
          .from("categories")
          .select("id,key,label,sort_order,is_active")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: null, error: new Error("admin client unavailable") }),
  ]);
  const { data: project } = projectResult;
  const { data: categories, error: categoriesError } = categoriesResult;

  if (!project) {
    notFound();
  }
  if (categoriesError) {
    console.error("Failed to load categories for project edit", categoriesError.message);
  }

  return (
    <AdminProjectEdit
      initialProject={project as ProjectRow}
      categories={((categories as CategoryRow[] | null) ?? [])}
    />
  );
}
