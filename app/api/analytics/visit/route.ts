import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";

const COOKIE_NAME = "makani_visitor";

const newToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const TOKEN_PATTERN = /^[a-zA-Z0-9-]{8,120}$/;

const sanitizeText = (value: unknown, maxLen = 300) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, maxLen);
};

const sanitizeToken = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!TOKEN_PATTERN.test(normalized)) return null;
  return normalized;
};

const getDeviceType = (userAgent: string | null) => {
  if (!userAgent) return "unknown";
  const value = userAgent.toLowerCase();
  if (value.includes("bot") || value.includes("crawler") || value.includes("spider")) return "bot";
  if (value.includes("ipad") || value.includes("tablet")) return "tablet";
  if (value.includes("mobile") || value.includes("android") || value.includes("iphone")) return "mobile";
  return "desktop";
};

const getIp = (request: NextRequest) => {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
};

const hashIp = (ip: string | null) => {
  if (!ip) return null;
  const salt = process.env.ANALYTICS_IP_SALT || process.env.NEXT_PUBLIC_SUPABASE_URL || "makani";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
};

export async function POST(request: NextRequest) {
  const softFail = (reason: string) =>
    NextResponse.json({ tracked: false, reason }, { status: 202 });

  const admin = supabaseAdmin();
  if (!admin) {
    return softFail("missing_service_role");
  }

  const existingToken = request.cookies.get(COOKIE_NAME)?.value;

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const clientToken = sanitizeToken(payload.visitorToken);
  const visitorToken = existingToken || clientToken || newToken();
  const path = sanitizeText(payload.path, 500) || request.nextUrl.searchParams.get("path") || "/";
  const referrer = sanitizeText(payload.referrer, 1000);
  const language = sanitizeText(payload.language, 32);
  const timezone = sanitizeText(payload.timezone, 64);
  const screen = sanitizeText(payload.screen, 32);
  const utmRaw = (payload.utm ?? {}) as Record<string, unknown>;
  const utmSource = sanitizeText(utmRaw.source, 150);
  const utmMedium = sanitizeText(utmRaw.medium, 150);
  const utmCampaign = sanitizeText(utmRaw.campaign, 150);
  const utmTerm = sanitizeText(utmRaw.term, 150);
  const utmContent = sanitizeText(utmRaw.content, 150);
  const userAgent = request.headers.get("user-agent") || null;
  const deviceType = getDeviceType(userAgent);
  const ipHash = hashIp(getIp(request));
  const now = new Date().toISOString();

  const { data: existing, error: fetchError } = await admin
    .from("site_visits")
    .select("id,visits_count")
    .eq("visitor_token", visitorToken)
    .maybeSingle();

  if (fetchError) {
    return softFail(fetchError.message);
  }

  if (existing) {
    const { error: updateError } = await admin
      .from("site_visits")
      .update({
        last_seen_at: now,
        last_path: path,
        user_agent: userAgent,
        last_referrer: referrer,
        last_language: language,
        last_timezone: timezone,
        last_screen: screen,
        last_utm_source: utmSource,
        last_utm_medium: utmMedium,
        last_utm_campaign: utmCampaign,
        last_utm_term: utmTerm,
        last_utm_content: utmContent,
        ip_hash: ipHash,
        device_type: deviceType,
        visits_count: (existing.visits_count ?? 0) + 1,
      })
      .eq("id", existing.id);

    if (updateError) {
      return softFail(updateError.message);
    }
  } else {
    const { error: insertError } = await admin.from("site_visits").insert({
      visitor_token: visitorToken,
      first_seen_at: now,
      last_seen_at: now,
      last_path: path,
      user_agent: userAgent,
      last_referrer: referrer,
      last_language: language,
      last_timezone: timezone,
      last_screen: screen,
      last_utm_source: utmSource,
      last_utm_medium: utmMedium,
      last_utm_campaign: utmCampaign,
      last_utm_term: utmTerm,
      last_utm_content: utmContent,
      ip_hash: ipHash,
      device_type: deviceType,
      visits_count: 1,
    });

    if (insertError) {
      return softFail(insertError.message);
    }
  }

  const response = NextResponse.json({ tracked: true });
  if (!existingToken) {
    response.cookies.set(COOKIE_NAME, visitorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }
  return response;
}
