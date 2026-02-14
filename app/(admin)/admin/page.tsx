import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function AdminPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const { count: projectCount } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  const { count: inquiryCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true });

  const { count: completedInquiryCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .in("status", ["replied", "archived"]);

  const { data: latestInquiries } = await supabase
    .from("inquiries")
    .select("id,name,email,type,status,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  let visitorCount = 0;
  let monthlyVisitorCount = 0;
  const adminClient = supabaseAdmin();

  if (adminClient) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [{ count: allVisitors }, { count: monthVisitors }] = await Promise.all([
      adminClient.from("site_visits").select("id", { count: "exact", head: true }),
      adminClient
        .from("site_visits")
        .select("id", { count: "exact", head: true })
        .gte("first_seen_at", monthStart.toISOString()),
    ]);

    visitorCount = allVisitors ?? 0;
    monthlyVisitorCount = monthVisitors ?? 0;
  }

  return (
    <AdminDashboard
      projectCount={projectCount ?? 0}
      inquiryCount={inquiryCount ?? 0}
      completedInquiryCount={completedInquiryCount ?? 0}
      visitorCount={visitorCount}
      monthlyVisitorCount={monthlyVisitorCount}
      latestInquiries={latestInquiries ?? []}
    />
  );
}
