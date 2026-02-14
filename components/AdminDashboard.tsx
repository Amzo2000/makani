"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminDashboard({
  projectCount,
  inquiryCount,
  completedInquiryCount,
  visitorCount,
  monthlyVisitorCount,
  latestInquiries,
}: {
  projectCount: number;
  inquiryCount: number;
  completedInquiryCount: number;
  visitorCount: number;
  monthlyVisitorCount: number;
  latestInquiries: Array<{
    id: string;
    name: string;
    email: string;
    type: string;
    status: string;
    created_at: string;
  }>;
}) {
  const { t } = useLanguage();

  const completionRate = inquiryCount > 0 ? Math.round((completedInquiryCount / inquiryCount) * 100) : 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-light">{t("admin", "dashboard")}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t("admin", "dashboardSubtitle")}</p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <StatCard label={t("admin", "totalProjects")} value={projectCount} />
        <StatCard label={t("admin", "totalInquiries")} value={inquiryCount} />
        <StatCard label={t("admin", "completedInquiries")} value={completedInquiryCount} />
        <StatCard label={t("admin", "totalVisitors")} value={visitorCount} />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-widest text-neutral-400">{t("admin", "monthlyVisitors")}</p>
          <p className="mt-4 text-3xl font-light">{monthlyVisitorCount}</p>
          <p className="mt-2 text-xs text-neutral-500">{t("admin", "uniqueVisitorsHint")}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:col-span-2">
          <p className="text-xs uppercase tracking-widest text-neutral-400">{t("admin", "inquiriesCompletion")}</p>
          <p className="mt-4 text-3xl font-light">{completionRate}%</p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full bg-black" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {completedInquiryCount} / {inquiryCount} {t("admin", "inquiriesCompletedLabel")}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">{t("admin", "latestInquiries")}</h2>
          <Link href="/admin/inquiries" className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black">
            {t("admin", "viewAll")}
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {latestInquiries.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
              <div>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-neutral-400">{item.email}</p>
              </div>
              <div className="text-xs uppercase tracking-widest text-neutral-400">
                {t("admin", `type_${item.type}`)} - {t("admin", `status_${item.status}`)}
              </div>
            </div>
          ))}
          {latestInquiries.length === 0 && (
            <div className="text-sm text-neutral-500">{t("admin", "noInquiries")}</div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <QuickLink href="/admin/projects" title={t("admin", "projects")} description={t("admin", "projectsSubtitle")} />
        <QuickLink href="/admin/inquiries" title={t("admin", "inquiries")} description={t("admin", "inquiriesSubtitle")} />
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-neutral-400">{label}</p>
      <p className="mt-4 text-3xl font-light">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:border-neutral-400 transition-colors">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </Link>
  );
}
