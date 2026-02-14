"use client";

import { useLanguage } from "@/context/LanguageContext";

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

type TopPath = {
  path: string;
  visits: number;
};

export default function AdminVisitors({
  summary,
  topPaths,
  recentVisitors,
  recentEvents,
}: {
  summary: {
    uniqueVisitors: number;
    totalVisits: number;
    visitsLast24h: number;
    uniqueVisitorsLast24h: number;
    uniqueVisitorsLast7d: number;
    averageVisitsPerVisitor: number;
  };
  topPaths: TopPath[];
  recentVisitors: VisitorRow[];
  recentEvents: VisitEventRow[];
}) {
  const { language } = useLanguage();
  const locale = language === "fr" ? "fr-FR" : language === "ar" ? "ar" : "en-US";
  const maxPathVisits = topPaths[0]?.visits ?? 1;

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAgo = (value: string) => {
    // eslint-disable-next-line react-hooks/purity
    const ms = Date.now() - new Date(value).getTime();
    const minutes = Math.max(1, Math.round(ms / 60000));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  };

  const shortToken = (token: string) =>
    token.length > 14 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-light">Visitors Analytics</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Real-time overview of traffic quality, visit recency, and behavior.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Unique Visitors" value={summary.uniqueVisitors} hint="Tracked by browser token" />
        <StatCard label="Total Visits" value={summary.totalVisits} hint="All tracked visits (events)" />
        <StatCard label="Visits / Visitor" value={summary.averageVisitsPerVisitor.toFixed(2)} hint="Average frequency" />
        <StatCard label="Visits (24h)" value={summary.visitsLast24h} hint="Last 24 hours" />
        <StatCard label="Unique Visitors (24h)" value={summary.uniqueVisitorsLast24h} hint="Active audience" />
        <StatCard label="Unique Visitors (7d)" value={summary.uniqueVisitorsLast7d} hint="Weekly active audience" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Top Pages (7d)</h2>
            <span className="text-xs uppercase tracking-widest text-neutral-400">By visits</span>
          </div>
          <div className="mt-5 space-y-3">
            {topPaths.length === 0 && <p className="text-sm text-neutral-500">No visit events yet.</p>}
            {topPaths.map((item) => (
              <div key={item.path}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-neutral-700">{item.path}</span>
                  <span className="text-neutral-500">{item.visits}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-neutral-900"
                    style={{ width: `${Math.max(4, Math.round((item.visits / maxPathVisits) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Latest Activity</h2>
            <span className="text-xs uppercase tracking-widest text-neutral-400">{recentEvents.length} events</span>
          </div>
          <div className="mt-5 max-h-[420px] space-y-3 overflow-auto pr-1">
            {recentEvents.length === 0 && <p className="text-sm text-neutral-500">No activity yet.</p>}
            {recentEvents.slice(0, 40).map((event) => (
              <div key={event.id} className="rounded-xl border border-neutral-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-neutral-800">{event.path}</p>
                  <span className="text-xs text-neutral-400">{formatAgo(event.visited_at)}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-neutral-500">
                  <span>{event.device_type || "unknown"}</span>
                  <span>{event.language || "-"}</span>
                  <span>{event.timezone || "-"}</span>
                  {event.utm_source ? <span>utm:{event.utm_source}</span> : null}
                </div>
                <p className="mt-2 truncate text-xs text-neutral-400">Visitor {shortToken(event.visitor_token)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Recent Visitors</h2>
          <span className="text-xs uppercase tracking-widest text-neutral-400">
            Last seen and visit count per visitor
          </span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-400">
                <th className="pb-3 pr-4 font-medium">Visitor</th>
                <th className="pb-3 pr-4 font-medium">Last Visit</th>
                <th className="pb-3 pr-4 font-medium">First Seen</th>
                <th className="pb-3 pr-4 font-medium">Visits</th>
                <th className="pb-3 pr-4 font-medium">Last Path</th>
                <th className="pb-3 pr-4 font-medium">Device</th>
                <th className="pb-3 pr-0 font-medium">Locale / TZ</th>
              </tr>
            </thead>
            <tbody>
              {recentVisitors.map((visitor) => (
                <tr key={visitor.id} className="border-b border-neutral-100 align-top">
                  <td className="py-3 pr-4 font-mono text-xs text-neutral-700">{shortToken(visitor.visitor_token)}</td>
                  <td className="py-3 pr-4 text-neutral-700">
                    <p>{formatDate(visitor.last_seen_at)}</p>
                    <p className="text-xs text-neutral-400">{formatAgo(visitor.last_seen_at)}</p>
                  </td>
                  <td className="py-3 pr-4 text-neutral-500">{formatDate(visitor.first_seen_at)}</td>
                  <td className="py-3 pr-4 text-neutral-700">{visitor.visits_count}</td>
                  <td className="max-w-[280px] truncate py-3 pr-4 text-neutral-600">{visitor.last_path || "-"}</td>
                  <td className="py-3 pr-4 text-neutral-600">{visitor.device_type || "unknown"}</td>
                  <td className="py-3 pr-0 text-neutral-500">
                    <p>{visitor.last_language || "-"}</p>
                    <p className="truncate text-xs text-neutral-400">{visitor.last_timezone || "-"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentVisitors.length === 0 && (
            <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500">
              No visitors tracked yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-light">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    </div>
  );
}
