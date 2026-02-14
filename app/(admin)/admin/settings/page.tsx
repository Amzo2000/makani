import AdminLogin from "@/components/AdminLogin";
import AdminSettings from "@/components/AdminSettings";
import { supabaseServer } from "@/lib/supabase/server";

export default async function AdminSettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.app_metadata?.role === "admin";
  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const { data: appSettings } = await supabase
    .from("app_settings")
    .select(
      "contact_email,contact_phone,address_line,city,district,country,latitude,longitude,facebook_url,youtube_url,linkedin_url,tiktok_url"
    )
    .eq("key", "default")
    .maybeSingle();
  const parseLocalized = (value?: string | null) => {
    if (!value) return "";
    const text = value.trim();
    if (!text.startsWith("{")) return value;
    try {
      const parsed = JSON.parse(text) as { en?: string };
      return parsed.en ?? value;
    } catch {
      return value;
    }
  };

  return (
    <AdminSettings
      initialEmail={user.email ?? ""}
      initialSettings={{
        contact_email: appSettings?.contact_email ?? "",
        contact_phone: appSettings?.contact_phone ?? "",
        coordinates_input:
          appSettings?.latitude != null && appSettings?.longitude != null
            ? `${appSettings.latitude}, ${appSettings.longitude}`
            : parseLocalized(appSettings?.address_line) ?? "",
        city: appSettings?.city ?? "",
        district: appSettings?.district ?? "",
        country: appSettings?.country ?? "",
        address_line: appSettings?.address_line ?? "",
        facebook_url: appSettings?.facebook_url ?? "",
        youtube_url: appSettings?.youtube_url ?? "",
        linkedin_url: appSettings?.linkedin_url ?? "",
        tiktok_url: appSettings?.tiktok_url ?? "",
      }}
    />
  );
}
