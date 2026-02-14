import AdminShell from "@/components/AdminShell";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  return <AdminShell showNavigation={isAdmin}>{children}</AdminShell>;
}
