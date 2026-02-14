"use client";

import React, { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import type { CategoryRow } from "@/lib/categories";
import { translateToAll, type UiLanguage } from "@/lib/mymemoryTranslate";

type CategoryDraft = {
  label: string;
  is_active: boolean;
};

const emptyDraft: CategoryDraft = {
  label: "",
  is_active: true,
};

const toDraft = (category: CategoryRow, language: UiLanguage): CategoryDraft => ({
  label:
    (language === "fr" ? category.label.fr : language === "ar" ? category.label.ar : category.label.en) ??
    category.label.en ??
    category.label.fr ??
    category.label.ar ??
    "",
  is_active: category.is_active,
});

const sortCategories = (items: CategoryRow[]) =>
  [...items].sort((a, b) => a.sort_order - b.sort_order || a.key.localeCompare(b.key));

export default function AdminCategories({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const { t, language } = useLanguage();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const progressLabel = {
    preparing: language === "fr" ? "Preparation de la categorie..." : language === "ar" ? "جار تحضير الفئة..." : "Preparing category...",
    translating: language === "fr" ? "Traduction de la categorie..." : language === "ar" ? "جار ترجمة الفئة..." : "Translating category...",
    saving: language === "fr" ? "Enregistrement de la categorie..." : language === "ar" ? "جار حفظ الفئة..." : "Saving category...",
    done: language === "fr" ? "Termine." : language === "ar" ? "اكتمل." : "Completed.",
  };

  const [categories, setCategories] = useState<CategoryRow[]>(sortCategories(initialCategories));
  const [createDraft, setCreateDraft] = useState<CategoryDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CategoryDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ percent: number; label: string } | null>(null);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState<"all" | "active" | "inactive">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const toPayload = (
    draft: CategoryDraft,
    sortOrder: number,
    key: string,
    labels: { en: string; fr: string; ar: string }
  ) => ({
    key,
    label: labels,
    sort_order: sortOrder,
    is_active: draft.is_active,
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const buildUniqueKey = (labelSource: string, excludeId?: string) => {
    const source = labelSource || "category";
    const base = slugify(source) || "category";
    const existing = new Set(
      categories
        .filter((item) => item.id !== excludeId)
        .map((item) => item.key.toLowerCase())
    );
    if (!existing.has(base)) return base;
    let index = 2;
    let candidate = `${base}-${index}`;
    while (existing.has(candidate)) {
      index += 1;
      candidate = `${base}-${index}`;
    }
    return candidate;
  };

  const resetError = () => setError(null);
  const translateLabel = async (label: string) => {
    const source = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;
    setProgress({ percent: 25, label: progressLabel.translating });
    return translateToAll(label, source);
  };

  const createCategory = async () => {
    setBusy(true);
    resetError();
    setProgress({ percent: 10, label: progressLabel.preparing });
    try {
      const lastOrder = categories.length > 0 ? Math.max(...categories.map((item) => item.sort_order)) : 0;
      const translated = await translateLabel(createDraft.label);
      const payload = toPayload(createDraft, lastOrder + 10, buildUniqueKey(translated.en), translated);
      setProgress({ percent: 75, label: progressLabel.saving });
      const { data, error: createError } = await supabase
        .from("categories")
        .insert(payload)
        .select("id,key,label,sort_order,is_active")
        .single();
      if (createError) {
        setError(createError.message);
        setProgress(null);
        return;
      }
      setCategories((prev) => sortCategories([...prev, data as CategoryRow]));
      setCreateDraft(emptyDraft);
      setShowCreateForm(false);
      setProgress({ percent: 100, label: progressLabel.done });
      window.setTimeout(() => setProgress(null), 600);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create category");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (category: CategoryRow) => {
    setShowCreateForm(false);
    setEditingId(category.id);
    const source = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;
    setEditDraft(toDraft(category, source));
    resetError();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(emptyDraft);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    resetError();
    setProgress({ percent: 10, label: progressLabel.preparing });
    const current = categories.find((item) => item.id === editingId);
    if (!current) {
      setBusy(false);
      setProgress(null);
      return;
    }
    try {
      const source = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;
      const currentLabel =
        (source === "fr" ? current.label.fr : source === "ar" ? current.label.ar : current.label.en) ??
        current.label.en ??
        current.label.fr ??
        current.label.ar ??
        "";
      const nextLabel = editDraft.label.trim();
      const translated =
        nextLabel === currentLabel.trim()
          ? {
              en: current.label.en ?? "",
              fr: current.label.fr ?? current.label.en ?? "",
              ar: current.label.ar ?? current.label.en ?? "",
            }
          : await translateLabel(editDraft.label);
      const payload = toPayload(editDraft, current.sort_order, current.key, translated);
      setProgress({ percent: 75, label: progressLabel.saving });
      const { data, error: saveError } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingId)
        .select("id,key,label,sort_order,is_active")
        .single();
      if (saveError) {
        setError(saveError.message);
        setProgress(null);
        return;
      }
      setCategories((prev) => sortCategories(prev.map((item) => (item.id === editingId ? (data as CategoryRow) : item))));
      cancelEdit();
      setProgress({ percent: 100, label: progressLabel.done });
      window.setTimeout(() => setProgress(null), 600);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update category");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (category: CategoryRow) => {
    setBusy(true);
    resetError();
    const { data, error: updateError } = await supabase
      .from("categories")
      .update({ is_active: !category.is_active })
      .eq("id", category.id)
      .select("id,key,label,sort_order,is_active")
      .single();
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setCategories((prev) => sortCategories(prev.map((item) => (item.id === category.id ? (data as CategoryRow) : item))));
  };

  const moveCategory = async (id: string, direction: "up" | "down") => {
    if (busy) return;
    const source = sortCategories(categories);
    const index = source.findIndex((item) => item.id === id);
    if (index === -1) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= source.length) return;

    const swapped = [...source];
    const tmp = swapped[index];
    swapped[index] = swapped[target];
    swapped[target] = tmp;

    const reordered = swapped.map((item, idx) => ({ ...item, sort_order: (idx + 1) * 10 }));
    const previous = categories;
    setCategories(reordered);
    setBusy(true);
    resetError();

    const updates = reordered.filter((item) => {
      const original = previous.find((prev) => prev.id === item.id);
      return original ? original.sort_order !== item.sort_order : true;
    });

    const results = await Promise.all(
      updates.map((item) =>
        supabase
          .from("categories")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
      )
    );
    setBusy(false);

    const failed = results.find((result) => result.error);
    if (failed?.error) {
      setCategories(previous);
      setError(failed.error.message);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm(t("admin", "confirmDeleteCategory"))) return;
    setBusy(true);
    resetError();
    const { error: deleteError } = await supabase.from("categories").delete().eq("id", id);
    setBusy(false);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setCategories((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      cancelEdit();
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = categories.filter((category) => {
    if (scope === "active" && !category.is_active) return false;
    if (scope === "inactive" && category.is_active) return false;
    if (!normalizedSearch) return true;
    const haystack = [
      category.key,
      category.label.en,
      category.label.fr,
      category.label.ar,
      String(category.sort_order),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const totalCount = categories.length;
  const activeCount = categories.filter((item) => item.is_active).length;
  const inactiveCount = totalCount - activeCount;
  const countByScope = scope === "all" ? totalCount : scope === "active" ? activeCount : inactiveCount;

  const labelByLanguage = (category: CategoryRow) =>
    (language === "fr" ? category.label.fr : language === "ar" ? category.label.ar : category.label.en) ||
    category.label.en ||
    category.key;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-light">{t("admin", "categories")}</h1>
          <p className="mt-2 text-sm text-neutral-500">{t("admin", "categoriesSubtitle")}</p>
          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Stat label={t("admin", "totalCategories")} value={totalCount} />
        <Stat label={t("admin", "activeCategory")} value={activeCount} />
        <Stat label={t("admin", "inactiveCategory")} value={inactiveCount} />
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("admin", "categoriesSearchPlaceholder")}
              className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
          <FilterButton active={scope === "all"} onClick={() => setScope("all")} label={`${t("admin", "categoriesScopeAll")} (${totalCount})`} />
          <FilterButton active={scope === "active"} onClick={() => setScope("active")} label={`${t("admin", "categoriesScopeActive")} (${activeCount})`} />
          <FilterButton active={scope === "inactive"} onClick={() => setScope("inactive")} label={`${t("admin", "categoriesScopeInactive")} (${inactiveCount})`} />
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          {filtered.length}/{countByScope}
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "categories")}</h2>
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            <Plus size={14} />
            {showCreateForm ? t("admin", "cancel") : t("admin", "createCategory")}
          </button>
        </div>
        {showCreateForm && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "createCategory")}</h3>
              <p className="mt-2 text-xs text-neutral-500">{t("admin", "createCategoryHelp")}</p>
            </div>
            <CategoryForm
              draft={createDraft}
              onChange={setCreateDraft}
              disabled={busy}
              t={t}
            />
            {progress && !editingId && (
              <div className="rounded-xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500">
                  <span>{progress.label}</span>
                  <span>{progress.percent}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-full rounded-full bg-black transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={createCategory}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                <Plus size={14} />
                {busy ? t("admin", "saving") : t("admin", "createCategory")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setShowCreateForm(false)}
                className="rounded-xl border border-neutral-300 px-5 py-3 text-xs uppercase tracking-widest text-neutral-700"
              >
                {t("admin", "cancel")}
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-sm text-neutral-500">
            {t("admin", "categoriesEmpty")}
          </div>
        )}

        {filtered.map((category) => (
          <div key={category.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            {editingId === category.id ? (
              <div className="space-y-4">
                <CategoryForm
                  draft={editDraft}
                  onChange={setEditDraft}
                  disabled={busy}
                  t={t}
                />
                {progress && editingId === category.id && (
                  <div className="rounded-xl border border-neutral-200 bg-white p-4">
                    <div className="flex items-center justify-between text-xs uppercase tracking-widest text-neutral-500">
                      <span>{progress.label}</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-black transition-all duration-300" style={{ width: `${progress.percent}%` }} />
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={saveEdit}
                    className="rounded-xl bg-black px-5 py-2.5 text-xs uppercase tracking-widest text-white"
                  >
                    {t("admin", "save")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={cancelEdit}
                    className="rounded-xl border border-neutral-300 px-5 py-2.5 text-xs uppercase tracking-widest text-neutral-700"
                  >
                    {t("admin", "cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-widest text-neutral-400">
                    {t("admin", "sortOrder")}: {categories.findIndex((item) => item.id === category.id) + 1}
                  </p>
                  <p className="text-lg font-medium">{labelByLanguage(category)}</p>
                  <p className="text-xs text-neutral-500">{category.key}</p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${
                        category.is_active
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-neutral-200 bg-neutral-50 text-neutral-600"
                      }`}
                    >
                      {category.is_active ? t("admin", "activeCategory") : t("admin", "inactiveCategory")}
                    </span>
                    <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[10px] uppercase tracking-widest text-neutral-700">
                      {t("admin", "sortOrder")}: {category.sort_order}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || categories.findIndex((item) => item.id === category.id) <= 0}
                    onClick={() => moveCategory(category.id, "up")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-700 disabled:opacity-50"
                  >
                    <ArrowUp size={13} />
                    {t("admin", "moveUp")}
                  </button>
                  <button
                    type="button"
                    disabled={busy || categories.findIndex((item) => item.id === category.id) >= categories.length - 1}
                    onClick={() => moveCategory(category.id, "down")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-700 disabled:opacity-50"
                  >
                    <ArrowDown size={13} />
                    {t("admin", "moveDown")}
                  </button>
                  <ToggleSwitch
                    checked={category.is_active}
                    onChange={() => toggleActive(category)}
                    disabled={busy}
                    labelOn={t("admin", "activeCategory")}
                    labelOff={t("admin", "inactiveCategory")}
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEdit(category)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest text-neutral-700"
                  >
                    <Pencil size={13} />
                    {t("admin", "edit")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => deleteCategory(category.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs uppercase tracking-widest text-red-600"
                  >
                    <Trash2 size={13} />
                    {t("admin", "delete")}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-widest text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-light">{value}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-xs uppercase tracking-widest ${
        active ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600"
      }`}
    >
      {label}
    </button>
  );
}

function CategoryForm({
  draft,
  onChange,
  disabled,
  t,
}: {
  draft: CategoryDraft;
  onChange: React.Dispatch<React.SetStateAction<CategoryDraft>>;
  disabled?: boolean;
  t: (section: "admin", key: string) => string;
}) {
  const set = (key: keyof CategoryDraft, value: string | boolean) => {
    onChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Field
        label={t("admin", "langGlobal")}
        value={draft.label}
        onChange={(v) => set("label", v)}
        disabled={disabled}
      />
      <ToggleSwitch
        checked={draft.is_active}
        onChange={(value) => set("is_active", value)}
        disabled={disabled}
        labelOn={t("admin", "activeCategory")}
        labelOff={t("admin", "inactiveCategory")}
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  labelOn,
  labelOff,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  labelOn: string;
  labelOff: string;
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 ${
        disabled ? "opacity-50" : "cursor-pointer"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-neutral-300"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : ""
          }`}
        />
      </span>
      <span className="min-w-[64px] text-left">{checked ? labelOn : labelOff}</span>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
