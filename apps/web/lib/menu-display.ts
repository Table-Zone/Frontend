import { getDetailsEntries, MenuDetailPair } from './menu-details';

export function pickItemName(item: { name: string; nameEn?: string | null }, isEnglish: boolean): string {
  if (isEnglish && item.nameEn?.trim()) return item.nameEn;
  return item.name;
}

export function pickItemDescription(
  item: { description?: string | null; descriptionEn?: string | null },
  isEnglish: boolean,
): string | undefined {
  if (isEnglish && item.descriptionEn?.trim()) return item.descriptionEn;
  return item.description || undefined;
}

export function pickCategoryName(cat: { name: string; nameEn?: string | null }, isEnglish: boolean): string {
  if (isEnglish && cat.nameEn?.trim()) return cat.nameEn;
  return cat.name;
}

export function pickMenuTitle(menu: { titleAr: string; titleEn: string }, isEnglish: boolean): string {
  if (isEnglish && menu.titleEn?.trim()) return menu.titleEn;
  return menu.titleAr;
}

export { getDetailsEntries, type MenuDetailPair };
