"use client";

import React, { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

type InquiryRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string | null;
  subject_i18n?: { en?: string; fr?: string; ar?: string } | null;
  message: string;
  message_i18n?: { en?: string; fr?: string; ar?: string } | null;
  status: string;
  created_at: string;
};

export default function AdminInquiries({ initialInquiries }: { initialInquiries: InquiryRow[] }) {
  const [inquiries, setInquiries] = useState<InquiryRow[]>(initialInquiries);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { t, language } = useLanguage();
  const locale = language === "fr" ? "fr-FR" : language === "ar" ? "ar" : "en-US";
  const getSubject = (inquiry: InquiryRow) => {
    const i18n = inquiry.subject_i18n;
    if (i18n) {
      return (language === "fr" ? i18n.fr : language === "ar" ? i18n.ar : i18n.en) || i18n.en || inquiry.subject || "";
    }
    return inquiry.subject || "";
  };
  const getMessage = (inquiry: InquiryRow) => {
    const i18n = inquiry.message_i18n;
    if (i18n) {
      return (language === "fr" ? i18n.fr : language === "ar" ? i18n.ar : i18n.en) || i18n.en || inquiry.message || "";
    }
    return inquiry.message || "";
  };

  const updateInquiryStatus = async (id: string, status: string) => {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase
      .from("inquiries")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setInquiries((prev) => prev.map((row) => (row.id === id ? (data as InquiryRow) : row)));
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-light">{t("admin", "inquiries")}</h1>
        <p className="mt-2 text-sm text-neutral-500">{t("admin", "inquiriesSubtitle")}</p>
        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>

      <section className="space-y-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-widest text-neutral-400">
                  {t("admin", `type_${inquiry.type}`)}
                </p>
                <p className="text-lg font-medium">{inquiry.name}</p>
                <p className="text-sm text-neutral-500">{inquiry.email}</p>
                {inquiry.phone && <p className="text-sm text-neutral-500" dir="ltr">{inquiry.phone}</p>}
                {getSubject(inquiry) && <p className="text-sm text-neutral-400">{getSubject(inquiry)}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {(["new", "read", "replied", "archived"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={busy}
                    onClick={() => updateInquiryStatus(inquiry.id, status)}
                    className={`border px-3 py-1 text-xs uppercase tracking-widest ${
                      inquiry.status === status
                        ? "border-black text-black"
                        : "border-neutral-200 text-neutral-500"
                    }`}
                  >
                    {t("admin", `status_${status}`)}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-600 whitespace-pre-wrap">{getMessage(inquiry)}</p>
            <p className="mt-3 text-xs text-neutral-400">
              {new Date(inquiry.created_at).toLocaleString(locale)}
            </p>
          </div>
        ))}
        {inquiries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
            {t("admin", "noInquiries")}
          </div>
        )}
      </section>
    </div>
  );
}
