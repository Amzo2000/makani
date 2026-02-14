"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabaseBrowser } from "@/lib/supabase/client";
import { translateToAll, type UiLanguage } from "@/lib/mymemoryTranslate";

type AdminSettingsProps = {
  initialEmail: string;
  initialSettings: {
    contact_email: string;
    contact_phone: string;
    coordinates_input: string;
    city: string;
    district: string;
    country: string;
    address_line: string;
    facebook_url: string;
    youtube_url: string;
    linkedin_url: string;
    tiktok_url: string;
  };
};

export default function AdminSettings({ initialEmail, initialSettings }: AdminSettingsProps) {
  const { t, language, setLanguage } = useLanguage();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const sourceLanguage = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;
  const parseStoredLocalized = (value: string) => {
    const text = value?.trim();
    if (!text.startsWith("{")) return null;
    try {
      const parsed = JSON.parse(text) as { en?: string; fr?: string; ar?: string };
      if (typeof parsed !== "object" || parsed == null) return null;
      return {
        en: parsed.en ?? "",
        fr: parsed.fr ?? parsed.en ?? "",
        ar: parsed.ar ?? parsed.en ?? "",
      };
    } catch {
      return null;
    }
  };
  const pickLocalized = (value: string) => {
    const parsed = parseStoredLocalized(value);
    if (!parsed) return value;
    return (sourceLanguage === "fr" ? parsed.fr : sourceLanguage === "ar" ? parsed.ar : parsed.en) || parsed.en || "";
  };

  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email);
  const [contactPhone, setContactPhone] = useState(initialSettings.contact_phone);
  const [coordinatesInput, setCoordinatesInput] = useState(initialSettings.coordinates_input);
  const [city, setCity] = useState(initialSettings.city);
  const [district, setDistrict] = useState(initialSettings.district);
  const [country, setCountry] = useState(initialSettings.country);
  const [addressLine, setAddressLine] = useState(initialSettings.address_line);
  const [facebookUrl, setFacebookUrl] = useState(initialSettings.facebook_url);
  const [youtubeUrl, setYoutubeUrl] = useState(initialSettings.youtube_url);
  const [linkedinUrl, setLinkedinUrl] = useState(initialSettings.linkedin_url);
  const [tiktokUrl, setTiktokUrl] = useState(initialSettings.tiktok_url);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  type ReverseAddress = {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
  };
  type ReverseResponse = {
    place_id?: number;
    display_name?: string;
    lat?: string;
    lon?: string;
    address?: ReverseAddress;
  };

  const parseDmsPart = (value: string): number | null => {
    const match = value
      .trim()
      .match(/(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)?\D*(\d+(?:\.\d+)?)?\D*([NSEW])/i);
    if (!match) return null;
    const deg = Number(match[1] ?? 0);
    const min = Number(match[2] ?? 0);
    const sec = Number(match[3] ?? 0);
    const hemisphere = (match[4] ?? "").toUpperCase();
    if ([deg, min, sec].some(Number.isNaN)) return null;
    let decimal = deg + min / 60 + sec / 3600;
    if (hemisphere === "S" || hemisphere === "W") decimal *= -1;
    return decimal;
  };

  const parseCoordinatesInput = (input: string): { lat: number; lng: number } | null => {
    const text = input.trim();
    const decimalPair = text.match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
    if (decimalPair) {
      const lat = Number(decimalPair[1]);
      const lng = Number(decimalPair[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) return { lat, lng };
    }
    const dmsParts = text.match(/(\d+(?:\.\d+)?[^NSEW]*[NSEW])/gi);
    if (dmsParts && dmsParts.length >= 2) {
      const lat = parseDmsPart(dmsParts[0]);
      const lng = parseDmsPart(dmsParts[1]);
      if (lat != null && lng != null) return { lat, lng };
    }
    return null;
  };

  const saveProfile = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    const parsed = parseCoordinatesInput(coordinatesInput);
    if (!parsed) {
      setBusy(false);
      setError(t("admin", "invalidCoordinates"));
      return;
    }

    let resolvedAddressLine = `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
    let resolvedCity = "";
    let resolvedDistrict = "";
    let resolvedCountry = "";

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${parsed.lat}&lon=${parsed.lng}&format=json`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      if (response.ok) {
        const data = (await response.json()) as ReverseResponse;
        const address = data.address ?? {};
        resolvedAddressLine = data.display_name ?? resolvedAddressLine;
        resolvedCity =
          address.city ??
          address.town ??
          address.village ??
          address.municipality ??
          address.county ??
          "";
        resolvedDistrict =
          address.suburb ??
          address.neighbourhood ??
          address.quarter ??
          address.county ??
          "";
        resolvedCountry = address.country ?? "";
      }
    } catch {
      // If reverse lookup fails, keep coordinates-only storage.
    }

    const [addressI18n, cityI18n, districtI18n, countryI18n] = await Promise.all([
      translateToAll(resolvedAddressLine, sourceLanguage),
      translateToAll(resolvedCity, sourceLanguage),
      translateToAll(resolvedDistrict, sourceLanguage),
      translateToAll(resolvedCountry, sourceLanguage),
    ]);

    const normalizedCoordinates = `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
    const { error: updateError } = await supabase
      .from("app_settings")
      .upsert(
        {
          key: "default",
          contact_email: contactEmail.trim(),
          contact_phone: contactPhone.trim(),
          address_line: JSON.stringify(addressI18n),
          city: JSON.stringify(cityI18n),
          district: JSON.stringify(districtI18n),
          country: JSON.stringify(countryI18n),
          latitude: parsed.lat,
          longitude: parsed.lng,
          google_maps_url: `https://www.google.com/maps?q=${parsed.lat},${parsed.lng}&z=13&output=embed`,
          google_place_id: null,
          facebook_url: facebookUrl.trim(),
          youtube_url: youtubeUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          tiktok_url: tiktokUrl.trim(),
        },
        { onConflict: "key" }
      );

    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCoordinatesInput(normalizedCoordinates);
    setAddressLine(pickLocalized(JSON.stringify(addressI18n)));
    setCity(pickLocalized(JSON.stringify(cityI18n)));
    setDistrict(pickLocalized(JSON.stringify(districtI18n)));
    setCountry(pickLocalized(JSON.stringify(countryI18n)));
    setMessage(t("admin", "settingsSaved"));
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError(t("admin", "passwordRule"));
      setMessage(null);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("admin", "passwordMismatch"));
      setMessage(null);
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setMessage(t("admin", "passwordUpdated"));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-light">{t("admin", "settings")}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t("admin", "settingsSubtitle")}</p>
        {message && <div className="mt-4 text-sm text-emerald-700">{message}</div>}
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "languageMode")}</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setLanguage("en")} className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${language === "en" ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600"}`}>EN</button>
          <button type="button" onClick={() => setLanguage("fr")} className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${language === "fr" ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600"}`}>FR</button>
          <button type="button" onClick={() => setLanguage("ar")} className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${language === "ar" ? "border-black bg-black text-white" : "border-neutral-300 text-neutral-600"}`}>AR</button>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "contactInfo")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("admin", "adminEmail")} value={initialEmail} readOnly />
          <Field label={t("admin", "publicEmail")} value={contactEmail} onChange={setContactEmail} inputType="email" forceLtr />
          <Field label={t("admin", "publicPhone")} value={contactPhone} onChange={setContactPhone} forceLtr />
          <Field label={t("admin", "coordinatesInput")} value={coordinatesInput} onChange={setCoordinatesInput} forceLtr />
          <Field label={t("admin", "addressLine")} value={pickLocalized(addressLine)} readOnly />
          <Field label={t("admin", "city")} value={pickLocalized(city)} readOnly />
          <Field label={t("admin", "district")} value={pickLocalized(district)} readOnly />
          <Field label={t("admin", "country")} value={pickLocalized(country)} readOnly />
        </div>
        <p className="text-xs text-neutral-500">{t("admin", "coordinatesHint")}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Facebook URL" value={facebookUrl} onChange={setFacebookUrl} inputType="url" forceLtr />
          <Field label="YouTube URL" value={youtubeUrl} onChange={setYoutubeUrl} inputType="url" forceLtr />
          <Field label="LinkedIn URL" value={linkedinUrl} onChange={setLinkedinUrl} inputType="url" forceLtr />
          <Field label="TikTok URL" value={tiktokUrl} onChange={setTiktokUrl} inputType="url" forceLtr />
        </div>
        <button type="button" disabled={busy} onClick={saveProfile} className="rounded-xl bg-black px-5 py-2.5 text-xs uppercase tracking-widest text-white">
          {busy ? t("admin", "saving") : t("admin", "save")}
        </button>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm uppercase tracking-widest text-neutral-500">{t("admin", "security")}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("admin", "newPassword")} value={newPassword} onChange={setNewPassword} inputType="password" />
          <Field label={t("admin", "confirmPassword")} value={confirmPassword} onChange={setConfirmPassword} inputType="password" />
        </div>
        <button type="button" disabled={busy} onClick={changePassword} className="rounded-xl border border-neutral-300 px-5 py-2.5 text-xs uppercase tracking-widest text-neutral-700">
          {t("admin", "updatePassword")}
        </button>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <button type="button" onClick={logout} className="rounded-xl border border-red-200 px-5 py-2.5 text-xs uppercase tracking-widest text-red-600">
          {t("admin", "logout")}
        </button>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly,
  inputType = "text",
  forceLtr,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  inputType?: "text" | "email" | "password" | "url";
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
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        dir={applyLtr ? "ltr" : undefined}
        className={`rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 ${
          readOnly ? "border-neutral-200 bg-neutral-50 text-neutral-500" : "border-neutral-300 bg-white"
        } ${applyLtr ? "text-right" : ""}`}
      />
    </div>
  );
}
