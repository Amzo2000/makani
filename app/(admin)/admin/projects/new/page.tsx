import AdminLogin from "@/components/AdminLogin";
import AdminProjectCreate from "@/components/AdminProjectCreate";
import type { CategoryRow } from "@/lib/categories";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminProjectCreatePage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const admin = supabaseAdmin();
  let categories: CategoryRow[] = [];
  if (admin) {
    const { data, error } = await admin
      .from("categories")
      .select("id,key,label,sort_order,is_active")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to load categories for project creation", error.message);
    }
    categories = (data ?? []) as CategoryRow[];
  } else {
    console.error("Supabase admin client unavailable for project creation categories");
  }

  return <AdminProjectCreate categories={categories} />;
}
