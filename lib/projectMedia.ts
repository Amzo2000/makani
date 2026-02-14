import { supabaseBrowser } from "@/lib/supabase/client";

export const PROJECTS_BUCKET = "projects";

export type RemoteMediaImage = {
  kind: "remote";
  id: string;
  url: string;
};

export type LocalMediaImage = {
  kind: "local";
  id: string;
  file: File;
  previewUrl: string;
};

export type MediaImage = RemoteMediaImage | LocalMediaImage;

export type ProjectMediaDraft = {
  cover: MediaImage | null;
  gallery: MediaImage[];
  removedRemoteUrls: string[];
};

const markerForBucket = (bucket: string) => `/storage/v1/object/public/${bucket}/`;

const makeId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createRemoteMediaImage = (url: string): RemoteMediaImage => ({
  kind: "remote",
  id: makeId(),
  url,
});

export const createLocalMediaImage = (file: File): LocalMediaImage => ({
  kind: "local",
  id: makeId(),
  file,
  previewUrl: URL.createObjectURL(file),
});

export const createProjectMediaDraft = (coverUrl: string, galleryUrls: string[]): ProjectMediaDraft => ({
  cover: coverUrl?.trim() ? createRemoteMediaImage(coverUrl.trim()) : null,
  gallery: galleryUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .map(createRemoteMediaImage),
  removedRemoteUrls: [],
});

export const emptyProjectMediaDraft = (): ProjectMediaDraft => ({
  cover: null,
  gallery: [],
  removedRemoteUrls: [],
});

export const getMediaImageSrc = (image: MediaImage) =>
  image.kind === "local" ? image.previewUrl : image.url;

export const isLocalMediaImage = (image: MediaImage): image is LocalMediaImage =>
  image.kind === "local";

export const revokeMediaImage = (image: MediaImage | null) => {
  if (!image) return;
  if (image.kind === "local") {
    URL.revokeObjectURL(image.previewUrl);
  }
};

export const revokeMediaDraft = (media: ProjectMediaDraft) => {
  revokeMediaImage(media.cover);
  media.gallery.forEach(revokeMediaImage);
};

export const extractStoragePath = (url: string, bucket: string) => {
  const marker = markerForBucket(bucket);
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
};

export const removeStorageUrls = async (
  supabase: ReturnType<typeof supabaseBrowser>,
  bucket: string,
  urls: string[]
) => {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  const paths = uniqueUrls
    .map((url) => extractStoragePath(url, bucket))
    .filter((path): path is string => Boolean(path));
  if (paths.length === 0) return;
  await supabase.storage.from(bucket).remove(paths);
};

export const uploadFileToStorage = async (
  supabase: ReturnType<typeof supabaseBrowser>,
  bucket: string,
  file: File
) => {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: false,
  });
  if (error) {
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const hasLocalImages = (media: ProjectMediaDraft) =>
  (media.cover?.kind === "local") || media.gallery.some((item) => item.kind === "local");
