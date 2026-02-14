export type Language = 'en' | 'fr' | 'ar';

export type LocalizedString = {
  [key in Language]: string;
};

export interface Project {
  id: string;
  title: LocalizedString;
  category: string; // ID for filtering
  categoryLabel: LocalizedString; // Display label
  location: LocalizedString;
  year: string;
  area: string;
  status: LocalizedString;
  description: LocalizedString;
  concept: LocalizedString;
  coverImage: string;
  images: string[];
}

export interface Service {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
}

export interface NavItem {
  label: string; // Translation key
  path: string;
}