"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, MapPin, Ruler, Sparkles } from 'lucide-react';
import { Project } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ProjectCardProps {
  project: Project;
  layout?: 'portrait' | 'landscape';
}

const statusLabelFromKey = (value: string, language: 'en' | 'fr' | 'ar'): string => {
  const key = value?.trim().toLowerCase();
  if (key === 'design') return language === 'fr' ? 'Conception' : language === 'ar' ? 'تصميم فقط' : 'Design only';
  if (key === 'in_progress') return language === 'fr' ? 'En cours' : language === 'ar' ? 'قيد التنفيذ' : 'In progress';
  if (key === 'completed') return language === 'fr' ? 'Terminé' : language === 'ar' ? 'مكتمل' : 'Completed';
  return value || '';
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, layout = 'landscape' }) => {
  const { language, t } = useLanguage();
  const cover = project.coverImage || project.images?.[0] || '';
  const title = project.title?.[language] || project.title?.en || '';
  const location = project.location?.[language] || project.location?.en || '';
  const category = project.categoryLabel?.[language] || project.categoryLabel?.en || '';
  const rawStatus = project.status?.[language] || project.status?.en || '';
  const status = statusLabelFromKey(rawStatus, language);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block w-full min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className={`relative w-full overflow-hidden bg-neutral-200 ${layout === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-neutral-100 text-neutral-400">
            <Sparkles size={20} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-2">
          <span className="inline-flex max-w-[70%] items-center truncate rounded-full bg-white/90 px-3 py-1 text-[10px] uppercase tracking-widest text-neutral-800 backdrop-blur">
            {category}
          </span>
          {project.year && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-widest text-white">
              <CalendarDays size={11} />
              {project.year}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-widest backdrop-blur">
            {t('projects', 'viewProject')}
            <ArrowUpRight size={12} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-medium leading-tight text-neutral-900 transition-colors group-hover:text-black">
            {title}
          </h3>
          <ArrowUpRight size={16} className="mt-1 shrink-0 text-neutral-400 transition-colors group-hover:text-black" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-neutral-600 sm:grid-cols-2">
          <span className="inline-flex items-center gap-2">
            <MapPin size={13} className="text-neutral-400" />
            <span className="truncate">{location || '-'}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <Ruler size={13} className="text-neutral-400" />
            <span className="truncate" dir="ltr">{project.area || '-'}</span>
          </span>
        </div>

        {status && (
          <div className="mt-4 border-t border-neutral-100 pt-3">
            <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-[11px] uppercase tracking-wide text-neutral-700">
              {status}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProjectCard;

