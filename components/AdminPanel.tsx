"use client";

import React, { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Localized = { en: string; fr: string; ar: string };

type ProjectRow = {
  id: string;
  slug: string;
  title: Localized;
  category: string;
  category_label: Localized;
  location: Localized;
  year: string | null;
  area: string | null;
  status: Localized;
  description: Localized;
  concept: Localized;
  cover_image: string;
  images: string[];
  published: boolean;
  created_at?: string;
  updated_at?: string;
};

type InquiryRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
};

type ProjectDraft = {
  slug: string;
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

const emptyDraft = (): ProjectDraft => ({
  slug: "",
  category: "",
  year: "",
  area: "",
  cover_image: "",
  images: "",
  published: true,
  title_en: "",
  title_fr: "",
  title_ar: "",
  category_label_en: "",
  category_label_fr: "",
  category_label_ar: "",
  location_en: "",
  location_fr: "",
  location_ar: "",
  status_en: "",
  status_fr: "",
  status_ar: "",
  description_en: "",
  description_fr: "",
  description_ar: "",
  concept_en: "",
  concept_fr: "",
  concept_ar: "",
});

const toDraft = (project: ProjectRow): ProjectDraft => ({
  slug: project.slug,
  category: project.category,
  year: project.year ?? "",
  area: project.area ?? "",
  cover_image: project.cover_image,
  images: project.images.join("\n"),
  published: project.published,
  title_en: project.title.en,
  title_fr: project.title.fr,
  title_ar: project.title.ar,
  category_label_en: project.category_label.en,
  category_label_fr: project.category_label.fr,
  category_label_ar: project.category_label.ar,
  location_en: project.location.en,
  location_fr: project.location.fr,
  location_ar: project.location.ar,
  status_en: project.status.en,
  status_fr: project.status.fr,
  status_ar: project.status.ar,
  description_en: project.description.en,
  description_fr: project.description.fr,
  description_ar: project.description.ar,
  concept_en: project.concept.en,
  concept_fr: project.concept.fr,
  concept_ar: project.concept.ar,
});

const buildLocalized = (draft: ProjectDraft, key: string): Localized => ({
  en: draft[`${key}_en` as keyof ProjectDraft] as string,
  fr: draft[`${key}_fr` as keyof ProjectDraft] as string,
  ar: draft[`${key}_ar` as keyof ProjectDraft] as string,
});

const toPayload = (draft: ProjectDraft) => ({
  slug: draft.slug,
  category: draft.category,
  year: draft.year || null,
  area: draft.area || null,
  cover_image: draft.cover_image,
  images: draft.images
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
  published: draft.published,
  title: buildLocalized(draft, "title"),
  category_label: buildLocalized(draft, "category_label"),
  location: buildLocalized(draft, "location"),
  status: buildLocalized(draft, "status"),
  description: buildLocalized(draft, "description"),
  concept: buildLocalized(draft, "concept"),
});

export default function AdminPanel({
  initialProjects,
  initialInquiries,
}: {
  initialProjects: ProjectRow[];
  initialInquiries: InquiryRow[];
}) {
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects);
  const [inquiries, setInquiries] = useState<InquiryRow[]>(initialInquiries);
  const [createDraft, setCreateDraft] = useState<ProjectDraft>(() => emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProjectDraft>(() => emptyDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => supabaseBrowser(), []);

  const handleCreate = async () => {
    setBusy(true);
    setError(null);
    const payload = toPayload(createDraft);
    const { data, error } = await supabase
      .from("projects")
      .insert(payload)
      .select()
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setProjects((prev) => [data as ProjectRow, ...prev]);
    setCreateDraft(emptyDraft());
  };

  const startEdit = (project: ProjectRow) => {
    setEditingId(project.id);
    setEditDraft(toDraft(project));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(emptyDraft());
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setBusy(true);
    setError(null);
    const payload = toPayload(editDraft);
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", editingId)
      .select()
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setProjects((prev) => prev.map((p) => (p.id === editingId ? (data as ProjectRow) : p)));
    cancelEdit();
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Supprimer ce projet ?")) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInquiries((prev) => prev.map((row) => (row.id === id ? (data as InquiryRow) : row)));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-light">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-neutral-500">Gestion des projets et demandes.</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest"
          >
            Se deconnecter
          </button>
        </div>
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>

      <section className="mb-16">
        <h2 className="text-xl font-medium">Nouveau projet</h2>
        <div className="mt-6 grid grid-cols-1 gap-6">
          <ProjectForm draft={createDraft} onChange={setCreateDraft} />
          <button
            type="button"
            disabled={busy}
            onClick={handleCreate}
            className="w-full bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Ajouter le projet
          </button>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-xl font-medium">Projets</h2>
        <div className="mt-6 space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-neutral-200 bg-white p-6">
              {editingId === project.id ? (
                <div className="space-y-4">
                  <ProjectForm draft={editDraft} onChange={setEditDraft} />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={saveEdit}
                      className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
                    >
                      Sauvegarder
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="border border-neutral-300 px-6 py-3 text-xs uppercase tracking-widest"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-medium">{project.title.en}</p>
                      <p className="text-xs text-neutral-500">{project.slug}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        className="border border-neutral-300 px-4 py-2 text-xs uppercase tracking-widest"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteProject(project.id)}
                        className="border border-red-200 text-red-600 px-4 py-2 text-xs uppercase tracking-widest"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-500">{project.category}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium">Demandes</h2>
        <div className="mt-6 space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-widest text-neutral-400">{inquiry.type}</p>
                  <p className="text-lg font-medium">{inquiry.name}</p>
                  <p className="text-sm text-neutral-500">{inquiry.email}</p>
                  {inquiry.subject && <p className="text-sm text-neutral-400">{inquiry.subject}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["new", "read", "replied", "archived"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={busy}
                      onClick={() => updateInquiryStatus(inquiry.id, status)}
                      className={`border px-3 py-1 text-xs uppercase tracking-widest ${
                        inquiry.status === status
                          ? "border-black text-black"
                          : "border-neutral-200 text-neutral-500"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm text-neutral-600 whitespace-pre-wrap">{inquiry.message}</p>
              <p className="mt-3 text-xs text-neutral-400">{new Date(inquiry.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProjectForm({
  draft,
  onChange,
}: {
  draft: ProjectDraft;
  onChange: React.Dispatch<React.SetStateAction<ProjectDraft>>;
}) {
  const set = (key: keyof ProjectDraft, value: string | boolean) => {
    onChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Slug" value={draft.slug} onChange={(v) => set("slug", v)} />
        <Field label="Category" value={draft.category} onChange={(v) => set("category", v)} />
        <Field label="Year" value={draft.year} onChange={(v) => set("year", v)} />
        <Field label="Area" value={draft.area} onChange={(v) => set("area", v)} />
        <Field label="Cover image URL" value={draft.cover_image} onChange={(v) => set("cover_image", v)} />
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={draft.published}
            onChange={(event) => set("published", event.target.checked)}
          />
          <label className="text-xs uppercase tracking-widest text-neutral-500">Published</label>
        </div>
      </div>

      <Textarea label="Images (1 URL par ligne)" value={draft.images} onChange={(v) => set("images", v)} />

      <Section title="Title" draft={draft} prefix="title" set={set} />
      <Section title="Category Label" draft={draft} prefix="category_label" set={set} />
      <Section title="Location" draft={draft} prefix="location" set={set} />
      <Section title="Status" draft={draft} prefix="status" set={set} />
      <Section title="Description" draft={draft} prefix="description" set={set} textarea />
      <Section title="Concept" draft={draft} prefix="concept" set={set} textarea />
    </div>
  );
}

function Section({
  title,
  draft,
  prefix,
  set,
  textarea,
}: {
  title: string;
  draft: ProjectDraft;
  prefix: string;
  set: (key: keyof ProjectDraft, value: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4">
      <h3 className="text-sm uppercase tracking-widest text-neutral-500">{title}</h3>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
        {textarea ? (
          <Textarea label="EN" value={draft[`${prefix}_en` as keyof ProjectDraft] as string} onChange={(v) => set(`${prefix}_en` as keyof ProjectDraft, v)} />
        ) : (
          <Field label="EN" value={draft[`${prefix}_en` as keyof ProjectDraft] as string} onChange={(v) => set(`${prefix}_en` as keyof ProjectDraft, v)} />
        )}
        {textarea ? (
          <Textarea label="FR" value={draft[`${prefix}_fr` as keyof ProjectDraft] as string} onChange={(v) => set(`${prefix}_fr` as keyof ProjectDraft, v)} />
        ) : (
          <Field label="FR" value={draft[`${prefix}_fr` as keyof ProjectDraft] as string} onChange={(v) => set(`${prefix}_fr` as keyof ProjectDraft, v)} />
        )}
        {textarea ? (
          <Textarea label="AR" value={draft[`${prefix}_ar` as keyof ProjectDraft] as string} onChange={(v) => set(`${prefix}_ar` as keyof ProjectDraft, v)} />
        ) : (
          <Field label="AR" value={draft[`${prefix}_ar` as keyof ProjectDraft] as string} onChange={(v) => set(`${prefix}_ar` as keyof ProjectDraft, v)} />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-b border-neutral-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-widest text-neutral-500">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="border-b border-neutral-300 py-2 focus:outline-none focus:border-black transition-colors bg-transparent resize-y"
      />
    </div>
  );
}
