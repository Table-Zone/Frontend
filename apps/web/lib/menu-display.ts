import { getDetailsEntries, MenuDetailPair } from './menu-details';

// Menus are Arabic-only: content (names/descriptions/titles) always renders the
// Arabic field, regardless of the visitor's browser language. The `isEnglish`
// flag still controls page chrome (dir, currency label) at the call sites.
export function pickItemName(item: { name: string; nameEn?: string | null }, _isEnglish: boolean): string {
  return item.name;
}

export function pickItemDescription(
  item: { description?: string | null; descriptionEn?: string | null },
  _isEnglish: boolean,
): string | undefined {
  return item.description || undefined;
}

export function pickCategoryName(cat: { name: string; nameEn?: string | null }, _isEnglish: boolean): string {
  return cat.name;
}

export function pickMenuTitle(menu: { titleAr: string; titleEn: string }, _isEnglish: boolean): string {
  return menu.titleAr;
}

export { getDetailsEntries, type MenuDetailPair };
