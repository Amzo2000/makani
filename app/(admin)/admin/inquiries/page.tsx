import AdminLogin from "@/components/AdminLogin";
import AdminInquiries from "@/components/AdminInquiries";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminInquiriesPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminInquiries initialInquiries={(inquiries ?? []) as any} />;
}
