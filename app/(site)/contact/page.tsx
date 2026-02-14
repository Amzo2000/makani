"use client";

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, MapPin, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { supabaseBrowser } from '@/lib/supabase/client';
import { translateToAll, type UiLanguage } from '@/lib/mymemoryTranslate';

const Contact: React.FC = () => {
  const { t, dir, language } = useLanguage();
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [mapAddress, setMapAddress] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [mapEmbedSrc, setMapEmbedSrc] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const buildSubjectI18n = (type: string) => {
    if (type === "project") {
      return { en: "New Project Inquiry", fr: "Nouveau projet", ar: "طلب مشروع جديد" };
    }
    if (type === "press") {
      return { en: "Press / Media", fr: "Presse / Media", ar: "صحافة / إعلام" };
    }
    if (type === "career") {
      return { en: "Careers", fr: "Carrieres", ar: "وظائف" };
    }
    if (type === "other") {
      return { en: "Other", fr: "Autre", ar: "أخرى" };
    }
    return { en: "Contact", fr: "Contact", ar: "تواصل" };
  };
  const sourceLang = (language === "fr" || language === "ar" ? language : "en") as UiLanguage;

  React.useEffect(() => {
    const loadMap = async () => {
      try {
        const pickLocalized = (value: string | null | undefined) => {
          if (!value) return "";
          const text = value.trim();
          if (!text.startsWith("{")) return value;
          try {
            const parsed = JSON.parse(text) as { en?: string; fr?: string; ar?: string };
            return (language === "fr" ? parsed.fr : language === "ar" ? parsed.ar : parsed.en) || parsed.en || value;
          } catch {
            return value;
          }
        };
        const supabase = supabaseBrowser();
        const { data } = await supabase
          .from("app_settings")
          .select("address_line,latitude,longitude,contact_email,contact_phone")
          .eq("key", "default")
          .maybeSingle();
        const lat = data?.latitude;
        const lng = data?.longitude;
        if (typeof lat === "number" && typeof lng === "number") {
          setMapEmbedSrc(`https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`);
        }
        if (data?.address_line) {
          setMapAddress(pickLocalized(data.address_line));
        }
        if (data?.contact_email) {
          setContactEmail(data.contact_email);
        }
        if (data?.contact_phone) {
          setContactPhone(data.contact_phone);
        }
      } catch {
        // keep empty values on failure
      } finally {
        setSettingsLoading(false);
      }
    };
    void loadMap();
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSubmitError(null);
    setSubmitted(false);

    const subject = formData.subject || "";
    const type =
      subject === "New Project" ? "project" :
      subject === "Press" ? "press" :
      subject === "Careers" ? "career" :
      subject === "Other" ? "other" :
      "contact";

    try {
      const supabase = supabaseBrowser();
      const subjectI18n = buildSubjectI18n(type);
      const messageI18n = await translateToAll(formData.message, sourceLang);
      let payload: Record<string, unknown> = {
        type,
        name: formData.name,
        email: formData.email,
        phone: formData.phone.trim() || null,
        subject: formData.subject || null,
        subject_i18n: subjectI18n,
        message: formData.message,
        message_i18n: messageI18n,
      };
      let { error } = await supabase.from("inquiries").insert(payload);
      if (error) {
        const lower = error.message.toLowerCase();
        if (lower.includes("message_i18n")) {
          delete payload.message_i18n;
        }
        if (lower.includes("subject_i18n")) {
          delete payload.subject_i18n;
        }
        if (lower.includes("phone")) {
          delete payload.phone;
        }
        ({ error } = await supabase.from("inquiries").insert(payload));
      }

      if (error) {
        setSubmitError(error.message);
        return;
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-neutral-50 py-24 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
           <h1 className="text-4xl md:text-6xl font-light mb-6">{t('contact', 'title')}</h1>
           <p className="max-w-xl text-neutral-500 font-light leading-relaxed">
             {t('contact', 'subtitle')}
           </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Contact Info */}
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                  <MapPin size={16} /> {t('contact', 'office')}
                </h3>
                {settingsLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-56 animate-pulse bg-neutral-200" />
                    <div className="h-4 w-44 animate-pulse bg-neutral-200" />
                  </div>
                ) : (
                  <address className="not-italic text-neutral-800 font-light leading-relaxed">
                    {mapAddress || "-"}
                  </address>
                )}
              </div>
              <div>
                 <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-6 flex items-center gap-2">
                   <Mail size={16} /> {t('nav', 'contact')}
                 </h3>
                 {settingsLoading ? (
                   <div className="space-y-2">
                     <div className="h-4 w-48 animate-pulse bg-neutral-200" />
                     <div className="h-4 w-36 animate-pulse bg-neutral-200" />
                   </div>
                 ) : (
                   <div className="flex flex-col gap-2 font-light">
                     {contactEmail ? (
                       <a href={`mailto:${contactEmail}`} className="hover:text-neutral-500 transition-colors">{contactEmail}</a>
                     ) : (
                       <span>-</span>
                     )}
                     {contactPhone ? (
                        <a
                          href={`https://wa.me/${contactPhone.replace(/[^\d]/g, "")}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         dir="ltr"
                         className={`hover:text-neutral-500 transition-colors mt-2 inline-block ${dir === "rtl" ? "text-right" : ""}`}
                        >
                          {contactPhone}
                        </a>
                     ) : (
                       <span className="mt-2">-</span>
                     )}
                   </div>
                 )}
              </div>
            </div>

            {/* Map with fixed height to prevent overlap */}
            <div className="w-full h-[400px] bg-neutral-100 relative mt-auto overflow-hidden">
              {settingsLoading ? (
                <div className="absolute inset-0 animate-pulse bg-neutral-200" />
              ) : mapEmbedSrc ? (
                <iframe 
                  src={mapEmbedSrc}
                  className="absolute inset-0 w-full h-full" 
                  loading="lazy"
                  title="Office Location"
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-500">
                  Map unavailable
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white">
            <h3 className="text-2xl font-light mb-8">{t('contact', 'sendInquiry')}</h3>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-xs uppercase tracking-widest text-neutral-500">{t('contact', 'form').name}</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-neutral-300"
                    placeholder={t('contact', 'form').placeholderName}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-xs uppercase tracking-widest text-neutral-500">{t('contact', 'form').email}</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    value={formData.email}
                    onChange={handleChange}
                    dir={dir === "rtl" ? "ltr" : undefined}
                    className={`border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-neutral-300 ${
                      dir === "rtl" ? "text-right" : "text-start"
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label htmlFor="phone" className="text-xs uppercase tracking-widest text-neutral-500">
                    {language === "fr" ? "Téléphone (optionnel)" : language === "ar" ? "رقم الهاتف (اختياري)" : "Phone (optional)"}
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    dir={dir === "rtl" ? "ltr" : undefined}
                    className={`border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-neutral-300 ${
                      dir === "rtl" ? "text-right" : "text-start"
                    }`}
                    placeholder="+222 12 34 56 78"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="subject" className="text-xs uppercase tracking-widest text-neutral-500">{t('contact', 'form').subject}</label>
                <select 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleChange}
                  className="border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent text-neutral-800"
                >
                  <option value="" disabled>{t('contact', 'form').options.select}</option>
                  <option value="New Project">{t('contact', 'form').options.newProject}</option>
                  <option value="Press">{t('contact', 'form').options.press}</option>
                  <option value="Careers">{t('contact', 'form').options.careers}</option>
                  <option value="Other">{t('contact', 'form').options.other}</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-xs uppercase tracking-widest text-neutral-500">{t('contact', 'form').message}</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows={6} 
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="border-b border-neutral-300 py-3 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-neutral-300 resize-none"
                  placeholder={t('contact', 'form').placeholderMsg}
                />
              </div>

              {submitError && (
                <div className="text-sm text-red-600">{submitError}</div>
              )}
              {submitted && (
                <div className="text-sm text-green-600">Message envoye.</div>
              )}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={sending}
                  className="bg-black text-white px-8 py-4 uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {sending ? "Envoi..." : t('contact', 'form').send} <ArrowIcon size={16} />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
