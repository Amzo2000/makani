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
};

type TopProduct = {
  id: string;
  title: { en?: string; fr?: string; ar?: string };
  visits: number;
};

export default function AdminVisitors({
  summary,
  topProducts,
  recentVisitors,
  renderedAt,
}: {
  summary: {
    uniqueVisitors: number;
    totalVisits: number;
    activeVisitors24h: number;
    activeVisitors7d: number;
    newVisitors7d: number;
    averageVisitsPerVisitor: number;
  };
  topProducts: TopProduct[];
  recentVisitors: VisitorRow[];
  renderedAt: number;
}) {
  const { language } = useLanguage();
  const locale = language === "fr" ? "fr-FR" : language === "ar" ? "ar" : "en-US";
  const maxProductVisits = topProducts[0]?.visits ?? 1;
  const labels =
    language === "fr"
      ? {
          title: "Analyse visiteurs",
          subtitle: "Vue moderne du trafic, des produits les plus visites et des derniers passages.",
          uniqueVisitors: "Visiteurs uniques",
          totalVisits: "Visites totales",
          avgVisits: "Visites / visiteur",
          active24h: "Actifs (24h)",
          active7d: "Actifs (7j)",
          new7d: "Nouveaux (7j)",
          trackedByToken: "Suivi par token navigateur",
          allVisits: "Somme des visites cumulees",
          averageFrequency: "Frequence moyenne",
          last24h: "Dernieres 24h",
          last7d: "Derniers 7 jours",
          firstSeen7d: "Premiere visite sur 7 jours",
          topProducts: "Produits les plus visites",
          byVisitors: "Par visiteurs",
          noTopProducts: "Aucune donnee produit.",
          visitorsTableTitle: "Visiteurs recents",
          visitorsTableSubtitle: "Dernier passage et frequence par visiteur",
          colVisitor: "Visiteur",
          colLastVisit: "Derniere visite",
          colFirstSeen: "Premiere visite",
          colVisits: "Visites",
          colLastPath: "Derniere page",
          colDevice: "Appareil",
          colLocaleTz: "Langue / TZ",
          noVisitors: "Aucun visiteur suivi.",
          agoMin: "min",
          agoHour: "h",
          agoDay: "j",
          agoSuffix: "il y a",
          unknown: "inconnu",
        }
      : language === "ar"
        ? {
            title: "تحليلات الزوار",
            subtitle: "عرض حديث لحركة الزوار والمنتجات الاكثر زيارة واخر الزيارات.",
            uniqueVisitors: "زوار فريدون",
            totalVisits: "اجمالي الزيارات",
            avgVisits: "زيارات / زائر",
            active24h: "نشطون (24 ساعة)",
            active7d: "نشطون (7 ايام)",
            new7d: "جدد (7 ايام)",
            trackedByToken: "تتبع بواسطة رمز المتصفح",
            allVisits: "مجموع الزيارات التراكمي",
            averageFrequency: "متوسط التكرار",
            last24h: "اخر 24 ساعة",
            last7d: "اخر 7 ايام",
            firstSeen7d: "اول زيارة خلال 7 ايام",
            topProducts: "المنتجات الاكثر زيارة",
            byVisitors: "حسب عدد الزوار",
            noTopProducts: "لا توجد بيانات منتجات.",
            visitorsTableTitle: "اخر الزوار",
            visitorsTableSubtitle: "اخر زيارة وتكرار الزيارة لكل زائر",
            colVisitor: "الزائر",
            colLastVisit: "اخر زيارة",
            colFirstSeen: "اول زيارة",
            colVisits: "الزيارات",
            colLastPath: "اخر صفحة",
            colDevice: "الجهاز",
            colLocaleTz: "اللغة / المنطقة الزمنية",
            noVisitors: "لا يوجد زوار بعد.",
            agoMin: "د",
            agoHour: "س",
            agoDay: "ي",
            agoSuffix: "منذ",
            unknown: "غير معروف",
          }
        : {
            title: "Visitors Analytics",
            subtitle: "Modern overview of traffic, top products visited, and latest visitor recency.",
            uniqueVisitors: "Unique Visitors",
            totalVisits: "Total Visits",
            avgVisits: "Visits / Visitor",
            active24h: "Active (24h)",
            active7d: "Active (7d)",
            new7d: "New (7d)",
            trackedByToken: "Tracked by browser token",
            allVisits: "Sum of cumulative visits",
            averageFrequency: "Average frequency",
            last24h: "Last 24 hours",
            last7d: "Last 7 days",
            firstSeen7d: "First seen within 7 days",
            topProducts: "Top Products Visited",
            byVisitors: "By visitors",
            noTopProducts: "No product visit data yet.",
            visitorsTableTitle: "Recent Visitors",
            visitorsTableSubtitle: "Last seen and visit count per visitor",
            colVisitor: "Visitor",
            colLastVisit: "Last Visit",
            colFirstSeen: "First Seen",
            colVisits: "Visits",
            colLastPath: "Last Path",
            colDevice: "Device",
            colLocaleTz: "Locale / TZ",
            noVisitors: "No visitors tracked yet.",
            agoMin: "m",
            agoHour: "h",
            agoDay: "d",
            agoSuffix: "ago",
            unknown: "unknown",
          };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatAgo = (value: string) => {
    const ms = renderedAt - new Date(value).getTime();
    const minutes = Math.max(1, Math.round(ms / 60000));
    if (minutes < 60) return `${labels.agoSuffix} ${minutes}${labels.agoMin}`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${labels.agoSuffix} ${hours}${labels.agoHour}`;
    const days = Math.round(hours / 24);
    return `${labels.agoSuffix} ${days}${labels.agoDay}`;
  };

  const shortToken = (token: string) =>
    token.length > 14 ? `${token.slice(0, 6)}...${token.slice(-4)}` : token;

  const productLabel = (product: TopProduct) =>
    (language === "fr" ? product.title.fr : language === "ar" ? product.title.ar : product.title.en) ||
    product.title.en ||
    product.title.fr ||
    product.title.ar ||
    `#${product.id.slice(0, 8)}`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-light">{labels.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{labels.subtitle}</p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard label={labels.uniqueVisitors} value={summary.uniqueVisitors} hint={labels.trackedByToken} />
        <StatCard label={labels.totalVisits} value={summary.totalVisits} hint={labels.allVisits} />
        <StatCard label={labels.avgVisits} value={summary.averageVisitsPerVisitor.toFixed(2)} hint={labels.averageFrequency} />
        <StatCard label={labels.active24h} value={summary.activeVisitors24h} hint={labels.last24h} />
        <StatCard label={labels.active7d} value={summary.activeVisitors7d} hint={labels.last7d} />
        <StatCard label={labels.new7d} value={summary.newVisitors7d} hint={labels.firstSeen7d} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{labels.topProducts}</h2>
          <span className="text-xs uppercase tracking-widest text-neutral-400">{labels.byVisitors}</span>
        </div>
        <div className="mt-5 space-y-3">
          {topProducts.length === 0 && <p className="text-sm text-neutral-500">{labels.noTopProducts}</p>}
          {topProducts.map((item) => (
            <div key={item.id}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-neutral-700">{productLabel(item)}</span>
                <span className="text-neutral-500">{item.visits}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-900"
                  style={{ width: `${Math.max(4, Math.round((item.visits / maxProductVisits) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium">{labels.visitorsTableTitle}</h2>
          <span className="text-xs uppercase tracking-widest text-neutral-400">{labels.visitorsTableSubtitle}</span>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-xs uppercase tracking-widest text-neutral-400">
                <th className="pb-3 pr-4 font-medium">{labels.colVisitor}</th>
                <th className="pb-3 pr-4 font-medium">{labels.colLastVisit}</th>
                <th className="pb-3 pr-4 font-medium">{labels.colFirstSeen}</th>
                <th className="pb-3 pr-4 font-medium">{labels.colVisits}</th>
                <th className="pb-3 pr-4 font-medium">{labels.colLastPath}</th>
                <th className="pb-3 pr-4 font-medium">{labels.colDevice}</th>
                <th className="pb-3 pr-0 font-medium">{labels.colLocaleTz}</th>
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
                  <td className="py-3 pr-4 text-neutral-600">{visitor.device_type || labels.unknown}</td>
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
              {labels.noVisitors}
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
