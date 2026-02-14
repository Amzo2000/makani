import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const COOKIE_NAME = "makani_visitor";
const TOKEN_PATTERN = /^[a-zA-Z0-9-]{8,120}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const newToken = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const sanitizeToken = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!TOKEN_PATTERN.test(normalized)) return null;
  return normalized;
};

const sanitizeProjectId = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!UUID_PATTERN.test(normalized)) return null;
  return normalized;
};

export async function POST(request: NextRequest) {
  const softFail = (reason: string) =>
    NextResponse.json({ tracked: false, reason }, { status: 202 });

  const admin = supabaseAdmin();
  if (!admin) return softFail("missing_service_role");

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const projectId = sanitizeProjectId(payload.projectId);
  if (!projectId) return softFail("invalid_project_id");

  const cookieToken = request.cookies.get(COOKIE_NAME)?.value;
  const clientToken = sanitizeToken(payload.visitorToken);
  const visitorToken = cookieToken || clientToken || newToken();

  const now = new Date().toISOString();
  const { error } = await admin.rpc("track_project_view", {
    p_project_id: projectId,
    p_visitor_token: visitorToken,
    p_viewed_at: now,
  });

  if (error) return softFail(error.message);

  const response = NextResponse.json({ tracked: true });
  if (!cookieToken) {
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
