"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, FolderOpen, Image as ImageIcon, MapPin, Pencil, Ruler, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { removeStorageUrls } from "@/lib/projectMedia";

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

export default function AdminProjects({
  initialProjects,
}: {
  initialProjects: ProjectRow[];
}) {
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [scope, setScope] = useState<"all" | "drafts" | "published">("all");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { t, language } = useLanguage();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const bucket = "projects";
  const drafts = projects.filter((project) => !project.published);
  const published = projects.filter((project) => project.published);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchesProject = (project: ProjectRow) => {
    if (!normalizedQuery) return true;
    const statusKey =
      typeof project.status === "string"
        ? project.status
        : project.status?.en || project.status?.fr || project.status?.ar || "";
    const haystack = [
      project.id,
      project.category,
      project.year ?? "",
      project.area ?? "",
      project.title.en,
      project.title.fr,
      project.title.ar,
      project.category_label.en,
      project.category_label.fr,
      project.category_label.ar,
      project.location.en,
      project.location.fr,
      project.location.ar,
      statusKey,
      project.description.en,
      project.description.fr,
      project.description.ar,
      project.concept.en,
      project.concept.fr,
      project.concept.ar,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  };

  const filteredDrafts = drafts.filter(matchesProject);
  const filteredPublished = published.filter(matchesProject);
  const showDrafts = scope === "all" || scope === "drafts";
  const showPublished = scope === "all" || scope === "published";
  const filteredTotal =
    (showDrafts ? filteredDrafts.length : 0) +
    (showPublished ? filteredPublished.length : 0);


  const deleteProject = async (id: string) => {
    if (!confirm(t("admin", "confirmDeleteProject"))) return;
    const target = projects.find((project) => project.id === id);
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      const urls = [target.cover_image, ...target.images].filter(Boolean);
      void removeStorageUrls(supabase, bucket, urls);
    }
  };

  const getPrimaryTitle = (project: ProjectRow) =>
    (language === "fr" ? project.title.fr : language === "ar" ? project.title.ar : project.title.en)?.trim() ||
    project.title.en?.trim() ||
    project.title.fr?.trim() ||
    project.title.ar?.trim();
  const getLocalized = (value: Localized) =>
    value[language] || value.en || value.fr || value.ar || "";
  const getStatusKey = (value: StatusValue) =>
    typeof value === "string" ? value : value?.en || value?.fr || value?.ar || "";
  const getStatusLabel = (value: StatusValue) => {
    const key = getStatusKey(value).trim().toLowerCase();
    if (key === "design") return language === "fr" ? "Conception" : language === "ar" ? "تصميم فقط" : "Design only";
    if (key === "in_progress") return language === "fr" ? "En cours" : language === "ar" ? "قيد التنفيذ" : "In progress";
    if (key === "completed") return language === "fr" ? "Terminé" : language === "ar" ? "مكتمل" : "Completed";
    return key || "";
  };

  const getMissingFields = (project: ProjectRow) => {
    const missing: string[] = [];
    const hasTitle = Boolean(getPrimaryTitle(project));
    const hasLocation =
      Boolean(project.location.en?.trim()) ||
      Boolean(project.location.fr?.trim()) ||
      Boolean(project.location.ar?.trim());
    const hasStatus = Boolean(getStatusKey(project.status).trim());
    const hasDescription =
      Boolean(project.description.en?.trim()) ||
      Boolean(project.description.fr?.trim()) ||
      Boolean(project.description.ar?.trim());
    const hasConcept =
      Boolean(project.concept.en?.trim()) ||
      Boolean(project.concept.fr?.trim()) ||
      Boolean(project.concept.ar?.trim());

    if (!hasTitle) missing.push(t("admin", "fieldTitle"));
    if (!project.category?.trim()) missing.push(t("admin", "fieldCategory"));
    if (!hasLocation) missing.push(t("admin", "fieldLocation"));
    if (!hasStatus) missing.push(t("admin", "fieldStatus"));
    if (!hasDescription) missing.push(t("admin", "fieldDescription"));
    if (!hasConcept) missing.push(t("admin", "fieldConcept"));
    if (!project.cover_image?.trim()) missing.push(t("admin", "fieldCover"));
    if (!project.images || project.images.length === 0) missing.push(t("admin", "fieldImages"));

    return missing;
  };

  const formatDate = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    const locale =
      language === "fr" ? "fr-FR" : language === "ar" ? "ar" : "en-US";
    return parsed.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderProjectPreview = (project: ProjectRow, options?: { draft?: boolean }) => {
    const isDraft = Boolean(options?.draft);
    const primaryTitle = getPrimaryTitle(project);
    const missingFields = getMissingFields(project);
    const hasMissing = missingFields.length > 0;
    const updatedLabel = formatDate(project.updated_at ?? project.created_at);
    const locationLabel = getLocalized(project.location).trim() || "-";
    const statusLabel = getStatusLabel(project.status).trim() || "-";
    const categoryLabel = getLocalized(project.category_label).trim() || project.category?.trim() || "-";

    return (
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
          {project.cover_image?.trim() ? (
            <img
              src={project.cover_image}
              alt={primaryTitle || t("admin", "draftUntitled")}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">
              <ImageIcon size={22} />
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] uppercase tracking-widest ${
                isDraft
                  ? "border border-amber-200 bg-amber-50 text-amber-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {isDraft ? t("admin", "draft") : t("admin", "published")}
            </span>
            {isDraft && hasMissing && (
              <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] uppercase tracking-widest text-orange-700">
                {t("admin", "draftIncomplete")}
              </span>
            )}
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Link
              href={`/projects/${project.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/90 text-neutral-700 backdrop-blur transition-colors hover:text-black"
              aria-label={t("projects", "viewProject")}
              title={t("projects", "viewProject")}
            >
              <ExternalLink size={14} />
            </Link>
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/70 bg-white/90 text-neutral-700 backdrop-blur transition-colors hover:text-black"
              aria-label={t("admin", "edit")}
              title={t("admin", "edit")}
            >
              <Pencil size={14} />
            </Link>
            <button
              type="button"
              onClick={() => deleteProject(project.id)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-red-200 bg-white/95 text-red-600 backdrop-blur transition-colors hover:border-red-400"
              aria-label={t("admin", "delete")}
              title={t("admin", "delete")}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="min-w-0">
            <p className="truncate text-lg font-medium">{primaryTitle || t("admin", "draftUntitled")}</p>
            <p className="mt-1 truncate text-xs text-neutral-500">{project.id}</p>
          </div>

          <div className="grid gap-3 text-xs text-neutral-600 sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <FolderOpen size={13} className="text-neutral-400" />
              <span className="truncate">{categoryLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin size={13} className="text-neutral-400" />
              <span className="truncate">{locationLabel}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={13} className="text-neutral-400" />
              <span>{project.year?.trim() || "-"}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Ruler size={13} className="text-neutral-400" />
              <span>{project.area?.trim() || "-"}</span>
            </span>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-700">
              {statusLabel}
            </span>
            <span>
              {t("admin", "draftAssets")}:{" "}
              <span className="text-neutral-700">
                {project.cover_image ? 1 : 0} + {project.images?.length ?? 0}
              </span>
            </span>
            {updatedLabel && (
              <span>
                {t("admin", "draftUpdated")}: <span className="text-neutral-700">{updatedLabel}</span>
              </span>
            )}
          </div>

          {isDraft && hasMissing && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-700">
              <span className="font-medium">{t("admin", "draftMissingFields")}:</span> {missingFields.join(", ")}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">{t("admin", "projects")}</h1>
          <p className="mt-2 text-sm text-neutral-500">{t("admin", "projectsSubtitle")}</p>
          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-black text-white px-5 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          {t("admin", "createProject")}
        </Link>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("admin", "projectsSearchPlaceholder")}
            className="min-w-[260px] flex-1 border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
          <button
            type="button"
            onClick={() => setScope("all")}
            className={`border px-3 py-2 text-xs uppercase tracking-widest ${
              scope === "all" ? "border-black text-black" : "border-neutral-200 text-neutral-500"
            }`}
          >
            {t("admin", "projectsScopeAll")} ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setScope("drafts")}
            className={`border px-3 py-2 text-xs uppercase tracking-widest ${
              scope === "drafts" ? "border-black text-black" : "border-neutral-200 text-neutral-500"
            }`}
          >
            {t("admin", "drafts")} ({drafts.length})
          </button>
          <button
            type="button"
            onClick={() => setScope("published")}
            className={`border px-3 py-2 text-xs uppercase tracking-widest ${
              scope === "published" ? "border-black text-black" : "border-neutral-200 text-neutral-500"
            }`}
          >
            {t("admin", "published")} ({published.length})
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          {filteredTotal} {t("admin", "projectsSearchResults")}
        </p>
      </section>

      {filteredTotal === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          {t("admin", "projectsSearchEmpty")}
        </div>
      )}

      {showDrafts && filteredTotal > 0 && (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "drafts")}</h2>
          <span className="text-xs text-neutral-400">
            {filteredDrafts.length}/{drafts.length}
          </span>
        </div>
        {filteredDrafts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
            {t("admin", "noDrafts")}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrafts.map((project) => (
            <div key={project.id}>{renderProjectPreview(project, { draft: true })}</div>
          ))}
        </div>
      </section>
      )}

      {showPublished && filteredTotal > 0 && (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "published")}</h2>
          <span className="text-xs text-neutral-400">
            {filteredPublished.length}/{published.length}
          </span>
        </div>
        {filteredPublished.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
            {t("admin", "noPublished")}
          </div>
        )}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPublished.map((project) => (
            <div key={project.id}>{renderProjectPreview(project)}</div>
          ))}
        </div>
      </section>
      )}
    </div>
  );
}


