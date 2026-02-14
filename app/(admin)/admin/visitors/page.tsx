import AdminLogin from "@/components/AdminLogin";
import AdminVisitors from "@/components/AdminVisitors";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

type VisitorRow = {
  id: string;
  visitor_token: string;
  first_seen_at: string;
  last_seen_at: string;
  visits_count: number;
  last_path: string | null;
  device_type: string | null;
  last_language: string | null;
  last_timezone: string | null;
  last_referrer: string | null;
};

type Localized = { en?: string; fr?: string; ar?: string };

export default async function AdminVisitorsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const admin = supabaseAdmin();
  if (!admin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700">
        Missing `SUPABASE_SERVICE_ROLE_KEY`. Visitors analytics require server-side admin access.
      </div>
    );
  }

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const last24hIso = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const last7dIso = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: uniqueVisitorsCount }, { data: recentVisitorsData }, { data: summaryVisitorsData }, { data: topStatsData }] =
    await Promise.all([
      admin.from("site_visits").select("id", { count: "exact", head: true }),
      admin
        .from("site_visits")
        .select("id,visitor_token,first_seen_at,last_seen_at,visits_count,last_path,device_type,last_language,last_timezone,last_referrer")
        .order("last_seen_at", { ascending: false })
        .limit(120),
      admin
        .from("site_visits")
        .select("visitor_token,first_seen_at,last_seen_at,visits_count,last_path")
        .order("last_seen_at", { ascending: false })
        .limit(5000),
      admin
        .from("project_view_stats")
        .select("project_id,views_count")
        .order("views_count", { ascending: false })
        .limit(8),
    ]);

  const recentVisitors = (recentVisitorsData ?? []) as VisitorRow[];
  const summaryVisitors = (summaryVisitorsData ?? []) as Array<{
    visitor_token: string;
    first_seen_at: string;
    last_seen_at: string;
    visits_count: number;
    last_path: string | null;
  }>;
  const topStats = (topStatsData ?? []) as Array<{ project_id: string; views_count: number }>;

  let totalVisits = 0;
  for (const visitor of summaryVisitors) {
    totalVisits += visitor.visits_count ?? 0;
  }
  const topProjectIds = topStats.map((item) => item.project_id);

  let projectTitles = new Map<string, Localized>();
  if (topProjectIds.length > 0) {
    const { data: projectsData } = await admin
      .from("projects")
      .select("id,title")
      .in("id", topProjectIds);

    projectTitles = new Map(
      ((projectsData ?? []) as Array<{ id: string; title: Localized | null }>).map((project) => [
        project.id,
        project.title ?? {},
      ])
    );
  }

  const topProducts = topProjectIds.map((projectId) => ({
    id: projectId,
    title: projectTitles.get(projectId) ?? {},
    visits: topStats.find((item) => item.project_id === projectId)?.views_count ?? 0,
  }));

  const activeVisitors24h = summaryVisitors.filter((item) => item.last_seen_at >= last24hIso).length;
  const activeVisitors7d = summaryVisitors.filter((item) => item.last_seen_at >= last7dIso).length;
  const newVisitors7d = summaryVisitors.filter((item) => item.first_seen_at >= last7dIso).length;
  const uniqueVisitors = uniqueVisitorsCount ?? 0;

  return (
    <AdminVisitors
      summary={{
        uniqueVisitors,
        totalVisits,
        activeVisitors24h,
        activeVisitors7d,
        newVisitors7d,
        averageVisitsPerVisitor: uniqueVisitors > 0 ? totalVisits / uniqueVisitors : 0,
      }}
      topProducts={topProducts}
      recentVisitors={recentVisitors}
      renderedAt={now}
    />
  );
}
