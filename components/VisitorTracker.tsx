"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "makani_visit_tracker_v2";
const MIN_INTERVAL_MS = 5 * 60 * 1000;
const MIN_PATH_CHANGE_INTERVAL_MS = 20 * 1000;

type TrackerState = {
  at: number;
  path: string;
};

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const currentPath = pathname || "/";
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
      if (!samePath && elapsed < MIN_PATH_CHANGE_INTERVAL_MS) return;
    }

    const search = new URLSearchParams(window.location.search);
    const payload = {
      path: currentPath,
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

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          const nextState: TrackerState = { at: now, path: currentPath };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        }
      })
      .catch(() => {
        // silent analytics failure
      });
  }, [pathname]);

  return null;
}
