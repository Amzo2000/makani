"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguagePrompt from "@/components/LanguagePrompt";
import ScrollToTop from "@/components/ScrollToTop";
import VisitorTracker from "@/components/VisitorTracker";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <VisitorTracker />
      <ScrollToTop />
      <LanguagePrompt />
      <Navbar />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </div>
  );
}
