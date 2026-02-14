"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Share2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import type { Project } from '@/types';

const statusLabelFromKey = (value: string, language: 'en' | 'fr' | 'ar'): string => {
  const key = value?.trim().toLowerCase();
  if (key === 'design') return language === 'fr' ? 'Conception' : language === 'ar' ? 'تصميم فقط' : 'Design only';
  if (key === 'in_progress') return language === 'fr' ? 'En cours' : language === 'ar' ? 'قيد التنفيذ' : 'In progress';
  if (key === 'completed') return language === 'fr' ? 'Terminé' : language === 'ar' ? 'مكتمل' : 'Completed';
  return value || '';
};

const ProjectDetail: React.FC = () => {
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const { language, t, dir } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [showStickyBack, setShowStickyBack] = useState(false);
  const [loadedGallery, setLoadedGallery] = useState<Record<number, boolean>>({});
  const imageIndexParam = searchParams?.get('image');
  const imageIndex = imageIndexParam ? Number(imageIndexParam) : null;
  const activeImage = project && imageIndex !== null && !Number.isNaN(imageIndex)
    ? project.images[imageIndex]
    : null;
  const projectStatus = project ? statusLabelFromKey(project.status?.[language] || project.status?.en || '', language) : '';

  const ArrowBack = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const ArrowForward = dir === 'rtl' ? ArrowLeft : ArrowRight;
  const loadingLabel =
    language === 'fr' ? 'Chargement...' :
    language === 'ar' ? 'جار التحميل...' :
    'Loading...';
  const notFoundLabel =
    language === 'fr' ? 'Projet introuvable' :
    language === 'ar' ? 'المشروع غير موجود' :
    'Project Not Found';

  useEffect(() => {
    window.scrollTo(0,0);
  }, [id]);

  useEffect(() => {
    setLoadedGallery({});
  }, [id]);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyBack(window.scrollY > 420);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          if (alive) setProject(null);
          return;
        }
        const data = await response.json();
        if (alive) {
          setProject(data.project ?? null);
        }
      } catch {
        if (alive) setProject(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [id]);

  const updateSearchParams = React.useCallback((next: URLSearchParams, mode: 'push' | 'replace' = 'push') => {
    const query = next.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (mode === 'replace') {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  }, [pathname, router]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const next = new URLSearchParams(searchParams?.toString() ?? '');
        next.delete('image');
        updateSearchParams(next, 'replace');
      }
    };
    if (activeImage) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeImage, pathname, router, search, updateSearchParams]);

  const openImage = (index: number) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.set('image', String(index));
    updateSearchParams(next, 'push');
  };

  const closeImage = () => {
    const next = new URLSearchParams(searchParams?.toString() ?? '');
    next.delete('image');
    updateSearchParams(next, 'replace');
  };

  useEffect(() => {
    if (!shareMessage) return;
    const timeout = window.setTimeout(() => setShareMessage(null), 1800);
    return () => window.clearTimeout(timeout);
  }, [shareMessage]);

  const handleShare = async () => {
    if (!activeImage) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: project?.title?.[language] || 'Makani', url: activeImage });
      } catch {
        // ignore share cancel
      }
      return;
    }
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(activeImage);
        setShareMessage('Link copied');
      } catch {
        // ignore clipboard errors
      }
      return;
    }
    setShareMessage('Sharing not supported');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-light mb-4">{loadingLabel}</h2>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-light mb-4">{notFoundLabel}</h2>
        <Link href="/projects" className="text-sm uppercase tracking-widest underline">{t('projects', 'back')}</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white min-h-screen">
        {showStickyBack && (
          <div className="fixed left-0 right-0 top-20 z-[120] px-6 md:px-12">
            <div className="mx-auto max-w-[1600px]">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/95 px-4 py-2 text-[11px] uppercase tracking-widest text-neutral-700 shadow-sm backdrop-blur"
              >
                <ArrowBack size={14} /> {t('projects', 'back')}
              </Link>
            </div>
          </div>
        )}
        {/* Detail Hero */}
        <div className="relative h-[60vh] md:h-[80vh] w-full">
          <img src={project.coverImage} alt={project.title[language]} className="block w-full h-full max-w-full min-w-0 object-cover" />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 bg-gradient-to-t from-black/50 to-transparent">
            <div className="max-w-[1600px] mx-auto text-white">
               <Link href="/projects" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest hover:text-neutral-200 transition-colors mb-4">
                 <ArrowBack size={16} /> {t('projects', 'back')}
               </Link>
               <h1 className="text-4xl md:text-6xl font-light">{project.title[language]}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 min-w-0">
          
          {/* Sidebar Info (Sticky on Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit min-w-0">
            <div className="border-t border-neutral-200 pt-8 mb-12">
               <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                 <div>
                   <span className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">{t('projectDetail', 'location')}</span>
                   <span className="text-sm">{project.location[language]}</span>
                 </div>
                 <div>
                   <span className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">{t('projectDetail', 'year')}</span>
                   <span className="text-sm">{project.year}</span>
                 </div>
                 <div>
                   <span className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">{t('projectDetail', 'area')}</span>
                   <span className="text-sm" dir="ltr">{project.area}</span>
                 </div>
                 <div>
                   <span className="block text-xs uppercase tracking-widest text-neutral-400 mb-1">{t('projectDetail', 'status')}</span>
                   <span className="text-sm">{projectStatus}</span>
                 </div>
               </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">{t('projectDetail', 'brief')}</h3>
                <p className="text-neutral-600 font-light leading-relaxed text-sm text-justify">
                  {project.description[language]}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">{t('projectDetail', 'concept')}</h3>
                <p className="text-neutral-600 font-light leading-relaxed text-sm text-justify">
                  {project.concept[language]}
                </p>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="lg:col-span-8 space-y-12 min-w-0">
            {project.images.map((img, idx) => (
              <motion.div 
                key={idx}
                className="w-full min-w-0"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="relative w-full overflow-hidden bg-neutral-100">
                  {!loadedGallery[idx] && (
                    <div className="absolute inset-0 animate-pulse bg-neutral-200" />
                  )}
                  <img
                    src={img}
                    alt={`${project.title[language]} view ${idx + 1}`}
                    className={`block w-full max-w-full min-w-0 h-auto object-cover cursor-pointer transition-opacity duration-300 ${
                      loadedGallery[idx] ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={() => openImage(idx)}
                    onLoad={() => setLoadedGallery((prev) => ({ ...prev, [idx]: true }))}
                  />
                </div>
                <p className="text-xs text-neutral-400 mt-2 text-end font-mono">
                  {t('projectDetail', 'fig')} {idx + 1}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
        
          {/* Next Project Nav */}
          <div className="border-t border-neutral-200 mt-24 pt-12 flex justify-between items-center">
            <Link href="/projects" className="text-sm uppercase tracking-widest text-neutral-400 hover:text-black">{t('projects', 'all')}</Link>
            <Link href="/contact" className="text-2xl md:text-4xl font-light hover:text-neutral-500 transition-colors flex items-center gap-2">
              {t('projects', 'startProject')} <ArrowForward size={32} />
            </Link>
          </div>
        </div>
      </div>
      {activeImage && (
        <div
          className="fixed inset-0 z-[200] bg-black"
          role="dialog"
          aria-modal="true"
          onClick={closeImage}
        >
          <div className="relative h-full w-full" onClick={(event) => event.stopPropagation()}>
            <div className="fixed left-0 right-0 top-0 z-[210] flex items-center justify-between bg-black/50 px-6 py-4">
              <button
                type="button"
                aria-label="Close preview"
                className="inline-flex items-center text-white/80 hover:text-white"
                onClick={closeImage}
              >
                <ArrowBack size={20} />
              </button>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Share image"
                  className="inline-flex items-center text-white/80 hover:text-white"
                  onClick={handleShare}
                >
                  <Share2 size={20} />
                </button>
                <a
                  aria-label="Download image"
                  className="inline-flex items-center text-white/80 hover:text-white"
                  href={activeImage}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={20} />
                </a>
              </div>
            </div>
            {shareMessage && (
              <div className="fixed left-1/2 top-20 z-[210] -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white backdrop-blur">
                {shareMessage}
              </div>
            )}
            <div className="flex h-full w-full items-center justify-center">
              <img
                src={activeImage}
                alt="Project preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetail;

