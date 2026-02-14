"use client";

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguagePrompt: React.FC = () => {
  const { setLanguage, hasLanguagePreference } = useLanguage();

  if (hasLanguagePreference) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Welcome</p>
        <h2 className="mt-2 text-2xl font-light text-neutral-900">Choose your language</h2>
        <p className="mt-1 text-sm text-neutral-500">Choisissez votre langue · اختر لغتك</p>
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className="w-full rounded-full border border-neutral-900 px-4 py-3 text-sm uppercase tracking-[0.2em] text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('fr')}
            className="w-full rounded-full border border-neutral-200 px-4 py-3 text-sm uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            Français
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className="w-full rounded-full border border-neutral-200 px-4 py-3 text-sm uppercase tracking-[0.2em] text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            العربية
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguagePrompt;
