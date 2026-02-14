"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Cog,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquareMore,
  Shapes,
  ShieldCheck,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const navItems = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", key: "projects", icon: FolderKanban },
  { href: "/admin/categories", key: "categories", icon: Shapes },
  { href: "/admin/inquiries", key: "inquiries", icon: MessageSquareMore },
  { href: "/admin/settings", key: "settings", icon: Cog },
];

export default function AdminShell({
  children,
  showNavigation = true,
}: {
  children: React.ReactNode;
  showNavigation?: boolean;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = "unset";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header
        className={`sticky top-0 border-b border-neutral-200 bg-white/95 backdrop-blur ${
          mobileMenuOpen ? "z-[120]" : "z-40"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em]">
              <ShieldCheck size={14} className="text-neutral-500" />
              <span>Makani Admin</span>
            </div>
            {showNavigation && (
              <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 border-b pb-1 transition-colors ${
                        isActive
                          ? "border-black text-black"
                          : "border-transparent text-neutral-400 hover:text-neutral-700"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{t("admin", item.key)}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs uppercase tracking-widest">
            {showNavigation && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center gap-2 border border-neutral-300 px-3 py-2 text-[10px] uppercase tracking-widest"
                aria-expanded={mobileMenuOpen}
                aria-controls="admin-mobile-menu"
                aria-label="Toggle admin menu"
              >
                {mobileMenuOpen ? <X size={14} /> : <Menu size={14} />}
                {mobileMenuOpen ? "Close" : "Menu"}
              </button>
            )}
          </div>
        </div>
      </header>
      {showNavigation && (
        <div
          id="admin-mobile-menu"
          className={`fixed inset-0 z-[100] bg-white pt-24 pb-10 px-6 transition-all duration-300 ease-out md:hidden ${
            mobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
            <nav className="flex flex-1 flex-col gap-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex items-center justify-between border-b pb-4 pt-2 transition-colors ${
                      isActive ? "border-black text-black" : "border-neutral-200 text-neutral-700 hover:text-black"
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon size={16} className={isActive ? "text-black" : "text-neutral-500"} />
                      <span className="text-sm uppercase tracking-widest">{t("admin", item.key)}</span>
                    </span>
                    <ChevronRight size={16} className="text-neutral-400 group-hover:text-black" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
