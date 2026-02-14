"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { CategoryRow } from "@/lib/categories";
import {
  createLocalMediaImage,
  getMediaImageSrc,
  type ProjectMediaDraft,
  revokeMediaImage,
} from "@/lib/projectMedia";

type SectionId = "basics" | "media" | "content";
type Locale = "en" | "fr" | "ar";
type StatusKey = "design" | "in_progress" | "completed";

const PROJECT_STATUS_OPTIONS: Array<{
  key: StatusKey;
  label: Record<Locale, string>;
}> = [
  {
    key: "design",
    label: { en: "Design only", fr: "Conception", ar: "تصميم فقط" },
  },
  {
    key: "in_progress",
    label: { en: "In progress", fr: "En cours", ar: "قيد التنفيذ" },
  },
  {
    key: "completed",
    label: { en: "Completed", fr: "Terminé", ar: "مكتمل" },
  },
];

const normalizeStatusKey = (value: string): StatusKey | "" => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return "";
  for (const option of PROJECT_STATUS_OPTIONS) {
    if (normalized === option.key) return option.key;
    if (Object.values(option.label).some((label) => normalized === label.toLowerCase())) {
      return option.key;
    }
  }
  return "";
};

export type ProjectDraft = {
  category: string;
  year: string;
  area: string;
  cover_image: string;
  images: string;
  published: boolean;
  title_en: string;
  title_fr: string;
  title_ar: string;
  category_label_en: string;
  category_label_fr: string;
  category_label_ar: string;
  location_en: string;
  location_fr: string;
  location_ar: string;
  status_en: string;
  status_fr: string;
  status_ar: string;
  description_en: string;
  description_fr: string;
  description_ar: string;
  concept_en: string;
  concept_fr: string;
  concept_ar: string;
};

export const emptyDraft = (): ProjectDraft => ({
  category: "",
  year: "",
  area: "",
  cover_image: "",
  images: "",
  published: false,
  title_en: "",
  title_fr: "",
  title_ar: "",
  category_label_en: "",
  category_label_fr: "",
  category_label_ar: "",
  location_en: "",
  location_fr: "",
  location_ar: "",
  status_en: "design",
  status_fr: "design",
  status_ar: "design",
  description_en: "",
  description_fr: "",
  description_ar: "",
  concept_en: "",
  concept_fr: "",
  concept_ar: "",
});

export const toPayload = (draft: ProjectDraft, _mode: "global" | "multi") => {
  const statusKey = normalizeStatusKey(draft.status_en);
  return {
    category: draft.category,
    year: draft.year || null,
    area: draft.area || null,
    cover_image: draft.cover_image,
    images: draft.images
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    published: draft.published,
    title: {
      en: draft.title_en.trim(),
      fr: draft.title_fr.trim() || draft.title_en.trim(),
      ar: draft.title_ar.trim() || draft.title_en.trim(),
    },
    category_label: {
      en: draft.category_label_en.trim(),
      fr: draft.category_label_fr.trim() || draft.category_label_en.trim(),
      ar: draft.category_label_ar.trim() || draft.category_label_en.trim(),
    },
    location: {
      en: draft.location_en.trim(),
      fr: draft.location_fr.trim() || draft.location_en.trim(),
      ar: draft.location_ar.trim() || draft.location_en.trim(),
    },
    status: statusKey || "design",
    description: {
      en: draft.description_en.trim(),
      fr: draft.description_fr.trim() || draft.description_en.trim(),
      ar: draft.description_ar.trim() || draft.description_en.trim(),
    },
    concept: {
      en: draft.concept_en.trim(),
      fr: draft.concept_fr.trim() || draft.concept_en.trim(),
      ar: draft.concept_ar.trim() || draft.concept_en.trim(),
    },
  };
};

