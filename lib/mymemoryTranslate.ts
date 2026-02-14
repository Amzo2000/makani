export type UiLanguage = "en" | "fr" | "ar";

type MyMemoryResponse = {
  responseData?: {
    translatedText?: string;
  };
};

const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

export const translateText = async (
  text: string,
  from: UiLanguage,
  to: UiLanguage
): Promise<string> => {
  const input = text.trim();
  if (!input) return "";
  if (from === to) return input;

  const params = new URLSearchParams({
    q: input,
    langpair: `${from}|${to}`,
  });

  const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Translation failed (${response.status})`);
  }

  const data = (await response.json()) as MyMemoryResponse;
  const translated = data.responseData?.translatedText?.trim();
  return translated ? decodeHtmlEntities(translated) : input;
};

export const translateToAll = async (
  text: string,
  source: UiLanguage
): Promise<{ en: string; fr: string; ar: string }> => {
  const value = text.trim();
  if (!value) return { en: "", fr: "", ar: "" };

  const result: { en: string; fr: string; ar: string } = {
    en: source === "en" ? value : "",
    fr: source === "fr" ? value : "",
    ar: source === "ar" ? value : "",
  };

  const targets = (["en", "fr", "ar"] as UiLanguage[]).filter((lang) => lang !== source);
  for (const target of targets) {
    result[target] = await translateText(value, source, target);
  }

  return result;
};
