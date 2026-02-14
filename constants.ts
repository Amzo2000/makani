import { Service } from './types';

export const SERVICES: Service[] = [
  {
    id: 'arch',
    title: {
      en: 'Architecture',
      fr: 'Architecture',
      ar: 'العمارة'
    },
    description: {
      en: 'Full-service architectural design from concept to construction administration. We specialize in bespoke residential and cultural projects.',
      fr: 'Conception architecturale complète, du concept à l\'administration de la construction. Nous sommes spécialisés dans les projets résidentiels et culturels sur mesure.',
      ar: 'تصميم معماري متكامل الخدمات من المفهوم إلى إدارة البناء. نحن متخصصون في المشاريع السكنية والثقافية المخصصة.'
    },
  },
  {
    id: 'interior',
    title: {
      en: 'Interior Design',
      fr: 'Design d\'Intérieur',
      ar: 'التصميم الداخلي'
    },
    description: {
      en: 'Curating internal spaces that resonate with the architectural shell. Selection of materials, furniture, and lighting design.',
      fr: 'Curater des espaces intérieurs qui résonnent avec la coque architecturale. Sélection de matériaux, mobilier et conception d\'éclairage.',
      ar: 'تنسيق المساحات الداخلية التي تتناغم مع الغلاف المعماري. اختيار المواد والأثاث وتصميم الإضاءة.'
    },
  },
  {
    id: 'urban',
    title: {
      en: 'Urban Planning',
      fr: 'Urbanisme',
      ar: 'التخطيط الحضري'
    },
    description: {
      en: 'Macro-scale analysis and master planning for sustainable community development and public spaces.',
      fr: 'Analyse à grande échelle et planification directrice pour le développement communautaire durable et les espaces publics.',
      ar: 'تحليل على نطاق واسع وتخطيط رئيسي لتنمية المجتمع المستدامة والأماكن العامة.'
    },
  },
  {
    id: 'consult',
    title: {
      en: 'Design Strategy',
      fr: 'Stratégie de Design',
      ar: 'استراتيجية التصميم'
    },
    description: {
      en: 'Feasibility studies and concept development for developers and private clients looking to maximize property potential.',
      fr: 'Études de faisabilité et développement de concepts pour les promoteurs et les clients privés cherchant à maximiser le potentiel de la propriété.',
      ar: 'دراسات الجدوى وتطوير المفاهيم للمطورين والعملاء من القطاع الخاص الذين يتطلعون إلى تعظيم إمكانات العقارات.'
    },
  },
];
