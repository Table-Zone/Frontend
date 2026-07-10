'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TZ, STATUS_META, fmtTime, QRSvg, MiniCard, PhoneMock, DEMO_MENUS } from '@/components/landing/mocks';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { subscriptionAPI, getImageUrl } from '@/lib/api';
import {
  PublicPlan,
  PERIOD_LABELS,
  getPlansForPeriod,
  getAvailablePeriods,
  getPlanBullets,
  getMostPopularPlan,
} from '@/lib/plan-utils';


const IcoCheck  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClock  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>;
const IcoQR     = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/></svg>;
const IcoBell   = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
const IcoArrow  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoWA     = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2-.2-.5-.5-.4-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3M12 22c-1.8 0-3.4-.5-4.9-1.3L3 22l1.3-4c-.9-1.5-1.4-3.2-1.4-5C2.9 7.5 7 3.4 12 3.4S21.1 7.5 21.1 13c.1 5.5-4 9-9.1 9"/></svg>;
const IcoUsers  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoChart  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>;
const IcoEdit   = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

const ADMIN_DEMO = {
  ar: {
    navOverview: 'نظرة عامة',
    navMenus: 'القوائم',
    title: 'إدارة القوائم',
    addItem: 'إضافة صنف',
    stats: [{ v: '٢٣', l: 'صنف نشط', c: TZ.green }, { v: '٤', l: 'مخفي', c: TZ.muted }, { v: '٣', l: 'فئة', c: TZ.blue }],
    items: [
      { name: 'برجر لحم كلاسيك',  cat: 'رئيسية',  price: '٢٤ ر.س', img: '/meat_burg.jpg' },
      { name: 'برجر سموكي دجاج',  cat: 'رئيسية',  price: '١٨ ر.س', img: '/smoky_chick.webp' },
      { name: 'بطاطس مقلية',      cat: 'جانبية',  price: '١٢ ر.س', img: '/fries.jpg' },
      { name: 'برجر كرسبي دجاج',  cat: 'رئيسية',  price: '٣٨ ر.س', img: '/chicken_burg.webp' },
      { name: 'مشروبات غازية',    cat: 'مشروبات', price: '٨ ر.س',  img: '/Soft_drinks.jpg' },
    ],
  },
  en: {
    navOverview: 'Overview',
    navMenus: 'Menus',
    title: 'Menu Management',
    addItem: 'Add Item',
    stats: [{ v: '23', l: 'active items', c: TZ.green }, { v: '4', l: 'hidden', c: TZ.muted }, { v: '3', l: 'categories', c: TZ.blue }],
    items: [
      { name: 'Classic Beef Burger',   cat: 'Mains',  price: '24 SAR', img: '/meat_burg.jpg' },
      { name: 'Smoky Chicken Burger',  cat: 'Mains',  price: '18 SAR', img: '/smoky_chick.webp' },
      { name: 'French Fries',          cat: 'Sides',  price: '12 SAR', img: '/fries.jpg' },
      { name: 'Crispy Chicken Burger', cat: 'Mains',  price: '38 SAR', img: '/chicken_burg.webp' },
      { name: 'Soft Drinks',           cat: 'Drinks', price: '8 SAR',  img: '/Soft_drinks.jpg' },
    ],
  },
};

