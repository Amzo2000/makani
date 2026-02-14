"use client";

import React from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import type { Language } from "@/types";

type ProvidersProps = {
  children: React.ReactNode;
  initialLanguage?: Language;
  initialHasPreference?: boolean;
};

export default function Providers({
  children,
  initialLanguage,
  initialHasPreference,
}: ProvidersProps) {
  return (
    <LanguageProvider
      initialLanguage={initialLanguage}
      initialHasPreference={initialHasPreference}
    >
      {children}
    </LanguageProvider>
  );
}