export default function ProjectForm({
  draft,
  onChange,
  mode: _mode,
  onModeChange: _onModeChange,
  media,
  onMediaChange,
  categories,
  disabled = false,
}: {
  draft: ProjectDraft;
  onChange: React.Dispatch<React.SetStateAction<ProjectDraft>>;
  mode: "global" | "multi";
  onModeChange: React.Dispatch<React.SetStateAction<"global" | "multi">>;
  media: ProjectMediaDraft;
  onMediaChange: React.Dispatch<React.SetStateAction<ProjectMediaDraft>>;
  categories: CategoryRow[];
  disabled?: boolean;
}) {
  const { t, language } = useLanguage();
  const coverPreview = media.cover ? getMediaImageSrc(media.cover) : "";
  const galleryImages = media.gallery;
  const [activeSection, setActiveSection] = React.useState<SectionId>("basics");
  const set = (key: keyof ProjectDraft, value: string | boolean) => {
    onChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    const selected = categories.find((item) => item.key === value);
    onChange((prev) => ({
      ...prev,
      category: value,
      ...(selected
        ? {
            category_label_en: selected.label.en ?? "",
            category_label_fr: selected.label.fr ?? selected.label.en ?? "",
            category_label_ar: selected.label.ar ?? selected.label.en ?? "",
          }
        : {}),
    }));
  };

  const categoryOptions = categories.map((category) => ({
    value: category.key,
    label: category.label[language] || category.label.en || category.key,
  }));
  if (draft.category && !categoryOptions.some((item) => item.value === draft.category)) {
    categoryOptions.unshift({ value: draft.category, label: draft.category });
  }
  const sections: Array<{ id: SectionId; label: string }> = [
    { id: "basics", label: t("admin", "sectionBasics") },
    { id: "media", label: t("admin", "sectionMedia") },
    { id: "content", label: t("admin", "sectionContent") },
  ];

  const handleCoverUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    onMediaChange((prev) => {
      const removedRemoteUrls = [...prev.removedRemoteUrls];
      if (prev.cover?.kind === "remote") {
        removedRemoteUrls.push(prev.cover.url);
      }
      revokeMediaImage(prev.cover);
      return {
        ...prev,
        cover: createLocalMediaImage(file),
        removedRemoteUrls: Array.from(new Set(removedRemoteUrls)),
      };
    });
  };

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    onMediaChange((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...files.map(createLocalMediaImage)],
    }));
  };

  const removeCover = () => {
    if (disabled) return;
    onMediaChange((prev) => {
      if (!prev.cover) return prev;
      const removedRemoteUrls = [...prev.removedRemoteUrls];
      if (prev.cover.kind === "remote") {
        removedRemoteUrls.push(prev.cover.url);
      }
      revokeMediaImage(prev.cover);
      return {
        ...prev,
        cover: null,
        removedRemoteUrls: Array.from(new Set(removedRemoteUrls)),
      };
    });
  };

  const removeGalleryImage = (index: number) => {
    if (disabled) return;
    onMediaChange((prev) => {
      const item = prev.gallery[index];
      if (!item) return prev;
      const nextGallery = prev.gallery.filter((_, idx) => idx !== index);
      const removedRemoteUrls = [...prev.removedRemoteUrls];
      if (item.kind === "remote") {
        removedRemoteUrls.push(item.url);
      } else {
        revokeMediaImage(item);
      }
      return {
        ...prev,
        gallery: nextGallery,
        removedRemoteUrls: Array.from(new Set(removedRemoteUrls)),
      };
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <aside className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm lg:h-fit lg:sticky lg:top-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              disabled={disabled}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                activeSection === section.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              }`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                  activeSection === section.id ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {index + 1}
              </span>
              <span className="text-xs uppercase tracking-widest">{section.label}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="space-y-6">
        {activeSection === "basics" && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "sectionBasics")}</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label={t("admin", "fieldCategory")}
                value={draft.category}
                onChange={handleCategoryChange}
                disabled={disabled}
                options={categoryOptions}
                placeholder={t("admin", "selectCategory")}
              />
              <Field
                label={t("admin", "fieldYear")}
                value={draft.year}
                onChange={(v) => set("year", v)}
                inputType="number"
                forceLtr
              />
              <Field label={t("admin", "fieldArea")} value={draft.area} onChange={(v) => set("area", v)} forceLtr />
              <div className="flex items-center gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(event) => set("published", event.target.checked)}
                  disabled={disabled}
                />
                <label className="text-xs uppercase tracking-widest text-neutral-500">{t("admin", "fieldPublished")}</label>
              </div>
            </div>
          </div>
        )}

        {activeSection === "media" && (
          <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "sectionMedia")}</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="group flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-xs uppercase tracking-widest text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700">
                  {t("admin", "uploadCover")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={disabled}
                    className="sr-only"
                  />
                </label>
                {coverPreview && (
                  <div className="relative overflow-hidden rounded-xl border border-neutral-200">
                    <img src={coverPreview} alt="Cover preview" className="h-44 w-full object-cover" />
                    <button
                      type="button"
                      onClick={removeCover}
                      disabled={disabled}
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-widest"
                    >
                      {t("admin", "remove")}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="group flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-xs uppercase tracking-widest text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700">
                  {t("admin", "uploadGallery")}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={disabled}
                    className="sr-only"
                  />
                </label>
                <p className="text-xs text-neutral-400">{t("admin", "fieldImagesHelp")}</p>
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {galleryImages.map((image, idx) => (
                  <div key={image.id} className="relative overflow-hidden rounded-xl border border-neutral-200">
                    <img src={getMediaImageSrc(image)} alt="Gallery preview" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      disabled={disabled}
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-widest"
                    >
                      {t("admin", "remove")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "content" && (
          <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "sectionContent")}</h3>
              <span className="text-xs uppercase tracking-widest text-neutral-500">
                Auto-translation (EN/FR/AR)
              </span>
            </div>
            <Section title={t("admin", "fieldTitle")} draft={draft} prefix="title" set={set} disabled={disabled} />
            <Section title={t("admin", "fieldLocation")} draft={draft} prefix="location" set={set} disabled={disabled} />
            <Section
              title={t("admin", "fieldStatus")}
              draft={draft}
              prefix="status"
              set={set}
              disabled={disabled}
              statusSelect
            />
            <Section title={t("admin", "fieldDescription")} draft={draft} prefix="description" set={set} textarea disabled={disabled} />
            <Section title={t("admin", "fieldConcept")} draft={draft} prefix="concept" set={set} textarea disabled={disabled} />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  draft,
  prefix,
  set,
  textarea,
  statusSelect,
  disabled,
}: {
  title: string;
  draft: ProjectDraft;
  prefix: string;
  set: (key: keyof ProjectDraft, value: string) => void;
  textarea?: boolean;
  statusSelect?: boolean;
  disabled?: boolean;
}) {
  const { t, language } = useLanguage();
  const globalLocale: Locale = language === "fr" || language === "ar" ? language : "en";
  const statusOptions = (locale: Locale) =>
    PROJECT_STATUS_OPTIONS.map((option) => ({
      value: option.key,
      label: option.label[locale],
    }));
  const statusValue = normalizeStatusKey(draft.status_en);
  const onStatusChange = (value: string) => {
    const key = normalizeStatusKey(value);
    set("status_en", key);
    set("status_fr", key);
    set("status_ar", key);
  };

  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <h3 className="text-sm uppercase tracking-widest text-neutral-500">{title}</h3>
      {statusSelect ? (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-1">
          <SelectField
            label={t("admin", "langGlobal")}
            value={statusValue}
            onChange={onStatusChange}
            disabled={disabled}
            options={statusOptions(globalLocale)}
            placeholder={t("admin", "fieldStatus")}
          />
        </div>
      ) : (
      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-1">
        {textarea ? (
          <Textarea
            label={t("admin", "langGlobal")}
            value={draft[`${prefix}_en` as keyof ProjectDraft] as string}
            onChange={(v) => set(`${prefix}_en` as keyof ProjectDraft, v)}
            disabled={disabled}
          />
        ) : (
          <Field
            label={t("admin", "langGlobal")}
            value={draft[`${prefix}_en` as keyof ProjectDraft] as string}
            onChange={(v) => set(`${prefix}_en` as keyof ProjectDraft, v)}
            disabled={disabled}
          />
        )}
      </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
  inputType = "text",
  forceLtr,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputType?: "text" | "number";
  forceLtr?: boolean;
}) {
  const { language } = useLanguage();
  const applyLtr = Boolean(forceLtr && language === "ar");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <input
        type={inputType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        dir={applyLtr ? "ltr" : undefined}
        inputMode={inputType === "number" ? "numeric" : undefined}
        className={`rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 ${
          applyLtr ? "text-right" : ""
        }`}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      {value && !options.some((option) => option.value === value) ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="">{placeholder ?? "Select"}</option>
          <option value={value}>{value}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
      >
        <option value="">{placeholder ?? "Select"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      )}
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
  help,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={4}
        className="resize-y rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
      />
      {help && <p className="text-xs text-neutral-400">{help}</p>}
    </div>
  );
}

