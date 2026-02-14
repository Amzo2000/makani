"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import ProjectForm, { toPayload, type ProjectDraft } from "@/components/ProjectForm";
import type { CategoryRow } from "@/lib/categories";
import { translateToAll, type UiLanguage } from "@/lib/mymemoryTranslate";
import {
  createProjectMediaDraft,
  hasLocalImages,
  removeStorageUrls,
  revokeMediaDraft,
  uploadFileToStorage,
  type ProjectMediaDraft,
} from "@/lib/projectMedia";

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
};

const isMultiLocalized = (value: Localized) => value.en !== value.fr || value.en !== value.ar;
const normalizeStatusKey = (value: StatusValue): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || value.fr || value.ar || "";
};

const resolveProjectMode = (project: ProjectRow): "global" | "multi" =>
  isMultiLocalized(project.title) ||
  isMultiLocalized(project.category_label) ||
  isMultiLocalized(project.location) ||
  isMultiLocalized(project.description) ||
  isMultiLocalized(project.concept)
    ? "multi"
    : "global";

const pickLocalized = (value: Localized, language: UiLanguage): string =>
  (language === "fr" ? value.fr : language === "ar" ? value.ar : value.en) || value.en || value.fr || value.ar || "";

const toDraft = (project: ProjectRow, language: UiLanguage): ProjectDraft => ({
  category: project.category,
  year: project.year ?? "",
  area: project.area ?? "",
  cover_image: project.cover_image,
  images: project.images.join("\n"),
  published: project.published,
  title_en: pickLocalized(project.title, language),
  title_fr: project.title.fr,
  title_ar: project.title.ar,
  category_label_en: pickLocalized(project.category_label, language),
  category_label_fr: project.category_label.fr,
  category_label_ar: project.category_label.ar,
  location_en: pickLocalized(project.location, language),
  location_fr: project.location.fr,
  location_ar: project.location.ar,
  status_en: normalizeStatusKey(project.status) || "design",
  status_fr: normalizeStatusKey(project.status) || "design",
  status_ar: normalizeStatusKey(project.status) || "design",
  description_en: pickLocalized(project.description, language),
  description_fr: project.description.fr,
  description_ar: project.description.ar,
  concept_en: pickLocalized(project.concept, language),
  concept_fr: project.concept.fr,
  concept_ar: project.concept.ar,
});

