import type { Project, LocalizedString } from "@/types";

type DbLocalized = Partial<Record<"en" | "fr" | "ar", string>> | null;
type DbStatus = DbLocalized | string;

export type DbProjectRow = {
  id: string;
  category: string;
  year: string | null;
  area: string | null;
  cover_image: string;
  images: string[] | null;
  title: DbLocalized;
  category_label: DbLocalized;
  location: DbLocalized;
  status: DbStatus;
  description: DbLocalized;
  concept: DbLocalized;
};

const normalizeLocalized = (value: DbLocalized): LocalizedString => ({
  en: value?.en ?? "",
  fr: value?.fr ?? value?.en ?? "",
  ar: value?.ar ?? value?.en ?? "",
});

const normalizeStatus = (value: DbStatus): LocalizedString => {
  if (typeof value === "string") {
    return { en: value, fr: value, ar: value };
  }
  return normalizeLocalized(value);
};

export const mapDbProjectToProject = (row: DbProjectRow): Project => ({
  id: row.id,
  title: normalizeLocalized(row.title),
  category: row.category ?? "",
  categoryLabel: normalizeLocalized(row.category_label),
  location: normalizeLocalized(row.location),
  year: row.year ?? "",
  area: row.area ?? "",
  status: normalizeStatus(row.status),
  description: normalizeLocalized(row.description),
  concept: normalizeLocalized(row.concept),
  coverImage: row.cover_image ?? "",
  images: row.images ?? [],
});
