'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { publicMenuAPI, getImageUrl } from '@/lib/api';
import { Loader2, Star, Plus, Languages } from 'lucide-react';
import {
  pickItemName,
  pickItemDescription,
  pickCategoryName,
  pickMenuTitle,
  getDetailsEntries,
} from '@/lib/menu-display';
import { formatDetailLabel, formatDetailValue } from '@/lib/menu-details';

interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  imageUrl?: string;
  details?: any;
  timeOfDay?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  nameEn?: string;
  items: MenuItem[];
}

interface MenuData {
  workspaceName: string;
  slug: string;
  templateId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  bannerUrl?: string;
  backgroundUrl?: string;
  titleAr: string;
  titleEn: string;
  categories: MenuCategory[];
}

export default function PublicMenuPage() {
  const { slug } = useParams() as { slug: string };
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.language.toLowerCase().startsWith('ar')) {
      setIsEnglish(true);
    }
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await publicMenuAPI.getMenu(slug);
        setMenu(res.data?.data?.menu || null);
      } catch {
        setError('Menu not found or not published');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 bg-neutral-950 text-white">
        <div>
          <h1 className="text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-neutral-500">{error || 'This menu is not available.'}</p>
        </div>
      </div>
    );
  }

  const template = menu.templateId || 'noir';
  const langToggle = (
    <button
      type="button"
      onClick={() => setIsEnglish((v) => !v)}
      className="fixed top-6 z-[100] flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm border border-white/20"
      style={{ [isEnglish ? 'left' : 'right']: '1rem' }}
    >
      <Languages className="w-3.5 h-3.5" />
      {isEnglish ? 'العربية' : 'English'}
    </button>
  );

  switch (template) {
    case 'noir':
    case 'default':
      return <>{langToggle}<NoirTemplate menu={menu} isEnglish={isEnglish} /></>;
    case 'editorial':
      return <>{langToggle}<EditorialTemplate menu={menu} isEnglish={isEnglish} /></>;
    case 'poster':
      return <>{langToggle}<PosterTemplate menu={menu} isEnglish={isEnglish} /></>;
    case 'taker':
      return <>{langToggle}<TakerTemplate menu={menu} isEnglish={isEnglish} /></>;
    case 'bistro':
      return <>{langToggle}<BistroTemplate menu={menu} isEnglish={isEnglish} /></>;
    default:
      return <>{langToggle}<NoirTemplate menu={menu} isEnglish={isEnglish} /></>;
  }
}

function ItemDetailTags({
  details,
  isEnglish,
  className,
  spanClassName,
}: {
  details?: unknown;
  isEnglish: boolean;
  className?: string;
  spanClassName?: string;
}) {
  const entries = getDetailsEntries(details);
  if (!entries.length) return null;
  return (
    <div className={className}>
      {entries.map((pair, i) => (
        <span key={i} className={spanClassName}>
          {formatDetailLabel(pair, isEnglish)}: {formatDetailValue(pair, isEnglish)}
        </span>
      ))}
    </div>
  );
}

/* ========================================================================
   UTILS
   ======================================================================== */
function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isLightColor(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substr(0, 2), 16);
  const g = parseInt(h.substr(2, 2), 16);
  const b = parseInt(h.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}

function FullBg({ url, overlayColor }: { url?: string; overlayColor: string }) {
  if (!url) return <div className="fixed inset-0 z-0" style={{ backgroundColor: overlayColor }} />;
  return (
    <div className="fixed inset-0 z-0">
      <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
      <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
    </div>
  );
}

/* ========================================================================
   TEMPLATE 1: NOIR LUXE
   ======================================================================== */
function NoirTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const bg = menu.primaryColor || '#0C0C0C';
  const accent = menu.accentColor || '#C9A96E';
  const textColor = isLightColor(bg) ? '#171717' : '#e5e5e5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#737373';
  const dividerColor = isLightColor(bg) ? '#e5e5e5' : '#262626';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir={isEnglish ? 'ltr' : 'rtl'}>
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10">
        <header className="relative">
          {menu.bannerUrl ? (
            <div className="relative w-full h-64 md:h-80">
              <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${bgOverlay}, ${hexToRgba(bg, 0.6)}, transparent)` }} />
            </div>
          ) : (
            <div className="w-full h-48 md:h-56" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.15)}, ${hexToRgba(accent, 0.05)})` }} />
          )}
          <div className="relative -mt-16 px-6 pb-4 text-center">
            {menu.logoUrl ? (
              <img src={getImageUrl(menu.logoUrl)} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 shadow-2xl" fetchPriority="high" decoding="async" style={{ borderColor: `${accent}60` }} />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold border" style={{ backgroundColor: `${accent}15`, color: accent, borderColor: `${accent}40` }}>
                {menu.workspaceName?.charAt(0)}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">{menu.workspaceName}</h1>
            <p className="text-sm mt-1 tracking-widest uppercase" style={{ color: accent }}>{pickMenuTitle(menu, isEnglish)}</p>
          </div>
        </header>

        <div className="flex items-center gap-4 px-6 py-6">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${hexToRgba(accent, 0.3)})` }} />
          <Star className="w-4 h-4" style={{ color: `${accent}80` }} />
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${hexToRgba(accent, 0.3)})` }} />
        </div>

        <main className="max-w-2xl mx-auto px-4 pb-16 space-y-2">
          {menu.categories.map((cat: any) => (
            <div key={cat.id} className="border-b last:border-b-0" style={{ borderColor: dividerColor }}>
              <button onClick={() => setOpenCategory(openCategory === cat.id ? null : cat.id)} className="w-full flex items-center justify-between py-5 px-2 group">
                <h3 className="text-lg font-medium">{pickCategoryName(cat, isEnglish)}</h3>
                <svg className={`w-5 h-5 transition-all ${openCategory === cat.id ? 'rotate-180' : ''}`} style={{ color: openCategory === cat.id ? accent : mutedColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openCategory === cat.id && (
                <div className="pb-5 px-2 space-y-5">
                  {cat.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      {item.imageUrl ? (
                        <img src={getImageUrl(item.imageUrl)} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 border" loading="lazy" decoding="async" style={{ borderColor: dividerColor }} />
                      ) : (
                        <div className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center text-xl font-bold border" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717', color: `${accent}60`, borderColor: dividerColor }}>
                          {pickItemName(item, isEnglish).charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between gap-3 min-w-0">
                            <h4 className="font-semibold break-words min-w-0">{pickItemName(item, isEnglish)}</h4>
                            <span className="font-bold shrink-0 whitespace-nowrap" style={{ color: accent }}>{item.price} {isEnglish ? 'SAR' : 'ر.س'}</span>
                          </div>
                          {pickItemDescription(item, isEnglish) && (
                            <p className="text-sm mt-1 leading-relaxed" style={{ color: mutedColor }}>{pickItemDescription(item, isEnglish)}</p>
                          )}
                        </div>
                        <ItemDetailTags
                          details={item.details}
                          isEnglish={isEnglish}
                          className="flex flex-wrap gap-2 mt-2"
                          spanClassName="text-xs font-semibold px-2.5 py-1 rounded border border-current/20 opacity-80"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </main>

        <footer className="text-center py-8 text-xs border-t" style={{ color: mutedColor, borderColor: isLightColor(bg) ? '#e5e5e5' : '#171717' }}>
          <p className="tracking-widest uppercase">{menu.workspaceName}</p>
        </footer>
      </div>
    </div>
  );
}

/* ========================================================================
   TEMPLATE 2: EDITORIAL FEAST
   ======================================================================== */
function EditorialTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const featuredItem = menu.categories[0]?.items[0];
  const bg = menu.primaryColor || '#F5F0EB';
  const accent = menu.accentColor || '#C75B3F';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#a3a3a3';
  const dividerColor = isLightColor(bg) ? '#d4d4d4' : '#404040';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir={isEnglish ? 'ltr' : 'rtl'}>
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10">
        <header className="relative">
          {menu.bannerUrl ? (
            <div className="relative w-full h-72 md:h-[28rem]">
              <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${bgOverlay}, transparent, ${hexToRgba(isLightColor(bg) ? '#000' : '#fff', 0.2)})` }} />
            </div>
          ) : (
            <div className="w-full h-56" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.2)}, ${hexToRgba(accent, 0.05)})` }} />
          )}
          <div className="relative -mt-20 px-6 pb-2">
            <div className="flex items-end gap-5">
              {menu.logoUrl ? (
                <img src={getImageUrl(menu.logoUrl)} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4" fetchPriority="high" decoding="async" style={{ borderColor: bgOverlay }} />
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4" style={{ backgroundColor: accent, borderColor: bgOverlay }}>
                  {menu.workspaceName?.charAt(0)}
                </div>
              )}
              <div className="pb-3 min-w-0">
                <h1 className="text-3xl font-bold break-words">{menu.workspaceName}</h1>
                <p className="text-sm mt-0.5 font-medium break-words" style={{ color: accent }}>{pickMenuTitle(menu, isEnglish)}</p>
              </div>
            </div>
          </div>
        </header>

        {featuredItem && (
          <div className="px-4 mt-6">
            <div className="max-w-xl mx-auto rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: isLightColor(bg) ? '#ffffff' : '#262626' }}>
              <div className="flex">
                {featuredItem.imageUrl && (
                  <div className="w-2/5 shrink-0">
                    <img src={getImageUrl(featuredItem.imageUrl)} alt="" className="w-full h-full object-cover min-h-[140px]" loading="lazy" decoding="async" />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>Chef&apos;s Pick</span>
                  <h4 className="font-bold text-lg">{pickItemName(featuredItem, isEnglish)}</h4>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: mutedColor }}>{pickItemDescription(featuredItem, isEnglish)}</p>
                  <span className="font-bold mt-2" style={{ color: accent }}>{featuredItem.price} {isEnglish ? 'SAR' : 'ر.س'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-xl mx-auto px-4 py-8 pb-16 space-y-8">
          {menu.categories.map((cat: any) => (
            <div key={cat.id}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1" style={{ backgroundColor: dividerColor }} />
                <h3 className="font-bold text-lg tracking-wide max-w-full">{pickCategoryName(cat, isEnglish)}</h3>
                <div className="h-px flex-1" style={{ backgroundColor: dividerColor }} />
              </div>
              <div className="space-y-6">
                {cat.items.map((item: any, idx: number) => (
                  <div key={item.id} className={`flex flex-col sm:flex-row gap-5 ${idx % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                    {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl)} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-sm shrink-0" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl shrink-0 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717', color: isLightColor(bg) ? '#d4d4d4' : '#404040' }}>
                        {pickItemName(item, isEnglish).charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-baseline justify-between gap-3 min-w-0">
                        <h4 className="font-bold text-base break-words min-w-0">{pickItemName(item, isEnglish)}</h4>
                        <span className="font-bold shrink-0" style={{ color: accent }}>{item.price} {isEnglish ? 'SAR' : 'ر.س'}</span>
                      </div>
                      {pickItemDescription(item, isEnglish) && (
                        <p className="text-sm mt-1.5 leading-relaxed" style={{ color: mutedColor }}>{pickItemDescription(item, isEnglish)}</p>
                      )}
                      <ItemDetailTags
                        details={item.details}
                        isEnglish={isEnglish}
                        className="flex flex-wrap gap-2 mt-2"
                        spanClassName="text-xs font-bold px-3 py-1.5 rounded-full opacity-90"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>

        <footer className="text-center py-8 text-xs" style={{ color: mutedColor }}>
          <p>{menu.workspaceName} &mdash; {pickMenuTitle(menu, isEnglish)}</p>
        </footer>
      </div>
    </div>
  );
}


/* ========================================================================
   TEMPLATE 3: POSTER MINIMAL
   ======================================================================== */
function PosterTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const bg = menu.primaryColor || '#EEF1F5';
  const accent = menu.accentColor || '#2E5AAC';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#525252' : '#a3a3a3';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir={isEnglish ? 'ltr' : 'rtl'}>
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10 max-w-xl mx-auto px-6 py-10">
        <header className="text-center mb-10">
          {menu.logoUrl && (
            <img src={getImageUrl(menu.logoUrl)} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 shadow-md" fetchPriority="high" decoding="async" />
          )}
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight break-words">{pickMenuTitle(menu, isEnglish)}</h1>
          <p className="text-sm mt-2 font-medium" style={{ color: accent }}>{menu.workspaceName}</p>
        </header>

        <main className="space-y-10 pb-16">
          {menu.categories.map((cat: any) => (
            <div key={cat.id}>
              <h3 className="text-center font-bold text-lg mb-4 tracking-widest uppercase" style={{ color: accent }}>{pickCategoryName(cat, isEnglish)}</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {cat.items.map((item: any) => (
                  <div key={item.id} className="text-center">
                    <h4 className="font-bold text-sm">{pickItemName(item, isEnglish)}</h4>
                    <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{pickItemDescription(item, isEnglish)}</p>
                    <span className="text-xs font-bold mt-1 inline-block" style={{ color: accent }}>{item.price} {isEnglish ? 'SAR' : 'ر.س'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

/* ========================================================================
   TEMPLATE 4: TAKER GRID
   ======================================================================== */
function TakerTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const bg = menu.primaryColor || '#FFFFFF';
  const accent = menu.accentColor || '#171717';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#a3a3a3';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir={isEnglish ? 'ltr' : 'rtl'}>
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10">
        <header className="px-5 pt-8 pb-4 flex items-center gap-4">
          {menu.logoUrl && (
            <img src={getImageUrl(menu.logoUrl)} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm" fetchPriority="high" decoding="async" />
          )}
          <div>
            <h1 className="text-xl font-bold">{menu.workspaceName}</h1>
            <p className="text-xs mt-0.5" style={{ color: mutedColor }}>{pickMenuTitle(menu, isEnglish)}</p>
          </div>
        </header>

        <main className="px-4 pb-16">
          {menu.categories.map((cat: any) => (
            <div key={cat.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ backgroundColor: isLightColor(bg) ? '#e5e5e5' : '#404040' }} />
                <h3 className="font-bold text-sm tracking-wide">{pickCategoryName(cat, isEnglish)}</h3>
                <div className="h-px flex-1" style={{ backgroundColor: isLightColor(bg) ? '#e5e5e5' : '#404040' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cat.items.map((item: any) => (
                  <div key={item.id} className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: isLightColor(bg) ? '#fafafa' : '#262626' }}>
                    {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl)} alt="" className="w-full aspect-square object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717', color: isLightColor(bg) ? '#d4d4d4' : '#404040' }}>
                        {pickItemName(item, isEnglish).charAt(0)}
                      </div>
                    )}
                    <div className="p-2.5">
                      <h4 className="font-bold text-xs truncate">{pickItemName(item, isEnglish)}</h4>
                      <span className="text-xs font-bold" style={{ color: accent }}>{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

/* ========================================================================
   TEMPLATE 5: BISTRO LIST
   ======================================================================== */
function BistroTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const bg = menu.primaryColor || '#1A1A1A';
  const accent = menu.accentColor || '#F5F0E8';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#a3a3a3';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir={isEnglish ? 'ltr' : 'rtl'}>
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10 max-w-xl mx-auto px-6 py-10">
        <header className="text-center mb-8">
          {menu.bannerUrl && (
            <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-40 object-cover rounded-xl mb-4 shadow-md" fetchPriority="high" decoding="async" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold break-words">{pickMenuTitle(menu, isEnglish)}</h1>
          <div className="w-12 h-0.5 mx-auto mt-3" style={{ backgroundColor: accent }} />
        </header>

        <main className="pb-16 space-y-8">
          {menu.categories.map((cat: any) => (
            <div key={cat.id}>
              <h3 className="font-bold text-sm tracking-widest uppercase mb-4 text-center" style={{ color: accent }}>{pickCategoryName(cat, isEnglish)}</h3>
              <div className="space-y-0">
                {cat.items.map((item: any) => (
                  <div key={item.id} className="flex items-baseline gap-2 py-3 border-b min-w-0" style={{ borderColor: isLightColor(bg) ? '#e5e5e5' : '#404040' }}>
                    <span className="font-bold text-sm min-w-0 truncate">{pickItemName(item, isEnglish)}</span>
                    <span className="flex-1 border-b border-dotted min-w-[1rem]" style={{ borderColor: isLightColor(bg) ? '#d4d4d4' : '#525252' }} />
                    <span className="font-bold text-sm shrink-0">{item.price} {isEnglish ? 'SAR' : 'ر.س'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>

        <footer className="text-center text-xs" style={{ color: mutedColor }}>
          <p>{menu.workspaceName}</p>
        </footer>
      </div>
    </div>
  );
}
