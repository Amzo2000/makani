export type CategoryLabel = {
  en: string;
  fr: string;
  ar: string;
};

export type CategoryRow = {
  id: string;
  key: string;
  label: CategoryLabel;
  sort_order: number;
  is_active: boolean;
};
