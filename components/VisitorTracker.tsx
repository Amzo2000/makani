"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "makani_last_visit_track";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const dayKey = new Date().toISOString().slice(0, 10);
    const lastTracked = window.localStorage.getItem(STORAGE_KEY);
    if (lastTracked === dayKey) return;

    const params = new URLSearchParams({ path: pathname || "/" });
    void fetch(`/api/analytics/visit?${params.toString()}`, {
      method: "POST",
    }).then((response) => {
      if (response.ok) {
        window.localStorage.setItem(STORAGE_KEY, dayKey);
      }
    });
  }, [pathname]);

  return null;
}
