"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import type { Project } from '@/types';

const Home: React.FC = () => {
  const { t, language, dir } = useLanguage();
  const [featuredProjects, setFeaturedProjects] = React.useState<Project[]>([]);
  const [featuredLoading, setFeaturedLoading] = React.useState(true);
  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  React.useEffect(() => {
    const load = async () => {
      setFeaturedLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) return;
        const data = await response.json();
        setFeaturedProjects((data.projects ?? []).slice(0, 3));
      } catch {
        // ignore loading errors on homepage
      } finally {
        setFeaturedLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://abpoaxftkoepxawmxljj.supabase.co/storage/v1/object/public/images/heroCover.png" 
            alt="Hero Architecture" 
            className="w-full h-full object-cover filter brightness-[0.8]"
          />
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 h-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-white text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 max-w-4xl leading-tight">
              {t('hero', 'title')}
            </h1>
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <Link 
                href="/projects" 
                className="inline-flex items-center gap-2 text-white border border-white/30 px-8 py-4 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm"
              >
                {t('hero', 'cta')} <ArrowIcon size={16} />
              </Link>
              <p className="text-white/80 text-sm max-w-md font-light leading-relaxed">
                {t('hero', 'subtitle')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Intro Text */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">{t('philosophy', 'label')}</span>
            <h2 className="text-3xl md:text-5xl font-light leading-tight">
              {t('philosophy', 'title')}
            </h2>
          </div>
          <div className="lg:pt-8 text-neutral-600 font-light leading-relaxed space-y-6">
            <p>{t('philosophy', 'text1')}</p>
            <p>{t('philosophy', 'text2')}</p>
            <Link href="/about" className="inline-block border-b border-black text-black pb-1 text-sm uppercase tracking-widest mt-4 hover:text-neutral-600 hover:border-neutral-600 transition-colors">
              {t('philosophy', 'readMore')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 px-6 md:px-12 bg-neutral-50">
        <div className="max-w-[1600px] mx-auto mb-16 flex justify-between items-end">
          <h2 className="text-2xl md:text-3xl font-light">{t('featured', 'title')}</h2>
          <Link href="/projects" className="hidden md:flex items-center gap-2 text-sm uppercase tracking-widest hover:gap-4 transition-all">
            {t('featured', 'viewAll')} <ArrowIcon size={16} />
          </Link>
        </div>
        
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {featuredLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={`featured-skeleton-${index}`} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse bg-neutral-200" />
                    <div className="h-4 w-1/2 animate-pulse bg-neutral-200" />
                    <div className="h-4 w-1/3 animate-pulse bg-neutral-200" />
                  </div>
                </div>
              ))
            : featuredProjects.map((project, idx) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
        </div>
        
        <div className="flex justify-center mt-12 md:hidden">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest border border-black px-6 py-3">
             {t('featured', 'viewAll')} <ArrowIcon size={16} />
          </Link>
        </div>
      </section>

      {/* Services Snippet */}
      <section className="py-24 px-6 md:px-12 bg-neutral-900 text-white">
        <div className="max-w-[1600px] mx-auto text-center">
           <span className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6">{t('services', 'label')}</span>
           <h2 className="text-3xl md:text-5xl font-light mb-12">{t('services', 'title')}</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 border border-white/10 hover:border-white/30 transition-colors">
                 <h3 className="text-xl mb-4">{language === 'ar' ? 'العمارة' : (language === 'fr' ? 'Architecture' : 'Architecture')}</h3>
                 <p className="text-white/60 font-light text-sm">{language === 'ar' ? 'سكني، تجاري، ثقافي' : (language === 'fr' ? 'Résidentiel, Commercial, Culturel' : 'Residential, Commercial, Cultural')}</p>
              </div>
              <div className="p-8 border border-white/10 hover:border-white/30 transition-colors">
                 <h3 className="text-xl mb-4">{language === 'ar' ? 'التصميم الداخلي' : (language === 'fr' ? 'Intérieur' : 'Interiors')}</h3>
                 <p className="text-white/60 font-light text-sm">{language === 'ar' ? 'تخطيط، مواد، إضاءة' : (language === 'fr' ? 'Planification, Matériaux, Éclairage' : 'Spatial Planning, Materiality, Lighting')}</p>
              </div>
              <div className="p-8 border border-white/10 hover:border-white/30 transition-colors">
                 <h3 className="text-xl mb-4">{language === 'ar' ? 'تخطيط' : (language === 'fr' ? 'Urbanisme' : 'Planning')}</h3>
                 <p className="text-white/60 font-light text-sm">{language === 'ar' ? 'تصميم حضري، دراسات جدوى' : (language === 'fr' ? 'Design Urbain, Faisabilité' : 'Urban Design, Masterplanning, Feasibility')}</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
