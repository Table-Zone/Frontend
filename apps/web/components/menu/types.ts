export interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  imageUrl?: string;
  details?: any;
  timeOfDay?: string;
  isAvailable?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameEn?: string;
  sortOrder?: number;
  items: MenuItem[];
}

export interface MenuDisplayData {
  workspaceName?: string;
  templateId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily?: string;
  logoUrl?: string;
  bannerUrl?: string;
  backgroundUrl?: string;
  titleAr: string;
  titleEn: string;
  categories: MenuCategory[];
}
