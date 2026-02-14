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

type VisitEventRow = {
  id: string;
  visitor_token: string;
  visited_at: string;
  path: string;
  referrer: string | null;
  language: string | null;
  timezone: string | null;
  device_type: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

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

  const [
    { count: uniqueVisitorsCount },
    { count: totalVisitsCount },
    { count: visits24hCount },
    { data: recentVisitorsData },
    { data: recentEventsData },
    { data: events7dData },
    { data: events24hData },
  ] = await Promise.all([
    admin.from("site_visits").select("id", { count: "exact", head: true }),
    admin.from("site_visit_events").select("id", { count: "exact", head: true }),
    admin
      .from("site_visit_events")
      .select("id", { count: "exact", head: true })
      .gte("visited_at", last24hIso),
    admin
      .from("site_visits")
      .select("id,visitor_token,first_seen_at,last_seen_at,visits_count,last_path,device_type,last_language,last_timezone,last_referrer")
      .order("last_seen_at", { ascending: false })
      .limit(120),
    admin
      .from("site_visit_events")
      .select("id,visitor_token,visited_at,path,referrer,language,timezone,device_type,utm_source,utm_medium,utm_campaign")
      .order("visited_at", { ascending: false })
      .limit(250),
    admin
      .from("site_visit_events")
      .select("visitor_token,path,visited_at")
      .gte("visited_at", last7dIso)
      .order("visited_at", { ascending: false })
      .limit(5000),
    admin
      .from("site_visit_events")
      .select("visitor_token")
      .gte("visited_at", last24hIso)
      .order("visited_at", { ascending: false })
      .limit(5000),
  ]);

  const recentVisitors = (recentVisitorsData ?? []) as VisitorRow[];
  const recentEvents = (recentEventsData ?? []) as VisitEventRow[];
  const events7d = (events7dData ?? []) as Array<{ visitor_token: string; path: string; visited_at: string }>;
  const events24h = (events24hData ?? []) as Array<{ visitor_token: string }>;

  const pathMap = new Map<string, number>();
  for (const event of events7d) {
    const key = event.path || "/";
    pathMap.set(key, (pathMap.get(key) ?? 0) + 1);
  }

  const topPaths = Array.from(pathMap.entries())
    .map(([path, visits]) => ({ path, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 8);

  const uniqueVisitorsLast7d = new Set(events7d.map((item) => item.visitor_token)).size;
  const uniqueVisitorsLast24h = new Set(events24h.map((item) => item.visitor_token)).size;
  const uniqueVisitors = uniqueVisitorsCount ?? 0;
  const totalVisits = totalVisitsCount ?? 0;

  return (
    <AdminVisitors
      summary={{
        uniqueVisitors,
        totalVisits,
        visitsLast24h: visits24hCount ?? 0,
        uniqueVisitorsLast24h,
        uniqueVisitorsLast7d,
        averageVisitsPerVisitor: uniqueVisitors > 0 ? totalVisits / uniqueVisitors : 0,
      }}
      topPaths={topPaths}
      recentVisitors={recentVisitors}
      recentEvents={recentEvents}
    />
  );
}
