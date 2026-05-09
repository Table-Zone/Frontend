'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { publicMenuAPI, getImageUrl } from '@/lib/api';
import { Loader2, Star, Plus } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
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

  switch (template) {
    case 'noir':
    case 'default':
      return <NoirTemplate menu={menu} />;
    case 'editorial':
      return <EditorialTemplate menu={menu} />;
    case 'poster':
      return <PosterTemplate menu={menu} />;
    case 'taker':
      return <TakerTemplate menu={menu} />;
    case 'bistro':
      return <BistroTemplate menu={menu} />;
    default:
      return <NoirTemplate menu={menu} />;
  }
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
      <img src={getImageUrl(url)} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
    </div>
  );
}

/* ========================================================================
   TEMPLATE 1: NOIR LUXE
   Banner = hero header. Background = full page backdrop (optional).
   ======================================================================== */
function NoirTemplate({ menu }: any) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const bg = menu.primaryColor || '#0C0C0C';
  const accent = menu.accentColor || '#C9A96E';
  const textColor = isLightColor(bg) ? '#171717' : '#e5e5e5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#737373';
  const dividerColor = isLightColor(bg) ? '#e5e5e5' : '#262626';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir="rtl">
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10">
        <header className="relative">
          {menu.bannerUrl ? (
            <div className="relative w-full h-64 md:h-80">
              <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${bgOverlay}, ${hexToRgba(bg, 0.6)}, transparent)` }} />
            </div>
          ) : (
            <div className="w-full h-48 md:h-56" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.15)}, ${hexToRgba(accent, 0.05)})` }} />
          )}
          <div className="relative -mt-16 px-6 pb-4 text-center">
            {menu.logoUrl ? (
              <img src={getImageUrl(menu.logoUrl)} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 shadow-2xl" style={{ borderColor: `${accent}60` }} />
            ) : (
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold border" style={{ backgroundColor: `${accent}15`, color: accent, borderColor: `${accent}40` }}>
                {menu.workspaceName?.charAt(0)}
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide">{menu.workspaceName}</h1>
            <p className="text-sm mt-1 tracking-widest uppercase" style={{ color: accent }}>{menu.titleAr}</p>
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
                <h3 className="text-lg font-medium">{cat.name}</h3>
                <svg className={`w-5 h-5 transition-all ${openCategory === cat.id ? 'rotate-180' : ''}`} style={{ color: openCategory === cat.id ? accent : mutedColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openCategory === cat.id && (
                <div className="pb-5 px-2 space-y-5">
                  {cat.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      {item.imageUrl ? (
                        <img src={getImageUrl(item.imageUrl)} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 border" style={{ borderColor: dividerColor }} />
                      ) : (
                        <div className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center text-xl font-bold border" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717', color: `${accent}60`, borderColor: dividerColor }}>
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold">{item.name}</h4>
                            <span className="font-bold shrink-0 whitespace-nowrap" style={{ color: accent }}>{item.price} ر.س</span>
                          </div>
                          {item.description && <p className="text-sm mt-1 leading-relaxed" style={{ color: mutedColor }}>{item.description}</p>}
                        </div>
                        {item.details && Object.keys(item.details).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {Object.entries(item.details).map(([k, v]: [string, any]) => (
                              <span key={k} className="text-xs font-semibold px-2.5 py-1 rounded" style={{ color: mutedColor, border: `1px solid ${dividerColor}` }}>{k}: {String(v)}</span>
                            ))}
                          </div>
                        )}
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
function EditorialTemplate({ menu }: any) {
  const featuredItem = menu.categories[0]?.items[0];
  const bg = menu.primaryColor || '#F5F0EB';
  const accent = menu.accentColor || '#C75B3F';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#a3a3a3';
  const dividerColor = isLightColor(bg) ? '#d4d4d4' : '#404040';
  const bgOverlay = menu.backgroundUrl ? `${bg}D9` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir="rtl">
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10">
        <header className="relative">
          {menu.bannerUrl ? (
            <div className="relative w-full h-72 md:h-[28rem]">
              <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${bgOverlay}, transparent, ${hexToRgba(isLightColor(bg) ? '#000' : '#fff', 0.2)})` }} />
            </div>
          ) : (
            <div className="w-full h-56" style={{ background: `linear-gradient(135deg, ${hexToRgba(accent, 0.2)}, ${hexToRgba(accent, 0.05)})` }} />
          )}
          <div className="relative -mt-20 px-6 pb-2">
            <div className="flex items-end gap-5">
              {menu.logoUrl ? (
                <img src={getImageUrl(menu.logoUrl)} alt="" className="w-24 h-24 rounded-2xl object-cover shadow-xl border-4" style={{ borderColor: bgOverlay }} />
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4" style={{ backgroundColor: accent, borderColor: bgOverlay }}>
                  {menu.workspaceName?.charAt(0)}
                </div>
              )}
              <div className="pb-3">
                <h1 className="text-3xl font-bold">{menu.workspaceName}</h1>
                <p className="text-sm mt-0.5 font-medium" style={{ color: accent }}>{menu.titleAr}</p>
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
                    <img src={getImageUrl(featuredItem.imageUrl)} alt="" className="w-full h-full object-cover min-h-[140px]" />
                  </div>
                )}
                <div className="p-5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>Chef&apos;s Pick</span>
                  <h4 className="font-bold text-lg">{featuredItem.name}</h4>
                  <p className="text-sm mt-1 line-clamp-2" style={{ color: mutedColor }}>{featuredItem.description}</p>
                  <span className="font-bold mt-2" style={{ color: accent }}>{featuredItem.price} ر.س</span>
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
                <h3 className="font-bold text-lg tracking-wide whitespace-nowrap">{cat.name}</h3>
                <div className="h-px flex-1" style={{ backgroundColor: dividerColor }} />
              </div>
              <div className="space-y-6">
                {cat.items.map((item: any, idx: number) => (
                  <div key={item.id} className={`flex gap-5 ${idx % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    {item.imageUrl ? (
                      <img src={getImageUrl(item.imageUrl)} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-sm shrink-0" />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl shrink-0 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717', color: isLightColor(bg) ? '#d4d4d4' : '#404040' }}>
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-baseline justify-between gap-3">
                        <h4 className="font-bold text-base">{item.name}</h4>
                        <span className="font-bold shrink-0" style={{ color: accent }}>{item.price} ر.س</span>
                      </div>
                      {item.description && <p className="text-sm mt-1.5 leading-relaxed" style={{ color: mutedColor }}>{item.description}</p>}
                      {item.details && Object.keys(item.details).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(item.details).map(([k, v]: [string, any]) => (
                            <span key={k} className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${accent}18`, color: accent }}>{k}: {String(v)}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>

        <footer className="text-center py-8 text-xs" style={{ color: mutedColor }}>
          <p>{menu.workspaceName} &mdash; {menu.titleAr}</p>
        </footer>
      </div>
    </div>
  );
}

/* ========================================================================
   TEMPLATE 3: POSTER MINIMAL
   ======================================================================== */
function PosterTemplate({ menu }: any) {
  const bg = menu.primaryColor || '#EEF1F5';
  const accent = menu.accentColor || '#2E5AAC';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#a3a3a3';
  const bgOverlay = menu.backgroundUrl ? `${bg}E6` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: accent }} dir="rtl">
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none" style={{ color: accent }}>MENU</h1>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs font-semibold tracking-widest uppercase" style={{ color: `${accent}AA` }}>
            <span>Open Everyday</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: `${accent}60` }} />
            <span style={{ color: textColor }}>{menu.workspaceName}</span>
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: `${accent}60` }} />
            <span>07:00AM - 10:00PM</span>
          </div>
        </div>

        {menu.logoUrl && (
          <div className="flex justify-center mb-8">
            <img src={getImageUrl(menu.logoUrl)} alt="" className="w-16 h-16 rounded-full object-cover border-2" style={{ borderColor: `${accent}30` }} />
          </div>
        )}

        {menu.bannerUrl && (
          <div className="mb-8 rounded-xl overflow-hidden h-40">
            <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
          {menu.categories.map((cat: any) => (
            <div key={cat.id}>
              <h3 className="text-xl font-black mb-4 pb-2 border-b-2" style={{ color: accent, borderColor: `${accent}30` }}>{cat.name}</h3>
              <div className="space-y-3">
                {cat.items.map((item: any) => (
                  <div key={item.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-bold" style={{ color: textColor }}>{item.name}</span>
                      <span className="font-bold shrink-0" style={{ color: `${accent}CC` }}>{item.price} ر.س</span>
                    </div>
                    {item.description && <p className="text-sm mt-0.5" style={{ color: mutedColor }}>{item.description}</p>}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(item.details).map(([k, v]: [string, any]) => (
                          <span key={k} className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>{k}: {String(v)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t text-center text-xs font-semibold tracking-widest uppercase" style={{ borderColor: `${accent}18`, color: `${accent}60` }}>
          <p>{menu.titleAr}</p>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================
   TEMPLATE 4: TAKER GRID
   ======================================================================== */
function TakerTemplate({ menu }: any) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bg = menu.primaryColor || '#FFFFFF';
  const accent = menu.accentColor || '#171717';
  const textColor = isLightColor(bg) ? '#171717' : '#f5f5f5';
  const mutedColor = isLightColor(bg) ? '#737373' : '#a3a3a3';
  const cardBg = isLightColor(bg) ? '#ffffff' : '#262626';
  const bgOverlay = menu.backgroundUrl ? `${bg}E6` : bg;

  const scrollToTab = (idx: number) => {
    setActiveTab(idx);
    const el = tabRefs.current[idx];
    if (el && scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTo({ left: el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir="rtl">
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10">
        <header className="relative">
          {menu.bannerUrl ? (
            <div className="relative w-full h-48 md:h-60">
              <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${hexToRgba(bgOverlay, 0.95)}, transparent)` }} />
              <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{menu.workspaceName}</h1>
                  <p className="text-sm" style={{ color: mutedColor }}>{menu.titleAr}</p>
                </div>
                {menu.logoUrl && <img src={getImageUrl(menu.logoUrl)} alt="" className="w-14 h-14 rounded-xl object-cover border-2" style={{ borderColor: `${accent}30` }} />}
              </div>
            </div>
          ) : (
            <div className="px-4 py-6" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717' }}>
              <div className="flex items-center gap-3">
                {menu.logoUrl && <img src={getImageUrl(menu.logoUrl)} alt="" className="w-12 h-12 rounded-xl object-cover" />}
                <div>
                  <h1 className="text-xl font-bold">{menu.workspaceName}</h1>
                  <p className="text-sm" style={{ color: mutedColor }}>{menu.titleAr}</p>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="sticky top-0 z-30 border-b shadow-sm" style={{ backgroundColor: cardBg, borderColor: isLightColor(bg) ? '#f5f5f5' : '#262626' }}>
          <div ref={scrollRef} className="flex gap-1 px-2 py-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {menu.categories.map((cat: any, idx: number) => (
              <button
                key={cat.id}
                ref={(el) => { tabRefs.current[idx] = el; }}
                onClick={() => scrollToTab(idx)}
                className="shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
                style={{
                  backgroundColor: activeTab === idx ? accent : isLightColor(bg) ? '#f5f5f5' : '#171717',
                  color: activeTab === idx ? (isLightColor(accent) ? '#171717' : '#ffffff') : mutedColor,
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <main className="max-w-xl mx-auto px-3 py-4 pb-20">
          {menu.categories[activeTab] && (
            <div className="grid grid-cols-2 gap-3">
              {menu.categories[activeTab].items.map((item: any) => (
                <div key={item.id} className="rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: cardBg, borderColor: isLightColor(bg) ? '#f5f5f5' : '#262626' }}>
                  {item.imageUrl ? (
                    <div className="aspect-square overflow-hidden">
                      <img src={getImageUrl(item.imageUrl)} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: isLightColor(bg) ? '#f5f5f5' : '#171717', color: isLightColor(bg) ? '#d4d4d4' : '#404040' }}>
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="p-2.5">
                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                    {item.description && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: mutedColor }}>{item.description}</p>}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {Object.entries(item.details).map(([k, v]: [string, any]) => (
                          <span key={k} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${accent}12`, color: accent }}>{k}: {String(v)}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-sm">{item.price} <span className="text-xs font-normal" style={{ color: mutedColor }}>ر.س</span></span>
                      <button className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-colors" style={{ backgroundColor: accent, color: isLightColor(accent) ? '#171717' : '#ffffff' }}><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ========================================================================
   TEMPLATE 5: BISTRO LIST
   ======================================================================== */
function BistroTemplate({ menu }: any) {
  const bg = menu.primaryColor || '#1A1A1A';
  const accent = menu.accentColor || '#F5F0E8';
  const textColor = isLightColor(bg) ? '#171717' : '#F5F0E8';
  const mutedColor = isLightColor(bg) ? '#737373' : '#F5F0E880';
  const bgOverlay = menu.backgroundUrl ? `${bg}E8` : bg;

  return (
    <div className="min-h-screen relative" style={{ color: textColor }} dir="rtl">
      <FullBg url={menu.backgroundUrl} overlayColor={bgOverlay} />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12 pb-16">
        <div className="text-center mb-10">
          {menu.logoUrl ? (
            <img src={getImageUrl(menu.logoUrl)} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border" style={{ borderColor: `${accent}30` }} />
          ) : (
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold border" style={{ borderColor: `${accent}30` }}>
              {menu.workspaceName?.charAt(0)}
            </div>
          )}
          <h1 className="text-3xl font-light tracking-[0.2em] uppercase">{menu.workspaceName}</h1>
          <div className="w-12 h-px mx-auto mt-3" style={{ backgroundColor: `${accent}30` }} />
          <p className="text-sm mt-3 tracking-wider" style={{ color: mutedColor }}>{menu.titleAr}</p>
        </div>

        {menu.bannerUrl && (
          <div className="mb-10 rounded-lg overflow-hidden h-40 opacity-80">
            <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="space-y-10">
          {menu.categories.map((cat: any) => (
            <div key={cat.id}>
              <h3 className="text-sm font-bold tracking-[0.3em] uppercase mb-5" style={{ color: `${accent}60` }}>{cat.name}</h3>
              <div className="space-y-0">
                {cat.items.map((item: any, idx: number) => (
                  <div key={item.id} className="py-4" style={{ borderBottom: idx !== cat.items.length - 1 ? `1px solid ${hexToRgba(accent, 0.1)}` : 'none' }}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex-1 border-b mx-2 self-end mb-1.5" style={{ borderStyle: 'dotted', borderColor: `${hexToRgba(accent, 0.2)}` }} />
                      <span className="font-light shrink-0" style={{ color: `${accent}CC` }}>{item.price} ر.س</span>
                    </div>
                    {item.description && <p className="text-sm mt-1 italic" style={{ color: `${accent}50` }}>{item.description}</p>}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(item.details).map(([k, v]: [string, any]) => (
                          <span key={k} className="text-xs font-bold px-2.5 py-1 rounded" style={{ color: `${accent}AA`, border: `1px solid ${hexToRgba(accent, 0.2)}` }}>{k}: {String(v)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-6 border-t text-center" style={{ borderColor: `${hexToRgba(accent, 0.1)}` }}>
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: `${accent}30` }}>{menu.workspaceName}</p>
        </div>
      </div>
    </div>
  );
}
