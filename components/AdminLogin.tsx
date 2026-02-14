"use client";

import React, { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        return;
      }
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-light">{t("admin", "loginTitle")}</h1>
      <p className="mt-2 text-sm text-neutral-500">{t("admin", "loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-neutral-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-neutral-500">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent"
            required
          />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-neutral-800 transition-colors"
        >
          {loading ? t("admin", "loginLoading") : t("admin", "loginButton")}
        </button>
      </form>
    </div>
  );
}
