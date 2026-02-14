import AdminCategories from "@/components/AdminCategories";
import AdminLogin from "@/components/AdminLogin";
import type { CategoryRow } from "@/lib/categories";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminCategoriesPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id,key,label,sort_order,is_active")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return <AdminCategories initialCategories={(categories ?? []) as CategoryRow[]} />;
}
