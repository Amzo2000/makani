"use client";

import React from 'react';
import Link from 'next/link';
import { Facebook, Youtube, Linkedin, Music } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { supabaseBrowser } from '@/lib/supabase/client';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const [loadingInfo, setLoadingInfo] = React.useState(true);
  const [addressLine, setAddressLine] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [facebookUrl, setFacebookUrl] = React.useState('');
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [linkedinUrl, setLinkedinUrl] = React.useState('');
  const [tiktokUrl, setTiktokUrl] = React.useState('');

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const supabase = supabaseBrowser();
        const { data } = await supabase
          .from("app_settings")
          .select("address_line,contact_email,contact_phone,facebook_url,youtube_url,linkedin_url,tiktok_url")
          .eq("key", "default")
          .maybeSingle();

        if (data?.address_line) setAddressLine(data.address_line);
        if (data?.contact_email) setContactEmail(data.contact_email);
        if (data?.contact_phone) setContactPhone(data.contact_phone);
        if (data?.facebook_url) setFacebookUrl(data.facebook_url);
        if (data?.youtube_url) setYoutubeUrl(data.youtube_url);
        if (data?.linkedin_url) setLinkedinUrl(data.linkedin_url);
        if (data?.tiktok_url) setTiktokUrl(data.tiktok_url);
      } catch {
        // keep empty fallback values
      } finally {
        setLoadingInfo(false);
      }
    };

    void loadSettings();
  }, []);
  const displayAddress = React.useMemo(() => {
    const text = addressLine?.trim();
    if (!text || !text.startsWith("{")) return addressLine;
    try {
      const parsed = JSON.parse(text) as { en?: string; fr?: string; ar?: string };
      return (language === "fr" ? parsed.fr : language === "ar" ? parsed.ar : parsed.en) || parsed.en || addressLine;
    } catch {
      return addressLine;
    }
  }, [addressLine, language]);

  return (
    <footer className="bg-neutral-900 text-neutral-400 py-20 px-6 md:px-12">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1">
          <Logo variant="light" className="text-white mb-6" textClassName="text-xl font-bold tracking-widest" />
          <p className="text-sm font-light leading-relaxed mb-6 max-w-xs">
            {t('footer', 'desc')}
          </p>
          {!loadingInfo && (facebookUrl || youtubeUrl || linkedinUrl || tiktokUrl) ? (
            <div className="flex gap-4">
              {facebookUrl ? (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
              ) : null}
              {youtubeUrl ? (
                <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
              ) : null}
              {linkedinUrl ? (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              ) : null}
              {tiktokUrl ? (
                <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="TikTok">
                  <Music size={20} />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="md:col-span-1">
          <h4 className="text-white text-sm uppercase tracking-widest mb-6">{t('footer', 'contact')}</h4>
          {loadingInfo ? (
            <div className="space-y-2">
              <div className="h-4 w-56 animate-pulse bg-neutral-800" />
              <div className="h-4 w-44 animate-pulse bg-neutral-800" />
              <div className="h-4 w-40 animate-pulse bg-neutral-800 mt-4" />
            </div>
          ) : (
            <address className="not-italic text-sm font-light flex flex-col gap-2">
              <span>{displayAddress || '-'}</span>
              <span className="mt-4">
                {contactPhone ? (
                  <a
                    href={`https://wa.me/${contactPhone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="hover:text-white inline-block"
                  >
                    {contactPhone}
                  </a>
                ) : (
                  '-'
                )}
              </span>
              <span>
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a>
                ) : (
                  '-'
                )}
              </span>
            </address>
          )}
        </div>

        <div className="md:col-span-1">
          <h4 className="text-white text-sm uppercase tracking-widest mb-6">{t('footer', 'sitemap')}</h4>
          <ul className="text-sm font-light flex flex-col gap-2">
            <li><Link href="/" className="hover:text-white transition-colors">{t('nav', 'home')}</Link></li>
            <li><Link href="/projects" className="hover:text-white transition-colors">{t('nav', 'work')}</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">{t('nav', 'studio')}</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">{t('nav', 'contact')}</Link></li>
          </ul>
        </div>

      </div>
      <div className="max-w-[1600px] mx-auto mt-20 pt-8 border-t border-neutral-800 text-xs text-neutral-600 flex justify-between items-center">
        <span>© {new Date().getFullYear()} MAKANI. {t('footer', 'rights')}</span>
        <a
          href="https://github.com/Amzo2000"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-300 transition-colors"
        >
          Designed by Amadou D.
        </a>
      </div>
    </footer>
  );
};

export default Footer;
