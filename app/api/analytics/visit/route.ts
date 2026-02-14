import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const COOKIE_NAME = "makani_visitor";

const newToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export async function POST(request: NextRequest) {
  const softFail = (reason: string) =>
    NextResponse.json({ tracked: false, reason }, { status: 202 });

  const admin = supabaseAdmin();
  if (!admin) {
    return softFail("missing_service_role");
  }

  const existingToken = request.cookies.get(COOKIE_NAME)?.value;
  const visitorToken = existingToken || newToken();
  const path = request.nextUrl.searchParams.get("path") || "/";
  const userAgent = request.headers.get("user-agent") || null;
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
