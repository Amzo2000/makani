"use client";

import React, { useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import type { Project } from '@/types';
import type { CategoryRow } from '@/lib/categories';

const Projects: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();
  const sortedCategories = React.useMemo(
    () => [...categories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [categories]
  );
  const categoryOrder = React.useMemo(
    () => new Map(sortedCategories.map((category, index) => [category.key, index])),
    [sortedCategories]
  );

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [projectsResponse, categoriesResponse] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/categories'),
        ]);
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.projects ?? []);
        }
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          const nextCategories = (categoriesData.categories ?? []) as CategoryRow[];
          setCategories(nextCategories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
        }
      } catch {
        // ignore load errors on listing page
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const filteredProjects = React.useMemo(() => {
    const validProjects = projects.filter((project) => categoryOrder.has(project.category));
    const base = filter === 'All' ? validProjects : validProjects.filter((project) => project.category === filter);
    return [...base].sort((a, b) => {
      const aOrder = categoryOrder.get(a.category) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = categoryOrder.get(b.category) ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return 0;
    });
  }, [projects, filter, categoryOrder]);

  return (
    <div className="bg-white">
      <div className="bg-neutral-50 py-24 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-4xl md:text-6xl font-light mb-6">{t('projects', 'title')}</h1>
           <p className="max-w-xl text-neutral-500 font-light leading-relaxed">
             {t('projects', 'desc')}
           </p>
        </div>
      </div>

      <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-300 shadow-sm px-6 md:px-12 py-4 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto flex flex-wrap gap-6 md:gap-12 overflow-x-auto no-scrollbar">
          {[
            { key: 'All', label: t('projects', 'all') },
            ...sortedCategories.map((category) => ({
              key: category.key,
              label: category.label?.[language] || category.label?.en || category.key,
            })),
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`text-sm uppercase tracking-widest whitespace-nowrap transition-colors ${
                filter === cat.key ? 'text-black font-medium border-b-2 border-black pb-1' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Removed py-16 to allow grid to touch footer if needed, using pt-16 and pb-0 (implicit) */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-16 pb-0">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-24"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={`project-skeleton-${index}`} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <div className="aspect-[4/3] animate-pulse bg-neutral-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-2/3 animate-pulse bg-neutral-200" />
                    <div className="h-4 w-1/2 animate-pulse bg-neutral-200" />
                    <div className="h-4 w-1/3 animate-pulse bg-neutral-200" />
                  </div>
                </div>
              ))
            : filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
        </motion.div>
        
        {!loading && filteredProjects.length === 0 && (
           <div className="py-24 text-center text-neutral-400 font-light">
             {t('projects', 'notFound')}
           </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
