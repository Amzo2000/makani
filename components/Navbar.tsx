"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { supabaseBrowser } from '@/lib/supabase/client';

const Navbar: React.FC = () => {
  const { language, setLanguage, t, dir } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: t('nav', 'work'), path: '/projects' },
    { label: t('nav', 'studio'), path: '/about' },
    { label: t('nav', 'contact'), path: '/contact' },
  ];

  // Handle Scroll Effect for Navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = supabaseBrowser();
        const { data } = await supabase
          .from("app_settings")
          .select("address_line,city,country,contact_email")
          .eq("key", "default")
          .maybeSingle();

        if (data?.address_line) setAddressLine(data.address_line);
        if (data?.city) setCity(data.city);
        if (data?.country) setCountry(data.country);
        if (data?.contact_email) setContactEmail(data.contact_email);
      } catch {
        // keep empty fallback values
      } finally {
        setLoadingInfo(false);
      }
    };

    void loadSettings();
  }, []);

  const displayAddress = React.useMemo(() => {
    const fallbackAddress = [city?.trim(), country?.trim()].filter(Boolean).join(", ");
    const text = addressLine?.trim() || fallbackAddress;
    if (!text || !text.startsWith("{")) return text;
    try {
      const parsed = JSON.parse(text) as { en?: string; fr?: string; ar?: string };
      return (language === "fr" ? parsed.fr : language === "ar" ? parsed.ar : parsed.en) || parsed.en || text;
    } catch {
      return text;
    }
  }, [addressLine, city, country, language]);

  // Calculate slide direction based on language direction
  // LTR: Slide in from Right (translate-x-full -> 0)
  // RTL: Slide in from Left (-translate-x-full -> 0)
  const getMenuTransformClass = () => {
    if (isOpen) return 'translate-x-0 opacity-100';
    if (dir === 'rtl') return '-translate-x-full opacity-0';
    return 'translate-x-full opacity-0';
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 h-16 md:h-20 transition-colors duration-300 ease-in-out border-b ${
          isOpen ? 'z-[120]' : 'z-50'
        } ${
          scrolled && !isOpen ? 'bg-white/95 backdrop-blur-sm border-neutral-200' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className={`relative transition-colors ${isOpen ? 'text-black' : 'text-current'}`}>
            <Logo variant="dark" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-12">
            <nav className="flex gap-12">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors ${
                    pathname === item.path ? 'border-b border-black' : ''
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="h-4 w-px bg-neutral-300 mx-2"></div>
            
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
              <button 
                onClick={() => setLanguage('en')} 
                className={`hover:text-black transition-colors ${language === 'en' ? 'text-black underline' : 'text-neutral-400'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('fr')} 
                className={`hover:text-black transition-colors ${language === 'fr' ? 'text-black underline' : 'text-neutral-400'}`}
              >
                FR
              </button>
              <button 
                onClick={() => setLanguage('ar')} 
                className={`hover:text-black transition-colors ${language === 'ar' ? 'text-black underline' : 'text-neutral-400'}`}
              >
                AR
              </button>
            </div>
          </div>

          {/* Mobile Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden relative p-2 -mr-2 transition-colors ${isOpen ? 'text-black' : 'text-current'}`}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-[100] bg-white flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${getMenuTransformClass()}`}
      >
        {/* Menu Content Container */}
        <div className="flex flex-col h-full pt-28 pb-12 px-6">
          
          {/* Main Navigation Links */}
          <nav className="flex-grow flex flex-col justify-center gap-6">
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="group flex items-baseline gap-4 border-b border-neutral-100 pb-4"
              >
                <span className="text-xs font-mono text-neutral-300 group-hover:text-black transition-colors">
                  0{index + 1}
                </span>
                <span className="text-4xl font-light tracking-tight text-neutral-900 group-hover:text-neutral-500 transition-colors">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Footer Section: Language & Info */}
          <div className="mt-auto space-y-8">
            
            {/* Language Switcher */}
            <div className="flex gap-6 pt-8 border-t border-neutral-100">
               <button 
                 onClick={() => setLanguage('en')} 
                 className={`text-sm uppercase tracking-widest ${language === 'en' ? 'text-black font-bold border-b border-black' : 'text-neutral-400'}`}
               >
                 English
               </button>
               <button 
                 onClick={() => setLanguage('fr')} 
                 className={`text-sm uppercase tracking-widest ${language === 'fr' ? 'text-black font-bold border-b border-black' : 'text-neutral-400'}`}
               >
                 Français
               </button>
               <button 
                 onClick={() => setLanguage('ar')} 
                 className={`text-sm uppercase tracking-widest ${language === 'ar' ? 'text-black font-bold border-b border-black' : 'text-neutral-400'}`}
               >
                 العربية
               </button>
            </div>

            {/* Contact Quick Link */}
            <div className="text-neutral-500 text-sm font-light">
              {loadingInfo ? (
                <div className="space-y-2">
                  <div className="h-4 w-36 animate-pulse bg-neutral-200" />
                  <div className="h-4 w-44 animate-pulse bg-neutral-200" />
                </div>
              ) : (
                <>
                  <p>{displayAddress || '-'}</p>
                  {contactEmail ? (
                    <a href={`mailto:${contactEmail}`} className="text-black border-b border-neutral-200 pb-0.5 mt-2 inline-block">
                      {contactEmail}
                    </a>
                  ) : (
                    <p className="text-neutral-400 mt-2">-</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