function AdminDashMock() {
  const { lang, isRTL } = useLanguage();
  const demo = ADMIN_DEMO[lang];
  const [activeNav, setActiveNav] = useState('menus');
  const [toggles, setToggles] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: false, 3: true, 4: true });

  const navItems = [
    { id: 'overview', icon: <IcoChart style={{ width: 11, height: 11 }} />, label: demo.navOverview },
    { id: 'menus',    icon: <IcoQR    style={{ width: 11, height: 11 }} />, label: demo.navMenus   },
  ];

  const menuItems = demo.items;

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(44,24,16,0.10)', boxShadow: '0 12px 40px rgba(44,24,16,0.13)', background: '#F7F5F2', width: '100%' }}>
      {/* Browser chrome */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E2DD', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['#F05252', '#F0A000', '#1F8A5B'] as string[]).map((c, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
          ))}
        </div>
    
        <div style={{ width: 28 }} />
      </div>

      {/* App shell */}
      <div style={{ display: 'flex', height: 300 }} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <div style={{ width: 100, background: TZ.espresso, flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
          <div style={{ padding: '0 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 11, color: '#fff' }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: TZ.orange, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <IcoClock style={{ width: 11, height: 11, color: '#fff' }} />
              </div>
              Table Zone
            </div>
          </div>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', fontSize: 10, fontWeight: 700, background: activeNav === n.id ? 'rgba(199,91,18,0.18)' : 'transparent', color: activeNav === n.id ? TZ.orangeLt : 'rgba(250,247,242,0.55)', borderInlineStart: activeNav === n.id ? `2px solid ${TZ.orange}` : '2px solid transparent', cursor: 'pointer', transition: 'all .15s', textAlign: 'start', border: 'none', width: '100%' }}>
              <span style={{ color: activeNav === n.id ? TZ.orangeLt : 'rgba(250,247,242,0.4)', flexShrink: 0 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
          <div style={{ marginTop: 'auto', padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ background: '#fff', borderBottom: '1px solid #EAE7E3', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 800, fontSize: 11.5, color: TZ.espresso }}>{demo.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: TZ.orange, color: '#fff', borderRadius: 6, padding: '4px 9px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
              <span style={{ fontSize: 12, lineHeight: 1, marginTop: -1 }}>+</span>
              {demo.addItem}
            </div>
          </div>
          {/* Stats strip */}
          <div style={{ background: '#fff', borderBottom: '1px solid #EAE7E3', padding: '6px 14px', display: 'flex', gap: 14 }}>
            {demo.stats.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 800, fontSize: 12, color: s.c }}>{s.v}</span>
                <span style={{ fontSize: 8.5, color: TZ.muted }}>{s.l}</span>
              </div>
            ))}
          </div>
          {/* Items list */}
          <div style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 5, overflowY: 'hidden' }}>
            {menuItems.map((item, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 8, border: '1px solid #EDEAE6', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8, opacity: toggles[i] ? 1 : 0.5, transition: 'opacity .2s' }}>
                <img src={item.img} alt={item.name} style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 9.5, color: TZ.espresso, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ fontSize: 8, color: TZ.muted, marginTop: 1 }}>{item.cat}</div>
                </div>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: TZ.espresso, flexShrink: 0 }}>{item.price}</div>
                <div onClick={() => setToggles(p => ({ ...p, [i]: !p[i] }))} style={{ width: 26, height: 15, borderRadius: 999, flexShrink: 0, background: toggles[i] ? TZ.green : '#D5D0CA', position: 'relative', cursor: 'pointer', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 2, right: toggles[i] ? 2 : 11, width: 11, height: 11, borderRadius: '50%', background: '#fff', transition: 'right .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, background: TZ.cream, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                  <IcoEdit style={{ width: 10, height: 10, stroke: TZ.muted }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Plan extends PublicPlan {}

const partners = [
  { name: 'Appy', img: '/appy.jpg' },
  { name: 'Pantry', img: '/pantry.jpg' },
  { name: 'Masla', img: '/masla.jpg' },
  { name: 'Camilla', img: '/camilla.png' },
  { name: 'Sum', img: '/Sum.png' },
];

const shell: React.CSSProperties = { width: '100%', maxWidth: 1240, margin: '0 auto', padding: '0 28px' };

function QRMenuCard() {
  const { t, lang, isRTL } = useLanguage();
  const [venue, setVenue] = useState<'restaurant' | 'cafe'>('restaurant');
  const tabs = DEMO_MENUS[lang][venue];
  return (
    <div style={{ position: 'relative' }}>
      {/* Sticker — outside the overflow:hidden card so it's never clipped */}
      <div style={{ position: 'absolute', top: 10, left: -6, zIndex: 10, transform: 'rotate(-4deg)', transformOrigin: 'left center' }}>
        <div style={{ background: '#FFF8E1', border: '1.5px solid #F0C040', borderRadius: 8, padding: '5px 11px', boxShadow: '2px 3px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 13 }}>✏️</span>
          <span style={{ fontSize: 9.5, fontWeight: 800, color: '#7A5C00', lineHeight: 1.3, direction: isRTL ? 'rtl' : 'ltr' }}>{t.landing.qrStickerLine1}<br />{t.landing.qrStickerLine2}</span>
        </div>
      </div>

    <div style={{ background: '#fff', borderRadius: 24, border: `1.5px solid ${TZ.orange}`, boxShadow: `0 8px 32px rgba(199,91,18,0.12)`, overflow: 'hidden', position: 'relative' }}>
      <div style={{ background: `linear-gradient(135deg, ${TZ.orange}, ${TZ.orangeDk})`, padding: '18px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.20)', display: 'grid', placeItems: 'center', color: '#fff' }}>
            <IcoQR style={{ width: 15, height: 15 }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{t.landing.qrCardTitle}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', marginTop: 1 }}>{t.landing.qrCardSubtitle}</div>
          </div>
        </div>
      </div>

      {/* Venue toggle — own row so the phone never overlaps it */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 20px 0' }}>
        <div style={{ display: 'flex', background: TZ.cream2, borderRadius: 999, padding: 4, gap: 2 }} dir={isRTL ? 'rtl' : 'ltr'}>
          {(['restaurant', 'cafe'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVenue(v)}
              style={{ padding: '6px 16px', borderRadius: 999, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .18s', background: venue === v ? TZ.orange : 'transparent', color: venue === v ? '#fff' : TZ.muted, boxShadow: venue === v ? '0 2px 6px rgba(199,91,18,0.30)' : 'none' }}
            >
              {v === 'restaurant' ? t.landing.venueRestaurant : t.landing.venueCafe}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 20px 18px', display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'center' }}>
        <PhoneMock tabs={tabs} />
        <div style={{ background: TZ.cream, borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 20, border: `1px solid rgba(44,24,16,0.08)` }}>
          <QRSvg size={72} seed={17} />
          <div style={{ fontSize: 9.5, fontWeight: 700, color: TZ.espresso, textAlign: 'center', lineHeight: 1.4 }}>{t.landing.scanLine1}<br />{t.landing.scanLine2}</div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function LandingPage() {
  const { t, isRTL, setLang } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  const INIT_TABLES = [
    { nameKey: 'mockTable1' as const, status: 'occupied' as const, secs: 1742 },
    { nameKey: 'mockTable2' as const, status: 'warning' as const,  secs: 187  },
    { nameKey: 'mockTable3' as const, status: 'free' as const,     secs: 1800 },
    { nameKey: 'mockTable4' as const, status: 'alert' as const,    secs: -94  },
  ];
  const [tables, setTables] = useState(INIT_TABLES);
  const [timerSecs, setTimerSecs] = useState({ occupied: 896, warning: 214, alert: -62 });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setTables(prev => prev.map(t => t.status === 'free' ? t : { ...t, secs: t.secs - 1 }));
      setTimerSecs(p => ({ occupied: p.occupied - 1, warning: p.warning - 1, alert: p.alert - 1 }));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const timerCards = [
    { status: 'free',     time: '––:––',                     desc: t.landing.timerDescFree },
    { status: 'occupied', time: fmtTime(timerSecs.occupied), desc: t.landing.timerDescOccupied },
    { status: 'warning',  time: fmtTime(timerSecs.warning),  desc: t.landing.timerDescWarning },
    { status: 'alert',    time: fmtTime(timerSecs.alert),    desc: t.landing.timerDescAlert },
  ];


  const fetchPlans = () => {
    setPlansLoading(true);
    setPlansError(false);
    subscriptionAPI.getPlans()
      .then((res) => setPlans(res.data.data.plans || []))
      .catch(() => setPlansError(true))
      .finally(() => setPlansLoading(false));
  };
  useEffect(() => { fetchPlans(); }, []);

  const availablePeriods = getAvailablePeriods(plans);
  const activePeriod = availablePeriods.includes(billingPeriod)
    ? billingPeriod
    : (availablePeriods[0] as 'monthly' | 'quarterly' | undefined) || billingPeriod;
  const plansForPeriod = getPlansForPeriod(plans, activePeriod);
  const mostPopularPlan = getMostPopularPlan(plansForPeriod);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Tajawal', sans-serif", background: TZ.cream, color: TZ.espresso, minHeight: '100vh' }}>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .marquee-track { display:flex; width:max-content; animation:marquee 18s linear infinite; will-change:transform; }
        .marquee-track:hover { animation-play-state:paused; }
        @keyframes blinkRed { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes spinLoader { to { transform: rotate(360deg); } }
        .nav-link { font-size:14px; font-weight:600; color:${TZ.espresso}; opacity:.8; text-decoration:none; transition:opacity .15s; }
        .nav-link:hover { opacity:1; }
        .footer-link { font-size:13px; color:${TZ.muted}; text-decoration:none; transition:color .15s; }
        .footer-link:hover { color:${TZ.orange}; }
        @media(max-width:900px){
          .hero-cards { grid-template-columns:1fr !important; }
          .qr-grid { grid-template-columns:1fr !important; }
          .timer-grid { grid-template-columns:1fr 1fr !important; }
          .pricing-grid { grid-template-columns:1fr !important; max-width:400px !important; }
          .footer-grid { grid-template-columns:1fr 1fr !important; }
          .nav-links-center { display:none !important; }
          .nav-btn { padding:7px 12px !important; font-size:12px !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)', background: scrolled ? 'rgba(250,247,242,0.92)' : 'rgba(250,247,242,0.78)', borderBottom: `1px solid ${scrolled ? 'rgba(44,24,16,0.09)' : 'transparent'}`, transition: 'all .2s ease' }}>
        <div style={{ ...shell, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 17, color: TZ.espresso, whiteSpace: 'nowrap' }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              <Image src="/logo.jpg" alt="Table Zone" width={34} height={34} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            Table Zone
          </div>
          <div className="nav-links-center" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {([['#qr', t.landing.navQrMenu], ['#pricing', t.landing.navPricing], ['#partners', t.landing.navPartners]] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setLang(isRTL ? 'en' : 'ar')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 6, display: 'grid', placeItems: 'center', transition: 'opacity .15s' }} aria-label="Toggle language"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.7'}>
              <svg viewBox="0 0 122.88 92.91" style={{ width: 22, height: 22, fill: TZ.espresso }} xmlns="http://www.w3.org/2000/svg">
                <path d="M20.15,83.63,31.63,73.4a2.89,2.89,0,0,1,1.91-.73h27.8a.92.92,0,0,0,.93-.93V65.9H68v5.84a6.71,6.71,0,0,1-6.68,6.68H34.62L19.3,92.07a2.87,2.87,0,0,1-4.9-2V78.42H6.69A6.71,6.71,0,0,1,0,71.74V28.59a6.76,6.76,0,0,1,6.69-6.68H43.35v5.75H6.69a1,1,0,0,0-.94.93V71.74a.91.91,0,0,0,.28.65,1,1,0,0,0,.66.28H17.27a2.88,2.88,0,0,1,2.88,2.88v8.08Zm.21-19.48L29.6,36.24h8.83l9.24,27.91H40.35L38.8,59.07H29.15l-1.51,5.08ZM30.79,53.24h6.37L34,41.81,30.79,53.24ZM76.63,13.35h8.7V11.11a.69.69,0,0,1,.69-.69h4.65a.68.68,0,0,1,.68.69v2.24h9.76a.68.68,0,0,1,.68.69V18.5a.68.68,0,0,1-.68.68H99.56a26.3,26.3,0,0,1-.91,3.88l0,.06a26.07,26.07,0,0,1-1.74,4.15,32.34,32.34,0,0,1-2.14,3.43c-.67,1-1.41,1.9-2.2,2.83a35.78,35.78,0,0,0,3.68,3.83,41.43,41.43,0,0,0,5.09,3.74.68.68,0,0,1,.21.94l-2.39,3.73a.69.69,0,0,1-1,.2,45.88,45.88,0,0,1-5.58-4.08l0,0a41.42,41.42,0,0,1-4-4.1C87.3,38.93,86.15,40,85,41l0,0c-1.36,1.12-2.79,2.2-4.47,3.36a.69.69,0,0,1-1-.17L77,40.53a.69.69,0,0,1,.17-1c1.66-1.14,3-2.19,4.36-3.28,1.16-1,2.28-2,3.49-3.16a44.82,44.82,0,0,1-2.77-4.45A28.84,28.84,0,0,1,80,22.9a.68.68,0,0,1,.47-.84l4.27-1.19a.68.68,0,0,1,.84.47A22.62,22.62,0,0,0,89,28.7L90.27,27a26.33,26.33,0,0,0,1.51-2.47l0,0A19.43,19.43,0,0,0,93,21.62a24,24,0,0,0,.66-2.44h-17a.69.69,0,0,1-.69-.68V14a.69.69,0,0,1,.69-.69Zm27,56.82L88.26,56.51H61.54a6.73,6.73,0,0,1-6.69-6.68V6.69a6.71,6.71,0,0,1,2-4.72l.2-.18A6.67,6.67,0,0,1,61.54,0h54.65a6.69,6.69,0,0,1,4.71,2l.19.2a6.69,6.69,0,0,1,1.79,4.51V49.83a6.73,6.73,0,0,1-6.69,6.68h-7.7V68.13a2.88,2.88,0,0,1-4.91,2ZM91.26,51.49l11.47,10.23V53.64a2.88,2.88,0,0,1,2.88-2.88h10.58a.92.92,0,0,0,.65-.28.91.91,0,0,0,.29-.65V6.69a1,1,0,0,0-.22-.58L116.84,6a1,1,0,0,0-.65-.29H61.54A.94.94,0,0,0,61,6L60.89,6a.92.92,0,0,0-.28.65V49.83a.92.92,0,0,0,.93.93H89.35a2.86,2.86,0,0,1,1.91.73Z"/>
              </svg>
            </button>
            <Link href="/login" className="nav-btn" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 999, fontWeight: 700, fontSize: 14, background: '#fff', color: TZ.espresso, border: `1px solid rgba(44,24,16,0.14)`, textDecoration: 'none' }}>
              {t.login}
            </Link>
            <Link href="/register" className="nav-btn" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 999, fontWeight: 700, fontSize: 14, background: TZ.orange, color: '#fff', boxShadow: '0 8px 20px rgba(201,91,34,0.28)', textDecoration: 'none' }}>
              {t.landing.getStarted}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '64px 0 80px', background: `radial-gradient(900px 500px at 70% -10%, rgba(199,91,18,0.11), transparent 55%), radial-gradient(600px 400px at 5% 30%, rgba(199,91,18,0.06), transparent 55%), ${TZ.cream}`, overflow: 'hidden' }}>
        <div style={shell}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <h1 style={{ fontSize: 'clamp(40px,4.8vw,70px)', lineHeight: 1.05, fontWeight: 900, color: TZ.espresso, letterSpacing: '-0.02em', margin: '0 0 18px' }}>
              {t.landing.heroTitle}<br /><span style={{ color: TZ.orange }}>{t.landing.heroTitleHighlight}</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px,1.3vw,19px)', color: TZ.muted, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 30px' }}>
              {t.landing.heroDesc}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '18px 32px', borderRadius: 999, fontWeight: 700, fontSize: 17, background: TZ.orange, color: '#fff', boxShadow: '0 8px 20px rgba(201,91,34,0.28)', textDecoration: 'none' }}>
                {t.landing.startNow}
                <IcoArrow style={{ width: 16, height: 16, transform: isRTL ? 'scaleX(-1)' : 'none', flexShrink: 0 }} />
              </Link>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '18px 32px', borderRadius: 999, fontWeight: 700, fontSize: 17, background: '#fff', color: TZ.espresso, border: `1px solid rgba(44,24,16,0.14)`, textDecoration: 'none' }}>
                {t.login}
              </Link>
            </div>
          </div>

          {/* Two product cards */}
          <div className="hero-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start', maxWidth: 980, margin: '0 auto' }}>
            {/* Product 1 — Table Timer */}
            <div style={{ background: '#fff', borderRadius: 24, border: `1px solid rgba(44,24,16,0.09)`, boxShadow: '0 8px 32px rgba(44,24,16,0.08)', overflow: 'hidden' }}>
              <div style={{ background: TZ.espresso, padding: '18px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: TZ.orange, display: 'grid', placeItems: 'center', color: '#fff' }}>
                    <IcoClock style={{ width: 15, height: 15 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{t.landing.timerCardTitle}</div>
                    <div style={{ fontSize: 10, color: 'rgba(250,247,242,.55)', marginTop: 1 }}>{t.landing.timerCardSubtitle}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, color: 'rgba(250,247,242,.8)' }}>
                  <IcoBell style={{ width: 11, height: 11 }} />{t.landing.timerCardAlert}
                </div>
              </div>
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {tables.map((tb, i) => <MiniCard key={i} name={t.landing[tb.nameKey]} status={tb.status} secs={tb.secs} />)}
              </div>
              <div style={{ padding: '0 14px 14px' }}>
              </div>
            </div>

            {/* Product 2 — QR Menu */}
            <QRMenuCard />
          </div>
        </div>
      </section>

      {/* ── PRODUCT 1 — TABLE TIMERS ── */}
      <section id="timers" style={{ padding: '88px 0', background: TZ.cream, borderTop: '1px solid rgba(44,24,16,0.08)' }}>
        <div style={shell}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,48px)', fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>{t.landing.timersTitle}</h2>
            <p style={{ fontSize: 17, color: TZ.muted, lineHeight: 1.7 }}>{t.landing.timersDesc}</p>
          </div>
          <div className="timer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
            {timerCards.map((c, i) => {
              const m = STATUS_META[c.status as keyof typeof STATUS_META];
              return (
                <div key={i} style={{ background: '#fff', borderRadius: 20, border: `2px solid ${m.bd}`, padding: '24px 20px 22px', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: `0 4px 16px ${m.bg}`, transition: 'transform .2s ease, box-shadow .2s ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 28px ${m.bg}`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${m.bg}`; }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, width: 'fit-content', background: m.bg, borderRadius: 999, padding: '4px 10px' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0, ...(c.status === 'alert' ? { animation: 'blinkRed 1.2s infinite' } : {}) }}></span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{t.landing[m.labelKey]}</span>
                  </div>
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: `linear-gradient(135deg,${m.bg},transparent)`, border: `3px solid ${m.bd}`, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 19, fontWeight: 800, color: c.status === 'free' ? TZ.muted : m.color, letterSpacing: '-0.02em' }}>{c.time}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: TZ.espresso, marginBottom: 4 }}>{t.landing[m.labelKey]}</div>
                    <p style={{ fontSize: 13, color: TZ.muted, lineHeight: 1.55 }}>{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
       
        </div>
      </section>

      {/* ── QR SECTION ── */}
      <section id="qr" style={{ padding: '88px 0', background: TZ.cream, borderTop: '1px solid rgba(44,24,16,0.08)' }}>
        <div style={shell}>
          <div className="qr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(30px,3.6vw,48px)', fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>{t.landing.qrSectionTitle}</h2>
              <p style={{ fontSize: 17, color: TZ.muted, marginBottom: 32, lineHeight: 1.7 }}>
                {t.landing.qrSectionDesc}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { title: t.landing.qrStep1Title, desc: t.landing.qrStep1Desc },
                  { title: t.landing.qrStep2Title, desc: t.landing.qrStep2Desc },
                  { title: t.landing.qrStep3Title, desc: t.landing.qrStep3Desc },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: TZ.orange, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{(i + 1).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: TZ.espresso, marginBottom: 2 }}>{s.title}</div>
                      <p style={{ fontSize: 14, color: TZ.muted, lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '20px 0' }}>
              <AdminDashMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="partners" className="py-12 overflow-hidden" style={{ background: TZ.cream, borderTop: '1px solid rgba(44,24,16,0.08)', borderBottom: '1px solid rgba(44,24,16,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 mb-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {t.landing.ourPartners}
          </p>
        </div>
        <div className="overflow-hidden" dir="ltr">
          <div className="marquee-track">
            {[...partners, ...partners, ...partners].map((p, i) => (
              <div key={i} className="flex items-center justify-center mx-4 sm:mx-8 rounded-2xl overflow-hidden bg-white border border-tz-cream-dark w-24 h-16 sm:w-32 sm:h-20 shrink-0">
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '88px 0', background: TZ.cream }}>
        <div style={shell}>
          <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 56px' }}>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,48px)', fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>
              {t.landing.pricingTitle}
            </h2>
            {/* Billing Period Toggle */}
            {availablePeriods.length > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#fff', borderRadius: 16, padding: 6, border: '1px solid rgba(44,24,16,0.08)', gap: 4, marginTop: 12 }}>
              {availablePeriods.map((period) => {
                const label = PERIOD_LABELS[period];
                return (
              <button
                key={period}
                onClick={() => setBillingPeriod(period)}
                style={{ padding: '10px 22px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .2s', ...(activePeriod === period ? { background: TZ.orange, color: '#fff', boxShadow: '0 2px 8px rgba(199,91,34,0.25)' } : { background: 'transparent', color: TZ.muted }) }}
              >
                {label ? (isRTL ? label.ar : label.en) : period}
              </button>
                );
              })}
            </div>
            )}
          </div>

          {plansLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px solid ${TZ.orange}`, borderTopColor: 'transparent', animation: 'spinLoader 0.8s linear infinite' }}></div>
              <p style={{ fontSize: 14, color: TZ.muted }}>{t.landing.loadingPlans}</p>
            </div>
          ) : plansError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
              <p style={{ fontSize: 14, color: TZ.muted }}>{t.landing.failedToLoad}</p>
              <button onClick={fetchPlans} style={{ padding: '10px 24px', borderRadius: 999, background: TZ.orange, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none' }}>{t.landing.tryAgain}</button>
            </div>
          ) : (
            <div
              className="pricing-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(Math.max(plansForPeriod.length, 1), 3)}, 1fr)`,
                gap: 18,
                maxWidth: Math.min(plansForPeriod.length, 3) * 340,
                margin: '0 auto',
              }}
            >
              {plansForPeriod.map((plan) => {
                const isPopular = mostPopularPlan?.id === plan.id;
                const bullets = getPlanBullets(plan, isRTL);
                const title = isRTL ? plan.labelAr : plan.labelEn;
                const subtitle = (isRTL ? plan.descriptionAr : plan.descriptionEn)?.trim();
                const cardBg = isPopular ? TZ.espresso : '#fff';
                const textColor = isPopular ? '#FAF7F2' : TZ.espresso;
                const mutedColor = isPopular ? 'rgba(250,247,242,0.6)' : TZ.muted;

                return (
                  <div
                    key={plan.id}
                    style={{
                      background: cardBg,
                      border: isPopular ? 'none' : '1px solid rgba(44,24,16,0.08)',
                      borderRadius: 24,
                      padding: 32,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transform: isPopular ? 'translateY(-12px)' : 'none',
                      boxShadow: isPopular ? '0 24px 60px rgba(44,24,16,0.14)' : 'none',
                    }}
                  >
                    {isPopular && (
                      <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: TZ.orange, color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                        {t.landing.mostPopular}
                      </div>
                    )}
                    {plan.imageUrl && (
                      <img
                        src={getImageUrl(plan.imageUrl)}
                        alt=""
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 16, marginBottom: 16 }}
                      />
                    )}
                    <div style={{ fontSize: 13, fontWeight: 700, color: isPopular ? TZ.orangeLt : TZ.muted, marginBottom: 6 }}>
                      {plan.durationDays} {t.landing.days}
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: textColor, margin: '0 0 8px' }}>{title}</h3>
                    {subtitle && (
                      <p style={{ fontSize: 14, color: mutedColor, margin: '0 0 14px', lineHeight: 1.5 }}>{subtitle}</p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 44, fontWeight: 900, color: textColor, letterSpacing: '-0.02em' }}>{plan.priceSar}</span>
                      <span style={{ fontSize: 13, color: mutedColor }}>{t.landing.sar}</span>
                      {plan.displayPriceSar && plan.displayPriceSar > plan.priceSar && (
                        <span style={{ fontSize: 14, color: mutedColor, textDecoration: 'line-through' }}>
                          {plan.displayPriceSar} {t.landing.sar}
                        </span>
                      )}
                    </div>
                    {plan.discountPercent ? (
                      <p style={{ fontSize: 13, color: isPopular ? TZ.orangeLt : TZ.orange, marginBottom: 20, fontWeight: 700 }}>
                        -{plan.discountPercent}%
                      </p>
                    ) : (
                      <div style={{ marginBottom: 20 }} />
                    )}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                      {bullets.map((f, k) => (
                        <li key={k} style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', color: isPopular ? 'rgba(250,247,242,0.85)' : TZ.espresso }}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', background: isPopular ? 'rgba(224,122,63,0.25)' : TZ.orangeTint, color: isPopular ? TZ.orangeLt : TZ.orangeDk, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <IcoCheck style={{ width: 10, height: 10 }} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'center',
                        padding: '14px 26px',
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 15,
                        background: isPopular ? TZ.orange : '#fff',
                        color: isPopular ? '#fff' : TZ.espresso,
                        border: isPopular ? 'none' : '1px solid rgba(44,24,16,0.14)',
                        boxShadow: isPopular ? '0 8px 20px rgba(201,91,34,0.28)' : 'none',
                        textDecoration: 'none',
                      }}
                    >
                      {t.landing.getStarted}
                    </Link>
                  </div>
                );
              })}
              {plansForPeriod.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: TZ.muted, padding: '24px 0' }}>{t.landing.noPlans}</div>
              )}
            </div>
          )}
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer style={{ padding: '56px 0 36px', borderTop: `1px solid rgba(44,24,16,0.08)` }}>
        <div style={shell}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 17, color: TZ.espresso, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
                  <Image src="/logo.jpg" alt="Table Zone" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                Table Zone
              </div>
              <p style={{ fontSize: 14, color: TZ.muted, maxWidth: 260, lineHeight: 1.6 }}>{t.landing.footerDesc}</p>
            </div>
            {([
              { title: t.landing.footerColProduct, links: [[t.landing.footerTimers, '#timers'], [t.landing.navQrMenu, '#qr'], [t.landing.navPricing, '#pricing']] },
              { title: t.landing.footerColCompany, links: [[t.landing.footerAbout, '#'], [t.landing.navPartners, '#partners'], [t.landing.footerContact, 'https://wa.me/966501549458']] },
              { title: t.landing.footerColSupport, links: [[t.landing.footerHelp, '#'], [t.landing.footerTerms, '/terms'], [t.landing.footerPrivacy, '/privacy'], [t.landing.footerEula, '/eula']] },
            ] as { title: string; links: [string, string][] }[]).map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: TZ.espresso, marginBottom: 12 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {col.links.map(([label, href], k) => (
                    <li key={k}><Link href={href} className="footer-link">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 20, borderTop: `1px solid rgba(44,24,16,0.07)`, fontSize: 12, color: TZ.muted }}>
            <span>{t.landing.footerCopyright}</span>
          </div>
        </div>
      </footer>

      {/* ── WHATSAPP FLOAT ── */}
      <a href="https://wa.me/966501549458" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
        style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 50, width: 56, height: 56, borderRadius: '50%', background: '#25D366', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: '0 12px 28px rgba(37,211,102,0.4)', textDecoration: 'none', transition: 'transform .2s ease' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
        <IcoWA style={{ width: 28, height: 28 }} />
      </a>
    </div>
  );
}
