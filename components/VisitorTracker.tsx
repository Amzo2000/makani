"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "makani_visit_tracker_v2";
const VISITOR_TOKEN_KEY = "makani_visitor_token_v1";
const MIN_INTERVAL_MS = 5 * 60 * 1000;
let pendingPath: string | null = null;

type TrackerState = {
  at: number;
  path: string;
};

const ensureVisitorToken = () => {
  try {
    const existing = window.localStorage.getItem(VISITOR_TOKEN_KEY);
    if (existing) return existing;
    const token =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
};

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const currentPath = pathname || "/";
    if (pendingPath === currentPath) return;

    const now = Date.now();
    let previous: TrackerState | null = null;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        previous = JSON.parse(raw) as TrackerState;
      }
    } catch {
      previous = null;
    }

    if (previous) {
      const elapsed = now - previous.at;
      const samePath = previous.path === currentPath;
      if (samePath && elapsed < MIN_INTERVAL_MS) return;
    }

    const nextState: TrackerState = { at: now, path: currentPath };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // ignore storage errors
    }

    const search = new URLSearchParams(window.location.search);
    const payload = {
      path: currentPath,
      visitorToken: ensureVisitorToken(),
      referrer: document.referrer || null,
      language: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      screen: `${window.screen.width}x${window.screen.height}`,
      utm: {
        source: search.get("utm_source"),
        medium: search.get("utm_medium"),
        campaign: search.get("utm_campaign"),
        term: search.get("utm_term"),
        content: search.get("utm_content"),
      },
    };

    pendingPath = currentPath;
    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(() => undefined)
      .catch(() => {
        // silent analytics failure
      })
      .finally(() => {
        if (pendingPath === currentPath) {
          pendingPath = null;
        }
      });
  }, [pathname]);

  return null;
}
