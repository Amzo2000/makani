import AdminLogin from "@/components/AdminLogin";
import AdminProjects from "@/components/AdminProjects";
import { supabaseServer } from "@/lib/supabase/server";

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
  created_at?: string;
  updated_at?: string;
};

export default async function AdminProjectsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminProjects initialProjects={(projects ?? []) as ProjectRow[]} />;
}