export default function AdminProjectEdit({
  initialProject,
  categories,
}: {
  initialProject: ProjectRow;
  categories: CategoryRow[];
}) {
  const { t, language } = useLanguage();
  const sourceLanguage = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;
  const [editDraft, setEditDraft] = useState<ProjectDraft>(() => toDraft(initialProject, sourceLanguage));
  const [editMedia, setEditMedia] = useState<ProjectMediaDraft>(() =>
    createProjectMediaDraft(initialProject.cover_image, initialProject.images)
  );
  const [editMode, setEditMode] = useState<"global" | "multi">(() => resolveProjectMode(initialProject));
  const [busy, setBusy] = useState(false);
  const [saveStage, setSaveStage] = useState<"idle" | "uploading" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ percent: number; label: string } | null>(null);

  const router = useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const editMediaRef = useRef(editMedia);
  const bucket = "projects";
  const progressLabel = {
    preparing: language === "fr" ? "Preparation de la modification..." : language === "ar" ? "جار تحضير التعديل..." : "Preparing update...",
    uploading: language === "fr" ? "Televersement des medias..." : language === "ar" ? "جار رفع الوسائط..." : "Uploading media...",
    saving: language === "fr" ? "Enregistrement du projet..." : language === "ar" ? "جار حفظ المشروع..." : "Saving project...",
    done: language === "fr" ? "Termine." : language === "ar" ? "اكتمل." : "Completed.",
    translating: (field: string) =>
      language === "fr"
        ? `Traduction de ${field}...`
        : language === "ar"
          ? `جار ترجمة ${field}...`
          : `Translating ${field}...`,
  };

  useEffect(() => {
    editMediaRef.current = editMedia;
  }, [editMedia]);

  useEffect(() => {
    return () => {
      revokeMediaDraft(editMediaRef.current);
    };
  }, []);

  const validateForPublish = () => {
    const missing: string[] = [];
    const pushIfEmpty = (value: string, key: string) => {
      if (!value || value.trim().length === 0) {
        missing.push(key);
      }
    };

    pushIfEmpty(editDraft.category, "fieldCategory");
    if (!editMedia.cover) {
      missing.push("fieldCover");
    }
    pushIfEmpty(editDraft.title_en, "fieldTitle");
    pushIfEmpty(editDraft.location_en, "fieldLocation");
    pushIfEmpty(editDraft.status_en, "fieldStatus");
    pushIfEmpty(editDraft.description_en, "fieldDescription");
    pushIfEmpty(editDraft.concept_en, "fieldConcept");

    setFormErrors(missing);
    return missing.length === 0;
  };

  const buildTranslatedDraft = async (draft: ProjectDraft) => {
    const source = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;
    const fields: Array<"title" | "location" | "description" | "concept"> = [
      "title",
      "location",
      "description",
      "concept",
    ];
    const fieldLabels: Record<(typeof fields)[number], string> = {
      title: t("admin", "fieldTitle"),
      location: t("admin", "fieldLocation"),
      description: t("admin", "fieldDescription"),
      concept: t("admin", "fieldConcept"),
    };

    const next = { ...draft };
    for (let index = 0; index < fields.length; index += 1) {
      const field = fields[index];
      const base = (next[`${field}_en` as keyof ProjectDraft] as string) ?? "";
      setProgress({
        percent: 12 + Math.round(((index + 1) / fields.length) * 32),
        label: progressLabel.translating(fieldLabels[field]),
      });
      const translated = await translateToAll(base, source);
      next[`${field}_en` as keyof ProjectDraft] = translated.en as never;
      next[`${field}_fr` as keyof ProjectDraft] = translated.fr as never;
      next[`${field}_ar` as keyof ProjectDraft] = translated.ar as never;
    }
    return next;
  };

  const uploadMedia = async (media: ProjectMediaDraft) => {
    const uploadedUrls: string[] = [];
    const uploadLocal = async (file: File) => {
      const url = await uploadFileToStorage(supabase, bucket, file);
      uploadedUrls.push(url);
      return url;
    };

    try {
      const coverImage = media.cover
        ? media.cover.kind === "remote"
          ? media.cover.url
          : await uploadLocal(media.cover.file)
        : "";

      const galleryImages = await Promise.all(
        media.gallery.map(async (image) => {
          if (image.kind === "remote") return image.url;
          return uploadLocal(image.file);
        })
      );

      return {
        coverImage,
        galleryImages,
        uploadedUrls,
      };
    } catch (uploadError) {
      await removeStorageUrls(supabase, bucket, uploadedUrls);
      throw uploadError;
    }
  };

  const handleSave = async (publish: boolean) => {
    setBusy(true);
    setSaveStage("uploading");
    setError(null);
    setFormErrors([]);
    setProgress({ percent: 8, label: progressLabel.preparing });

    if (publish && !validateForPublish()) {
      setBusy(false);
      setSaveStage("idle");
      setProgress(null);
      return;
    }

    try {
      const translatedDraft = await buildTranslatedDraft(editDraft);
      setProgress({ percent: 52, label: progressLabel.uploading });
      const mediaResult = await uploadMedia(editMedia);
      setSaveStage("saving");
      setProgress({ percent: 84, label: progressLabel.saving });

      const payload = toPayload(
        {
          ...translatedDraft,
          cover_image: mediaResult.coverImage,
          images: mediaResult.galleryImages.join("\n"),
          published: publish,
        },
        editMode
      );

      const { error: saveError } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", initialProject.id)
        .select()
        .single();

      if (saveError) {
        await removeStorageUrls(supabase, bucket, mediaResult.uploadedUrls);
        setError(saveError.message);
        setProgress(null);
        return;
      }

      await removeStorageUrls(supabase, bucket, editMedia.removedRemoteUrls);
      setProgress({ percent: 100, label: progressLabel.done });
      router.push("/admin/projects");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update project");
    } finally {
      setBusy(false);
      setSaveStage("idle");
      window.setTimeout(() => setProgress(null), 600);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-400 hover:text-black"
        >
          <ArrowLeft size={14} /> {t("admin", "backToProjects")}
        </Link>
        <h1 className="text-3xl font-light">{t("admin", "edit")}</h1>
        <p className="text-sm text-neutral-500">{initialProject.id}</p>
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        {formErrors.length > 0 && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {t("admin", "publishValidation")}
          </div>
        )}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <ProjectForm
          draft={editDraft}
          onChange={setEditDraft}
          mode={editMode}
          onModeChange={setEditMode}
          media={editMedia}
          onMediaChange={setEditMedia}
          categories={categories}
          disabled={busy}
        />
        {busy && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs uppercase tracking-widest text-neutral-600">
            {saveStage === "uploading" ? t("admin", "uploading") : t("admin", "saving")}
          </div>
        )}
        {progress && (
          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500">
              <span>{progress.label}</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-black transition-all duration-300" style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleSave(true)}
            className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            {busy ? (saveStage === "uploading" ? t("admin", "uploading") : t("admin", "saving")) : t("admin", "publish")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleSave(false)}
            className="border border-neutral-300 px-6 py-3 text-xs uppercase tracking-widest"
          >
            {busy ? (saveStage === "uploading" ? t("admin", "uploading") : t("admin", "saving")) : t("admin", "saveDraft")}
          </button>
          <Link
            href="/admin/projects"
            aria-disabled={busy}
            className={`border border-neutral-200 px-6 py-3 text-xs uppercase tracking-widest text-neutral-500 ${busy ? "pointer-events-none opacity-50" : ""}`}
          >
            {t("admin", "cancel")}
          </Link>
        </div>
      </section>

      {hasLocalImages(editMedia) && (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-xs text-neutral-500">
          {t("admin", "draftUploadsNote")}
        </div>
      )}
    </div>
  );
}
