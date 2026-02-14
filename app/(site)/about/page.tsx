"use client";

import React, { useState } from 'react';
import { SERVICES } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { Github, Facebook, Music, Plus, Linkedin, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ABOUT_MEDIA = {
  philosophyCover: 'https://abpoaxftkoepxawmxljj.supabase.co/storage/v1/object/public/images/philosophyCover.png',
  leadership: {
    amadou: 'https://abpoaxftkoepxawmxljj.supabase.co/storage/v1/object/public/images/amadou.png',
    maimouna: 'https://abpoaxftkoepxawmxljj.supabase.co/storage/v1/object/public/images/maimouna.png',
  },
};

function SocialButton({
  icon: Icon,
  href,
  label,
}: {
  icon: LucideIcon;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className="p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300"
    >
      <Icon size={20} />
    </a>
  );
}

const About: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeMember, setActiveMember] = useState<string | null>(null);

  const toggleMember = (member: string) => {
    setActiveMember(activeMember === member ? null : member);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Intro Header */}
      <section className="bg-neutral-50 py-24 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <span className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">{t('about', 'label')}</span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight max-w-5xl">
             {t('about', 'title')}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
           {/* Image */}
           <div className="relative">
              <motion.img 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                src={ABOUT_MEDIA.philosophyCover}
                alt="Studio interior" 
                className="w-full h-auto object-cover"
              />
           </div>

           {/* Text */}
           <div className="flex flex-col justify-center space-y-12">
              <div>
                <h3 className="text-2xl font-light mb-6">{t('philosophy', 'label')}</h3>
                <div className="space-y-6 text-neutral-600 font-light leading-relaxed">
                   <p>{t('about', 'p1')}</p>
                   <p>{t('about', 'p2')}</p>
                   <p>{t('about', 'p3')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-12 border-t border-neutral-100">
                 <div>
                    <span className="text-4xl font-light block mb-2">6+</span>
                    <span className="text-xs uppercase tracking-widest text-neutral-400">{t('about', 'stats').completed}</span>
                 </div>
                 <div>
                    <span className="text-4xl font-light block mb-2">1</span>
                    <span className="text-xs uppercase tracking-widest text-neutral-400">{t('about', 'stats').countries}</span>
                 </div>
                 <div>
                    <span className="text-4xl font-light block mb-2">2025</span>
                    <span className="text-xs uppercase tracking-widest text-neutral-400">{t('about', 'stats').established}</span>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-neutral-900 text-white py-24 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl font-light">{t('about', 'whatWeDo')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-800 border border-neutral-800">
             {SERVICES.map((service) => (
               <div key={service.id} className="bg-neutral-900 p-8 hover:bg-neutral-800 transition-colors duration-300">
                  <h3 className="text-lg font-medium mb-4">{service.title[language]}</h3>
                  <p className="text-sm font-light text-neutral-400 leading-relaxed">
                    {service.description[language]}
                  </p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-[1600px] mx-auto">
          <h2 className="text-3xl font-light mb-16">{t('about', 'leadership')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
             
             {/* Amadou */}
             <div 
                className="group cursor-pointer" 
                onClick={() => toggleMember('amadou')}
             >
                <div className="relative w-full aspect-[3/4] bg-neutral-100 mb-6 overflow-hidden">
                   <img 
                    src={ABOUT_MEDIA.leadership.amadou}
                    className={`w-full h-full object-cover transition-all duration-700 ${activeMember === 'amadou' ? 'scale-105 blur-sm' : 'group-hover:scale-105'}`}
                    alt="Amadou Diallo" 
                   />
                   
                   {/* Interaction Overlay */}
                   <AnimatePresence>
                     {activeMember === 'amadou' && (
                       <motion.div 
                         initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                         animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                         exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                         className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 z-10"
                       >
                         <SocialButton icon={Facebook} href="https://web.facebook.com/amadou.diallo.2000" label="Facebook" />
                         <SocialButton icon={Music} href="https://www.tiktok.com/@amzobuilds" label="TikTok" />
                         <SocialButton icon={Linkedin} href="https://www.linkedin.com/in/amadou-diallo-757b48283" label="LinkedIn" />
                         <SocialButton icon={Github} href="https://github.com/Amzo2000" label="GitHub" />
                       </motion.div>
                     )}
                   </AnimatePresence>
                   
                   {/* Toggle Button */}
                   <div className={`absolute bottom-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${activeMember === 'amadou' ? 'bg-white text-black rotate-45' : 'bg-black text-white group-hover:bg-white group-hover:text-black'}`}>
                      <Plus size={20} />
                   </div>
                </div>
                
                <div className="flex flex-col">
                  <h4 className="font-serif text-2xl mb-1">{t('about', 'team').amadou.name}</h4>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">{t('about', 'team').amadou.role}</p>
                </div>
             </div>

             {/* Maimouna */}
             <div 
                className="group cursor-pointer" 
                onClick={() => toggleMember('maimouna')}
             >
                <div className="relative w-full aspect-[3/4] bg-neutral-100 mb-6 overflow-hidden">
                   <img 
                    src={ABOUT_MEDIA.leadership.maimouna}
                    className={`w-full h-full object-cover transition-all duration-700 ${activeMember === 'maimouna' ? 'scale-105 blur-sm' : 'group-hover:scale-105'}`}
                    alt="Maimouna Sow" 
                   />
                   
                   {/* Interaction Overlay */}
                   <AnimatePresence>
                     {activeMember === 'maimouna' && (
                       <motion.div 
                         initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                         animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                         exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                         className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 z-10"
                       >
                         <SocialButton icon={Facebook} href="https://web.facebook.com/profile.php?id=61587727990810" label="Facebook" />
                         <SocialButton icon={Mail} href="mailto:sowmaimoune564@gmail.com" label="Email" />
                       </motion.div>
                     )}
                   </AnimatePresence>

                    {/* Toggle Button */}
                   <div className={`absolute bottom-6 right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${activeMember === 'maimouna' ? 'bg-white text-black rotate-45' : 'bg-black text-white group-hover:bg-white group-hover:text-black'}`}>
                      <Plus size={20} />
                   </div>
                </div>

                <div className="flex flex-col">
                  <h4 className="font-serif text-2xl mb-1">{t('about', 'team').maimouna.name}</h4>
                  <p className="text-xs uppercase tracking-widest text-neutral-400">{t('about', 'team').maimouna.role}</p>
                </div>
             </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
