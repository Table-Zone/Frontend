'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { publicMenuAPI, getImageUrl } from '@/lib/api';
import { Loader2, Plus, Languages, Menu as MenuIcon, ChevronLeft } from 'lucide-react';
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
  imageUrl?: string;
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
    const saved = localStorage.getItem('language');
    if (saved) {
      setIsEnglish(saved === 'en');
    } else if (!navigator.language.toLowerCase().startsWith('ar')) {
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
          <h1 className="text-2xl font-bold mb-3">
            {isEnglish ? 'Menu Not Available' : 'القائمة غير متاحة'}
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {isEnglish
              ? 'This menu hasn\'t been published yet. If you\'re the owner, go to your dashboard and publish your menu to make it visible.'
              : 'هذه القائمة لم يتم نشرها بعد. إذا كنت صاحب المطعم، توجّه إلى لوحة التحكم وانشر قائمتك لتظهر للزوار.'}
          </p>
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
    case 'bakery':
      return <>{langToggle}<BakeryTemplate menu={menu} isEnglish={isEnglish} /></>;
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
  // Warm-noir + champagne-gold identity for this template.
  const GOLD_PRICE = '#E2C786';
  const SILVER = 'linear-gradient(to bottom, #F1DEB0 0%, #E0C485 16%, #C9A96E 50%, #A98A52 84%, #E6CE97 100%)';
  const SILVER_SOFT = 'linear-gradient(to bottom, #D8BE85 0%, #A98A52 52%, #C7A969 100%)';
  // Subtle vertical brushed texture over a deep espresso-black base.
  const bodyBg =
    'repeating-linear-gradient(90deg, rgba(255,236,200,0.015) 0px, rgba(255,236,200,0.015) 1px, transparent 1px, transparent 6px), ' +
    'linear-gradient(180deg, #17130E 0%, #100D08 100%)';

  const cats = menu.categories.filter((cat: any) => cat.items.some((i: any) => i.isAvailable !== false));
  const [activeCat, setActiveCat] = useState<string>('all');
  const shown = activeCat === 'all' ? cats : cats.filter((c: any) => c.id === activeCat);

  const MetalBar = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`relative rounded-2xl px-5 py-3 text-[#2A2014] font-bold shadow-[0_6px_18px_rgba(0,0,0,0.5)] ${className}`}
      style={{ background: SILVER }}
    >
      <span className="absolute inset-x-3 top-1 h-px rounded-full bg-white/50" />
      {children}
    </div>
  );

  return (
    <div className="min-h-screen relative" style={{ background: bodyBg, color: '#EDE7DB' }} dir={isEnglish ? 'ltr' : 'rtl'}>
      {/* ===== Header card (light) ===== */}
      <header className="relative overflow-hidden">
        {menu.bannerUrl && (
          <div className="absolute inset-0">
            <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
            <div className="absolute inset-0 bg-white/82 backdrop-blur-[2px]" />
          </div>
        )}
        <div className={`relative ${menu.bannerUrl ? '' : 'bg-[#f3f1ee]'}`}>
          <div className="max-w-3xl mx-auto px-6 py-7 flex items-center gap-5">
            {menu.logoUrl ? (
              <img src={getImageUrl(menu.logoUrl)} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-xl shrink-0" fetchPriority="high" decoding="async" />
            ) : (
              <div className="w-24 h-24 rounded-full shrink-0 flex items-center justify-center text-3xl font-bold bg-white shadow-xl text-neutral-800">
                {menu.workspaceName?.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1 text-neutral-900">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide truncate">{menu.workspaceName}</h1>
              <p className="text-sm md:text-base mt-1.5 text-neutral-500">{pickMenuTitle(menu, isEnglish)}</p>
            </div>
          </div>
        </div>
        <div className="h-px w-full" style={{ background: SILVER_SOFT }} />
      </header>

      {/* ===== Filter pills ===== */}
      <div className="max-w-3xl mx-auto px-4 pt-6">
        <div className="rounded-2xl p-2 bg-white/[0.04] border border-white/10 shadow-inner overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <FilterPill active={activeCat === 'all'} onClick={() => setActiveCat('all')} silver={SILVER} silverSoft={SILVER_SOFT}>
              {isEnglish ? 'All' : 'جميع الفئات'}
            </FilterPill>
            {cats.map((cat: any) => (
              <FilterPill key={cat.id} active={activeCat === cat.id} onClick={() => setActiveCat(cat.id)} silver={SILVER} silverSoft={SILVER_SOFT}>
                {pickCategoryName(cat, isEnglish)}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Category sections ===== */}
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-16 space-y-8">
        {shown.map((cat: any) => (
          <section key={cat.id}>
            <MetalBar className="mb-4 text-lg md:text-xl text-center">{pickCategoryName(cat, isEnglish)}</MetalBar>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cat.items.filter((item: any) => item.isAvailable !== false).map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white/[0.035] border border-white/[0.07] px-4 py-3.5 flex gap-3 hover:bg-white/[0.06] transition-colors"
                >
                  {item.imageUrl && (
                    <img src={getImageUrl(item.imageUrl)} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-white/10" loading="lazy" decoding="async" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="font-bold text-[15px] text-white break-words min-w-0 leading-snug">{pickItemName(item, isEnglish)}</h4>
                      <span className="shrink-0 whitespace-nowrap text-sm font-bold tracking-wide" style={{ color: GOLD_PRICE }}>
                        {item.price} {isEnglish ? 'SAR' : 'ر.س'}
                      </span>
                    </div>
                    {pickItemDescription(item, isEnglish) && (
                      <p className="text-xs mt-1.5 leading-relaxed text-neutral-400/90">{pickItemDescription(item, isEnglish)}</p>
                    )}
                    <ItemDetailTags
                      details={item.details}
                      isEnglish={isEnglish}
                      className="flex flex-wrap gap-1.5 mt-2"
                      spanClassName="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/10"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center py-8 text-xs border-t border-white/[0.06]">
        <p className="tracking-[0.3em] uppercase text-neutral-500">{menu.workspaceName}</p>
      </footer>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  silver,
  silverSoft,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  silver: string;
  silverSoft: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 rounded-full px-5 py-2 text-sm font-bold transition-all ${
        active ? 'text-[#2A2014] shadow-[0_4px_12px_rgba(0,0,0,0.45)]' : 'text-[#C9A96E] hover:text-[#EDE7DB]'
      }`}
      style={{ background: active ? silver : silverSoft, opacity: active ? 1 : 0.35 }}
    >
      {children}
    </button>
  );
}

/* ========================================================================
   TEMPLATE 2: ORDER GRID — clean light menu with sticky category nav
   ======================================================================== */
function EditorialTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const TEAL = menu.accentColor || '#3C97A6';
  const cats = menu.categories.filter((cat: any) => cat.items.some((i: any) => i.isAvailable !== false));
  const [activeCat, setActiveCat] = useState<string>(cats[0]?.id || '');

  const scrollToCat = (id: string) => {
    setActiveCat(id);
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Scrollspy: highlight the category currently in view.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length) setActiveCat((visible[0].target as HTMLElement).dataset.cat || '');
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    );
    cats.forEach((c: any) => {
      const el = document.getElementById(`sec-${c.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.slug, cats.length]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-800" dir={isEnglish ? 'ltr' : 'rtl'}>
      {/* ===== Top bar ===== */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ backgroundColor: TEAL }}>
        <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between text-white">
          <MenuIcon className="w-6 h-6 opacity-90" />
          <span className="font-bold tracking-wide truncate">{menu.workspaceName}</span>
        </div>
      </div>

      {/* ===== Logo ===== */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4 text-center">
        {menu.logoUrl ? (
          <img src={getImageUrl(menu.logoUrl)} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-md" fetchPriority="high" decoding="async" />
        ) : (
          <div className="w-28 h-28 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-md" style={{ backgroundColor: TEAL }}>
            {menu.workspaceName?.charAt(0)}
          </div>
        )}
        <p className="text-sm mt-3 font-medium text-neutral-500">{pickMenuTitle(menu, isEnglish)}</p>
      </div>

      {/* ===== Mobile category chips ===== */}
      <div className="lg:hidden sticky top-14 z-30 bg-[#fafafa]/95 backdrop-blur border-b border-neutral-200">
        <div className="flex gap-2 overflow-x-auto px-4 py-2.5">
          {cats.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => scrollToCat(cat.id)}
              className="shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold border transition-colors"
              style={
                activeCat === cat.id
                  ? { backgroundColor: TEAL, color: '#fff', borderColor: TEAL }
                  : { backgroundColor: '#fff', color: '#525252', borderColor: '#e5e5e5' }
              }
            >
              {pickCategoryName(cat, isEnglish)}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="max-w-6xl mx-auto px-4 pb-20 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8 lg:items-start">
        {/* Sidebar nav (desktop) */}
        <aside className="hidden lg:block sticky top-20 self-start">
          <nav className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
            {cats.map((cat: any) => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => scrollToCat(cat.id)}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm border-b border-neutral-100 last:border-b-0 transition-colors"
                  style={active ? { color: TEAL, backgroundColor: `${TEAL}0F`, fontWeight: 700 } : { color: '#404040' }}
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" style={{ transform: isEnglish ? 'rotate(180deg)' : 'none', opacity: active ? 1 : 0.4 }} />
                  <span className="flex-1 text-start break-words">{pickCategoryName(cat, isEnglish)}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Menu sections */}
        <main className="space-y-10 pt-2">
          {cats.map((cat: any) => (
            <section key={cat.id} id={`sec-${cat.id}`} data-cat={cat.id} className="scroll-mt-24">
              <h2 className="text-xl font-bold mb-4 text-neutral-900 text-start">{pickCategoryName(cat, isEnglish)}</h2>
              <div className="space-y-3">
                {cat.items.filter((item: any) => item.isAvailable !== false).map((item: any) => (
                  <div key={item.id} className="flex gap-4 bg-white rounded-2xl border border-neutral-200 p-3 hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0 flex flex-col">
                      <h4 className="font-bold text-[15px] text-neutral-900 break-words leading-snug">{pickItemName(item, isEnglish)}</h4>
                      {pickItemDescription(item, isEnglish) && (
                        <p className="text-xs mt-1 leading-relaxed text-neutral-500 line-clamp-2">{pickItemDescription(item, isEnglish)}</p>
                      )}
                      <ItemDetailTags
                        details={item.details}
                        isEnglish={isEnglish}
                        className="flex flex-wrap gap-1.5 mt-2"
                        spanClassName="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500"
                      />
                      <div className="mt-auto pt-3">
                        <span className="inline-block rounded-lg px-3 py-1 text-sm font-bold" style={{ backgroundColor: `${TEAL}14`, color: TEAL }}>
                          {item.price} {isEnglish ? 'SAR' : 'ر.س'}
                        </span>
                      </div>
                    </div>
                    {item.imageUrl && (
                      <img src={getImageUrl(item.imageUrl)} alt="" className="w-28 h-28 rounded-xl object-cover shrink-0" loading="lazy" decoding="async" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>

      <footer className="text-center py-8 text-xs text-neutral-400 border-t border-neutral-200">
        <p>{menu.workspaceName} &mdash; {pickMenuTitle(menu, isEnglish)}</p>
      </footer>
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
          {menu.categories.filter((cat: any) => cat.items.some((i: any) => i.isAvailable !== false)).map((cat: any) => (
            <div key={cat.id}>
              <h3 className="text-center font-bold text-lg mb-4 tracking-widest uppercase" style={{ color: accent }}>{pickCategoryName(cat, isEnglish)}</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {cat.items.filter((item: any) => item.isAvailable !== false).map((item: any) => (
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
          {menu.categories.filter((cat: any) => cat.items.some((i: any) => i.isAvailable !== false)).map((cat: any) => (
            <div key={cat.id} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1" style={{ backgroundColor: isLightColor(bg) ? '#e5e5e5' : '#404040' }} />
                <h3 className="font-bold text-sm tracking-wide">{pickCategoryName(cat, isEnglish)}</h3>
                <div className="h-px flex-1" style={{ backgroundColor: isLightColor(bg) ? '#e5e5e5' : '#404040' }} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {cat.items.filter((item: any) => item.isAvailable !== false).map((item: any) => (
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
          {menu.categories.filter((cat: any) => cat.items.some((i: any) => i.isAvailable !== false)).map((cat: any) => (
            <div key={cat.id}>
              <h3 className="font-bold text-sm tracking-widest uppercase mb-4 text-center" style={{ color: accent }}>{pickCategoryName(cat, isEnglish)}</h3>
              <div className="space-y-0">
                {cat.items.filter((item: any) => item.isAvailable !== false).map((item: any) => (
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

/* ========================================================================
   TEMPLATE 6: BAKERY — inspired by lets-bake.menus-sa.com
   Dark maroon + amber, hero slider, sticky category pills, card grid
   ======================================================================== */
function BakeryTemplate({ menu, isEnglish }: { menu: MenuData; isEnglish: boolean }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const bg = menu.primaryColor || '#5c0707';
  const accent = menu.accentColor || '#ffaa00';
  const categoryBg = '#988264';
  const titleColor = '#f0ede4';
  const textColor = '#f5f5f5';
  const mutedColor = '#d4bfa8';
  const cardBg = '#ffffff';

  const allItems = menu.categories.flatMap((c: any) =>
    c.items.filter((i: any) => i.isAvailable !== false).map((i: any) => ({ ...i, _catId: c.id }))
  );

  const visibleCategories = menu.categories.filter((c: any) =>
    c.items.some((i: any) => i.isAvailable !== false)
  );

  const displayedItems =
    activeCategory === 'all'
      ? allItems
      : allItems.filter((i: any) => i._catId === activeCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg, color: textColor, fontFamily: 'Tajawal, sans-serif' }} dir={isEnglish ? 'ltr' : 'rtl'}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');`}</style>

      {/* Hero — overflow visible so logo circle can bleed out */}
      <div className="relative w-full" style={{ height: '260px' }}>
        <div className="absolute inset-0 overflow-hidden">
          {menu.bannerUrl ? (
            <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${bg}, ${hexToRgba(accent, 0.3)})` }} />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%)' }} />
        </div>

        {/* Circular logo — sits on top, overflows hero boundary */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
          {menu.logoUrl ? (
            <img src={getImageUrl(menu.logoUrl)} alt="" className="w-24 h-24 rounded-full object-cover shadow-xl border-4" fetchPriority="high" decoding="async" style={{ borderColor: bg }} />
          ) : (
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl border-4" style={{ backgroundColor: accent, color: bg, borderColor: bg }}>
              {menu.workspaceName?.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Store name */}
      <div className="text-center mt-16 mb-4 px-4">
        <h1 className="text-2xl font-bold" style={{ color: titleColor }}>{menu.workspaceName}</h1>
        {pickMenuTitle(menu, isEnglish) && (
          <p className="text-sm mt-1 font-medium" style={{ color: accent }}>{pickMenuTitle(menu, isEnglish)}</p>
        )}
      </div>

      {/* Sticky category scroller — circular thumbnails */}
      <div
        className="sticky top-0 z-20 overflow-x-auto py-4"
        style={{ backgroundColor: bg, borderBottom: `1px solid ${hexToRgba(accent, 0.15)}` }}
      >
        <div className="flex justify-center gap-4 px-4" style={{ width: 'max-content', minWidth: '100%' }}>
          {/* "All" circle */}
          <button onClick={() => setActiveCategory('all')} className="flex flex-col items-center gap-1.5 shrink-0">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                backgroundColor: activeCategory === 'all' ? categoryBg : hexToRgba(categoryBg, 0.25),
                color: '#fff',
                border: activeCategory === 'all' ? `3px solid ${accent}` : `3px solid transparent`,
              }}
            >
              {isEnglish ? 'All' : 'الكل'}
            </div>
            <span className="text-xs font-medium" style={{ color: activeCategory === 'all' ? accent : mutedColor }}>
              {isEnglish ? 'All' : 'الكل'}
            </span>
          </button>

          {visibleCategories.map((cat: any) => {
            const thumb = cat.imageUrl || menu.logoUrl || null;
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden transition-all"
                  style={{
                    border: isActive ? `3px solid ${accent}` : `3px solid transparent`,
                    backgroundColor: hexToRgba(categoryBg, 0.25),
                  }}
                >
                  {thumb ? (
                    <img src={getImageUrl(thumb)} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base font-bold" style={{ color: '#fff' }}>
                      {pickCategoryName(cat, isEnglish).charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium max-w-[64px] text-center leading-tight" style={{ color: isActive ? accent : mutedColor }}>
                  {pickCategoryName(cat, isEnglish)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-2xl mx-auto px-3 py-5 pb-20">
        <div className="flex flex-col gap-3">
          {displayedItems.map((item: any) => (
            <div
              key={item.id}
              className="flex gap-3 rounded-2xl overflow-hidden shadow-sm"
              style={{ backgroundColor: cardBg }}
            >
              {/* Image */}
              <div className="shrink-0" style={{ width: '107px', height: '107px' }}>
                {item.imageUrl ? (
                  <img src={getImageUrl(item.imageUrl)} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: hexToRgba(categoryBg, 0.15), color: categoryBg }}>
                    {pickItemName(item, isEnglish).charAt(0)}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight">{pickItemName(item, isEnglish)}</h4>
                  {pickItemDescription(item, isEnglish) && (
                    <p className="text-xs mt-1 leading-relaxed text-gray-500 line-clamp-2">{pickItemDescription(item, isEnglish)}</p>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className="inline-block text-xs font-semibold px-2 py-1 rounded-lg"
                    style={{ backgroundColor: categoryBg, color: '#fff' }}
                  >
                    {item.price} {isEnglish ? 'SAR' : 'ر.س'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center py-6 text-xs" style={{ color: hexToRgba(titleColor, 0.4) }}>
        <p>{menu.workspaceName}</p>
      </footer>
    </div>
  );
}
