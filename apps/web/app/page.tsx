'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Flame } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { subscriptionAPI } from '@/lib/api';

const TZ = {
  orange: '#C75B12',
  orangeDk: '#9A4309',
  orangeLt: '#E87E3A',
  orangeTint: '#FBE4D0',
  cream: '#FAF7F2',
  cream2: '#F2EBE0',
  espresso: '#1E1B18',
  muted: '#7A736A',
  green: '#2E7D52',
  greenBg: 'rgba(46,125,82,0.10)',
  greenBd: 'rgba(46,125,82,0.28)',
  blue: '#2563A8',
  blueBg: 'rgba(37,99,168,0.10)',
  blueBd: 'rgba(37,99,168,0.28)',
  amber: '#B45309',
  amberBg: 'rgba(180,83,9,0.10)',
  amberBd: 'rgba(180,83,9,0.28)',
  red: '#B91C1C',
  redBg: 'rgba(185,28,28,0.10)',
  redBd: 'rgba(185,28,28,0.28)',
};

const STATUS_META = {
  free:     { label: 'فارغة',  color: TZ.green, bg: TZ.greenBg, bd: TZ.greenBd },
  occupied: { label: 'مشغولة', color: TZ.blue,  bg: TZ.blueBg,  bd: TZ.blueBd  },
  warning:  { label: 'تحذير',  color: TZ.amber, bg: TZ.amberBg, bd: TZ.amberBd },
  alert:    { label: 'تجاوز',  color: TZ.red,   bg: TZ.redBg,   bd: TZ.redBd   },
};

function fmtTime(secs: number) {
  const over = secs < 0;
  const abs = Math.abs(secs);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${over ? '+' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function QRSvg({ size = 64, seed = 7 }: { size?: number; seed?: number }) {
  const N = 17;
  let st = seed;
  const rand = () => { st = (st * 9301 + 49297) % 233280; return st / 233280; };
  const cells: React.ReactElement[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const inFinder = (r < 6 && c < 6) || (r < 6 && c >= N - 6) || (r >= N - 6 && c < 6);
      let fill = false;
      if (inFinder) {
        const lr = r < 6 ? r : r - (N - 6);
        const lc = c < 6 ? c : c - (N - 6);
        fill = (lr === 0 || lr === 5 || lc === 0 || lc === 5) || (lr >= 2 && lr <= 3 && lc >= 2 && lc <= 3);
      } else {
        fill = rand() > 0.48;
      }
      if (fill) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={TZ.espresso} />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges">
      <rect width={N} height={N} fill="#fff" />
      {cells}
    </svg>
  );
}

function MiniCard({ name, status, secs }: { name: string; status: keyof typeof STATUS_META; secs: number }) {
  const m = STATUS_META[status];
  const over = secs < 0;
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${m.bd}`, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: TZ.espresso }}>{name}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content', background: m.bg, borderRadius: 999, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: m.color }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, flexShrink: 0 }}></span>
        {m.label}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: over ? TZ.red : (status === 'free' ? TZ.muted : m.color), letterSpacing: '-0.02em', lineHeight: 1 }}>
        {status === 'free' ? '––:––' : fmtTime(secs)}
      </div>
    </div>
  );
}

const PHONE_TABS = [
  {
    label: 'البرجر',
    sections: [
      {
        heading: '~ الأكثر مبيعًا ~',
        headingColor: '#9B7730',
        items: [
          { name: 'برجر سموكي لحم',   price: '١٨ ر.س', desc: 'لحم بقري، صوص، خس', img: '/Smokey_beef.jpg', cal: '٥٨٠ سعرة' },
          { name: 'برجر سموكي دجاج',  price: '٢٨ ر.س', desc: 'دجاج مقرمش، مايونيز مدخّن، مخلل', img: '/smoky_chick.webp', cal: '٦٢٠ سعرة' },
        ],
      },
      {
        heading: 'كلاسيك',
        headingColor: '#B85C3A',
        items: [
          { name: 'برجر لحم كلاسيك',  price: '٢٤ ر.س', desc: 'لحم بقري، جبن شيدر، بصل', img: '/meat_burg.jpg', cal: '٦٥٠ سعرة' },
          { name: 'برجر كرسبي دجاج',  price: '٣٨ ر.س', desc: 'دجاج كريسبي، جبن، صوص', img: '/chicken_burg.webp', cal: '٧١٠ سعرة' },
        ],
      },
    ],
  },
  {
    label: 'اطباق جانبية',
    sections: [
      {
        heading: '~ أطباق جانبية ~',
        headingColor: '#9B7730',
        items: [
          { name: 'بطاطس مقلية', price: '١٢ ر.س', desc: 'بطاطس كريسبي مع كاتشب', img: '/fries.jpg', cal: '٣٢٠ سعرة' },
        ],
      },
    ],
  },
  {
    label: 'مشروبات',
    sections: [
      {
        heading: '~ مشروباتنا ~',
        headingColor: '#9B7730',
        items: [
          { name: 'مشروبات غازية', price: '٨ ر.س', desc: 'كولا، بيبسي، سبرايت', img: "/Soft_drinks.jpg", cal: '١٤٠ سعرة' },
        ],
      },
    ],
  },
];


function PhoneMenuItem({ name, price, desc, img /*, cal */ }: { name: string; price: string; desc: string; img: string | null; cal?: string }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 6 }}>
      {img && (
        <img src={img} alt={name} style={{ width: 40, height: 40, borderRadius: 6, flexShrink: 0, objectFit: 'cover' }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
          <div style={{ fontSize: 7.5, fontWeight: 800, color: '#1A1A1A', letterSpacing: '0.05em', lineHeight: 1.3 }}>{name}</div>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: '#333', flexShrink: 0 }}>{price}</div>
        </div>
        <div style={{ fontSize: 7, color: '#777', lineHeight: 1.45, marginTop: 2 }}>{desc}</div>
      </div>
      {/* cal &&
        <div style={{ position: 'absolute', bottom: 0, left: 0, display: 'flex', alignItems: 'center', gap: 2, padding: '1.5px 4px' }}>
          <Flame size={7} color="#E8621A" fill="#E8621A" />
          <span style={{ fontSize: 6, fontWeight: 700, color: '#C75B12', lineHeight: 1 }}>{cal}</span>
        </div>
      */}
    </div>
  );
}

function PhoneMock() {
  const [tab, setTab] = useState(0);
  const current = PHONE_TABS[tab];
  return (
    <div dir="rtl" style={{ width: 196, background: '#1A1A1A', borderRadius: 38, padding: 10, boxShadow: '0 28px 60px rgba(44,24,16,0.30), 0 8px 20px rgba(44,24,16,0.14)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 64, height: 18, background: '#1A1A1A', borderRadius: 999, zIndex: 3 }}></div>
      <div style={{ background: '#FAFAF8', borderRadius: 30, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 400 }}>
        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 5px', fontSize: 10, fontWeight: 700, color: '#1A1A1A', flexShrink: 0, background: '#fff' }}>
          <span>٩:٤١</span>
          <span style={{ fontSize: 7, letterSpacing: 1 }}>●●● ▮</span>
        </div>

        {/* Menu picker */}
        <div style={{ padding: '7px 11px 6px', borderBottom: '1px solid #EBEBEB', flexShrink: 0 }}>
          <div style={{ fontSize: 7, color: '#BBB', marginBottom: 2 }}></div>
          <div style={{ border: '1px solid #CDCDCD', borderRadius: 7, padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9.5, fontWeight: 700, color: '#1A1A1A' }}>
            <span>الرياض ، حي المونسية</span>
            <span style={{ fontSize: 8.5, color: '#888', lineHeight: 1 }}>⌃⌄</span>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', padding: '5px 11px 0', borderBottom: '1px solid #EBEBEB', gap: 2, flexShrink: 0 }}>
          {PHONE_TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding: '3px 7px 5px', fontSize: 8.5, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: tab === i ? '#1A1A1A' : '#999', borderBottom: tab === i ? '1.5px solid #1A1A1A' : '1.5px solid transparent', flexShrink: 0, transition: 'color .15s' }}>{t.label}</button>
          ))}
        </div>

        {/* Content — switches per tab */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '9px 11px 8px' }}>
          {current.sections.map((section, si) => (
            <div key={si}>
              <div style={{ textAlign: 'center', fontSize: section.subheading ? 9 : 10.5, fontWeight: 800, color: section.headingColor, fontStyle: 'italic', marginBottom: section.subheading ? 2 : 8, letterSpacing: section.subheading ? '0.09em' : '-0.01em' }}>
                {section.heading}
              </div>
              {section.subheading && (
                <div style={{ textAlign: 'center', fontSize: 7, color: '#BBB', fontStyle: 'italic', marginBottom: 7 }}>{section.subheading}</div>
              )}
              {section.items.map((item, ii) => (
                <div key={ii}>
                  <PhoneMenuItem {...item} />
                  {ii < section.items.length - 1 && <div style={{ borderTop: '1px solid #F0EDEA', margin: '4px 0 6px' }}></div>}
                </div>
              ))}
              {si < current.sections.length - 1 && <div style={{ borderTop: '1px solid #F0EDEA', margin: '6px 0' }}></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const IcoCheck  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>;
const IcoClock  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>;
const IcoQR     = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/></svg>;
const IcoBell   = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
const IcoArrow  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IcoWA     = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.3-.1-.4-.1-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.3-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.9-2-.2-.5-.5-.4-.6-.5h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.3 0 1.4 1 2.7 1.1 2.9.1.2 2 3.1 4.9 4.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3M12 22c-1.8 0-3.4-.5-4.9-1.3L3 22l1.3-4c-.9-1.5-1.4-3.2-1.4-5C2.9 7.5 7 3.4 12 3.4S21.1 7.5 21.1 13c.1 5.5-4 9-9.1 9"/></svg>;
const IcoUsers  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoChart  = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/></svg>;
const IcoEdit   = (p: React.SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;

function AdminDashMock() {
  const [activeNav, setActiveNav] = useState('menus');
  const [toggles, setToggles] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: false, 3: true, 4: true });

  const navItems = [
    { id: 'overview', icon: <IcoChart style={{ width: 11, height: 11 }} />, label: 'نظرة عامة' },
    { id: 'menus',    icon: <IcoQR    style={{ width: 11, height: 11 }} />, label: 'القوائم'   },
  ];

  const menuItems = [
    { name: 'برجر لحم كلاسيك',  cat: 'رئيسية',  price: '٢٤ ر.س', img: '/meat_burg.jpg' },
    { name: 'برجر سموكي دجاج',  cat: 'رئيسية',  price: '١٨ ر.س', img: '/smoky_chick.webp' },
    { name: 'بطاطس مقلية',      cat: 'جانبية',  price: '١٢ ر.س', img: '/fries.jpg' },
    { name: 'برجر كرسبي دجاج',  cat: 'رئيسية',  price: '٣٨ ر.س', img: '/chicken_burg.webp' },
    { name: 'مشروبات غازية',    cat: 'مشروبات', price: '٨ ر.س',  img: '/Soft_drinks.jpg' },
  ];

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
      <div style={{ display: 'flex', height: 300 }} dir="rtl">
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
            <button key={n.id} onClick={() => setActiveNav(n.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 12px', fontSize: 10, fontWeight: 700, background: activeNav === n.id ? 'rgba(199,91,18,0.18)' : 'transparent', color: activeNav === n.id ? TZ.orangeLt : 'rgba(250,247,242,0.55)', borderRight: activeNav === n.id ? `2px solid ${TZ.orange}` : '2px solid transparent', cursor: 'pointer', transition: 'all .15s', textAlign: 'right', border: 'none', width: '100%' }}>
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
            <div style={{ fontWeight: 800, fontSize: 11.5, color: TZ.espresso }}>إدارة القوائم</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: TZ.orange, color: '#fff', borderRadius: 6, padding: '4px 9px', fontSize: 9, fontWeight: 700, cursor: 'pointer' }}>
              <span style={{ fontSize: 12, lineHeight: 1, marginTop: -1 }}>+</span>
              إضافة صنف
            </div>
          </div>
          {/* Stats strip */}
          <div style={{ background: '#fff', borderBottom: '1px solid #EAE7E3', padding: '6px 14px', display: 'flex', gap: 14 }}>
            {[{ v: '٢٣', l: 'صنف نشط', c: TZ.green }, { v: '٤', l: 'مخفي', c: TZ.muted }, { v: '٣', l: 'فئة', c: TZ.blue }].map((s, i) => (
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

interface Plan {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  priceSar: number;
  baseStaffSeats: number;
  durationDays: number;
  extraStaffSeatPriceSar: number;
}

const partners = [
  { name: 'Appy', img: '/appy.jpg' },
  { name: 'Pantry', img: '/pantry.jpg' },
  { name: 'Masla', img: '/masla.jpg' },
  { name: 'Camilla', img: '/camilla.png' },
  { name: 'Sum', img: '/Sum.png' },
];

const shell: React.CSSProperties = { width: '100%', maxWidth: 1240, margin: '0 auto', padding: '0 28px' };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px 6px 12px', background: TZ.orangeTint, color: TZ.orangeDk, borderRadius: 999, fontSize: 13, fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: TZ.orange, animation: 'pulseDot 1.8s ease-in-out infinite' }}></span>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const { t, isRTL, setLang } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const INIT_TABLES = [
    { name: 'طاولة ١', status: 'occupied' as const, secs: 1742 },
    { name: 'طاولة ٢', status: 'warning' as const,  secs: 187  },
    { name: 'طاولة ٣', status: 'free' as const,     secs: 1800 },
    { name: 'طاولة ٤', status: 'alert' as const,    secs: -94  },
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
    { status: 'free',     time: '––:––',                   desc: 'الطاولة فارغة وجاهزة لجلسة جديدة' },
    { status: 'occupied', time: fmtTime(timerSecs.occupied), desc: 'جلسة نشطة  ، المؤقت يعدّ تنازلياً' },
    { status: 'warning',  time: fmtTime(timerSecs.warning),  desc: 'أقل من ٥ دقائق' },
    { status: 'alert',    time: fmtTime(timerSecs.alert),    desc: 'تجاوز الوقت' },
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

  const monthlyPlan = plans.find((p) => p.name === 'monthly');
  const quarterlyPlan = plans.find((p) => p.name === 'quarterly');

  return (
    <div dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif", background: TZ.cream, color: TZ.espresso, minHeight: '100vh' }}>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .marquee-track { display:flex; width:max-content; animation:marquee 18s linear infinite; will-change:transform; }
        .marquee-track:hover { animation-play-state:paused; }
        @keyframes pulseDot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.4; transform:scale(1.4); } }
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
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)', background: scrolled ? 'rgba(250,247,242,0.92)' : 'rgba(250,247,242,0.78)', borderBottom: `1px solid ${scrolled ? 'rgba(44,24,16,0.09)' : 'transparent'}`, transition: 'all .2s ease' }}>
        <div style={{ ...shell, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 17, color: TZ.espresso }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
              <Image src="/logo.jpg" alt="Table Zone" width={34} height={34} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            Table Zone
          </div>
          <div className="nav-links-center" style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {([['#qr', 'QR Menu'], ['#pricing', 'الأسعار'], ['#partners', 'شركاؤنا']] as [string, string][]).map(([href, label]) => (
              <a key={href} href={href} className="nav-link">{label}</a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 999, fontWeight: 700, fontSize: 14, background: '#fff', color: TZ.espresso, border: `1px solid rgba(44,24,16,0.14)`, textDecoration: 'none' }}>
              {t.login}
            </Link>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 999, fontWeight: 700, fontSize: 14, background: TZ.orange, color: '#fff', boxShadow: '0 8px 20px rgba(201,91,34,0.28)', textDecoration: 'none' }}>
              {isRTL ? 'ابدأ الآن' : 'Get Started'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ padding: '64px 0 80px', background: `radial-gradient(900px 500px at 70% -10%, rgba(199,91,18,0.11), transparent 55%), radial-gradient(600px 400px at 5% 30%, rgba(199,91,18,0.06), transparent 55%), ${TZ.cream}`, overflow: 'hidden' }}>
        <div style={shell}>
          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 52px' }}>
            <h1 style={{ fontSize: 'clamp(40px,4.8vw,70px)', lineHeight: 1.05, fontWeight: 900, color: TZ.espresso, letterSpacing: '-0.02em', margin: '0 0 18px' }}>
              كل مايحتاجه عملائك<br /><span style={{ color: TZ.orange }}>تحت مظلة واحدة</span>
            </h1>
            <p style={{ fontSize: 'clamp(16px,1.3vw,19px)', color: TZ.muted, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 30px' }}>
              مؤقتات الطاولة لإدارة وقت طاولاتك، وقائمة QR تتيح لزبائنك تصفح المنيو من جوالهم .
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '18px 32px', borderRadius: 999, fontWeight: 700, fontSize: 17, background: TZ.orange, color: '#fff', boxShadow: '0 8px 20px rgba(201,91,34,0.28)', textDecoration: 'none' }}>
                {isRTL ? 'ابدأ الآن' : 'Start Now'}
                <IcoArrow style={{ width: 16, height: 16, transform: 'scaleX(-1)', flexShrink: 0 }} />
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
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>مؤقتات الطاولات</div>
                    <div style={{ fontSize: 10, color: 'rgba(250,247,242,.55)', marginTop: 1 }}>لوحة المشغّل</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.10)', borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 700, color: 'rgba(250,247,242,.8)' }}>
                  <IcoBell style={{ width: 11, height: 11 }} />تنبيه جديد
                </div>
              </div>
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {tables.map((t, i) => <MiniCard key={i} {...t} />)}
              </div>
              <div style={{ padding: '0 14px 14px' }}>
              </div>
            </div>

            {/* Product 2 — QR Menu */}
            <div style={{ background: '#fff', borderRadius: 24, border: `1.5px solid ${TZ.orange}`, boxShadow: `0 8px 32px rgba(199,91,18,0.12)`, overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: `linear-gradient(135deg, ${TZ.orange}, ${TZ.orangeDk})`, padding: '18px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.20)', display: 'grid', placeItems: 'center', color: '#fff' }}>
                    <IcoQR style={{ width: 15, height: 15 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>قائمة QR</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)', marginTop: 1 }}>منيو رقمي للزبائن</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'center' }}>
                <PhoneMock />
                <div style={{ background: TZ.cream, borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 20, border: `1px solid rgba(44,24,16,0.08)` }}>
                  <QRSvg size={72} seed={17} />
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: TZ.espresso, textAlign: 'center', lineHeight: 1.4 }}>امسح<br />للقائمة</div>
                  <div style={{ fontSize: 9, color: TZ.muted }}>طاولة ٠٤</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT 1 — TABLE TIMERS ── */}
      <section id="timers" style={{ padding: '88px 0', background: TZ.cream, borderTop: '1px solid rgba(44,24,16,0.08)' }}>
        <div style={shell}>
          <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto 52px' }}>
            <div style={{ marginBottom: 16 }}><Eyebrow>المنتج الأول · مؤقتات الطاولات</Eyebrow></div>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,48px)', fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>تابع كل طاولة، لحظة بلحظة</h2>
            <p style={{ fontSize: 17, color: TZ.muted, lineHeight: 1.7 }}>أربع حالات واضحة تحافظ على سير الخدمة بدون ارتباك.</p>
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
                    <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{m.label}</span>
                  </div>
                  <div style={{ width: 96, height: 96, borderRadius: '50%', background: `linear-gradient(135deg,${m.bg},transparent)`, border: `3px solid ${m.bd}`, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 19, fontWeight: 800, color: c.status === 'free' ? TZ.muted : m.color, letterSpacing: '-0.02em' }}>{c.time}</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: TZ.espresso, marginBottom: 4 }}>{m.label}</div>
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
              <div style={{ marginBottom: 18 }}><Eyebrow>المنتج الثاني · قائمة QR</Eyebrow></div>
              <h2 style={{ fontSize: 'clamp(30px,3.6vw,48px)', fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>منيو رقمي لزبائنك</h2>
              <p style={{ fontSize: 17, color: TZ.muted, marginBottom: 32, lineHeight: 1.7 }}>
                ضع رمز QR على كل طاولة — يمسحه الزبون ويتصفح قائمتك كاملة من جواله. الأسعار والأصناف تتحدث فوراً من لوحتك.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { n: '١', t: 'ولّد كود QR لكل طاولة', d: 'نولّد أكواداً فريدة لطاولاتك — اطبعها أو ضعها في حامل.' },
                  { n: '٢', t: 'الزبون يمسح ويتصفح', d: 'تفتح القائمة مباشرة في المتصفح، بدون تطبيق أو تسجيل.' },
                  { n: '٣', t: 'قائمة دائماً محدّثة', d: 'تعديل الأسعار والأصناف يظهر فوراً لجميع الطاولات.' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: TZ.orange, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{s.n}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: TZ.espresso, marginBottom: 2 }}>{s.t}</div>
                      <p style={{ fontSize: 14, color: TZ.muted, lineHeight: 1.6 }}>{s.d}</p>
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
            {isRTL ? 'شركاؤنا' : 'Our Partners'}
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
            <div style={{ marginBottom: 16 }}><Eyebrow>الأسعار</Eyebrow></div>
            <h2 style={{ fontSize: 'clamp(30px,3.6vw,48px)', fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>
              {isRTL ? 'ابدأ الآن ونظم عملك' : 'Start Now '}
            </h2>
          </div>

          {plansLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px solid ${TZ.orange}`, borderTopColor: 'transparent', animation: 'spinLoader 0.8s linear infinite' }}></div>
              <p style={{ fontSize: 14, color: TZ.muted }}>جاري تحميل الخطط...</p>
            </div>
          ) : plansError ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: 16 }}>
              <p style={{ fontSize: 14, color: TZ.muted }}>تعذر تحميل الخطط</p>
              <button onClick={fetchPlans} style={{ padding: '10px 24px', borderRadius: 999, background: TZ.orange, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none' }}>حاول مجدداً</button>
            </div>
          ) : (
            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18, maxWidth: 720, margin: '0 auto' }}>
              {monthlyPlan && (
                <div style={{ background: '#fff', border: `1px solid rgba(44,24,16,0.08)`, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TZ.muted, marginBottom: 6 }}>{isRTL ? monthlyPlan.labelAr : monthlyPlan.labelEn}</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: TZ.espresso, margin: '0 0 14px' }}>شهري</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: TZ.espresso, letterSpacing: '-0.02em' }}>{monthlyPlan.priceSar}</span>
                    <span style={{ fontSize: 13, color: TZ.muted }}>ر.س / شهر</span>
                  </div>
                  <p style={{ fontSize: 14, color: TZ.muted, marginBottom: 20 }}>{monthlyPlan.durationDays} {isRTL ? 'يوم' : 'days'}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {[
                      isRTL ? (monthlyPlan.baseStaffSeats === 1 ? 'مقعد موظف واحد' : `${monthlyPlan.baseStaffSeats} مقاعد موظفين`) : `${monthlyPlan.baseStaffSeats} staff seat`,
                      isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                      isRTL ? 'قائمة QR' : 'QR Menu',
                      isRTL ? 'دعم فني' : 'Support',
                    ].map((f, k) => (
                      <li key={k} style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', color: TZ.espresso }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: TZ.orangeTint, color: TZ.orangeDk, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <IcoCheck style={{ width: 10, height: 10 }} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '14px 26px', borderRadius: 999, fontWeight: 700, fontSize: 15, background: '#fff', color: TZ.espresso, border: `1px solid rgba(44,24,16,0.14)`, textDecoration: 'none' }}>ابدأ الآن</Link>
                </div>
              )}
              {quarterlyPlan && (
                <div style={{ background: TZ.espresso, borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', position: 'relative', transform: 'translateY(-12px)', boxShadow: '0 24px 60px rgba(44,24,16,0.14)' }}>
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: TZ.orange, color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>الأكثر شعبية</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TZ.orangeLt, marginBottom: 6 }}>{isRTL ? quarterlyPlan.labelAr : quarterlyPlan.labelEn}</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#FAF7F2', margin: '0 0 14px' }}>ربع سنوي</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, color: '#FAF7F2', letterSpacing: '-0.02em' }}>{quarterlyPlan.priceSar}</span>
                    <span style={{ fontSize: 13, color: 'rgba(250,247,242,0.6)' }}>ر.س / ربع سنة</span>
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(250,247,242,0.6)', marginBottom: 20 }}>{quarterlyPlan.durationDays} {isRTL ? 'يوم' : 'days'}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {[
                      isRTL ? (quarterlyPlan.baseStaffSeats === 1 ? 'مقعد موظف واحد' : `${quarterlyPlan.baseStaffSeats} مقاعد موظفين`) : `${quarterlyPlan.baseStaffSeats} staff seat`,
                      isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                      isRTL ? 'قائمة QR متقدمة' : 'Advanced QR Menu',
                      isRTL ? 'دعم ٢٤/٧ بأولوية' : '24/7 Priority support',
                      isRTL ? 'توفير أكثر' : 'Save more',
                    ].map((f, k) => (
                      <li key={k} style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', color: 'rgba(250,247,242,0.85)' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(224,122,63,0.25)', color: TZ.orangeLt, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <IcoCheck style={{ width: 10, height: 10 }} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '14px 26px', borderRadius: 999, fontWeight: 700, fontSize: 15, background: TZ.orange, color: '#fff', boxShadow: '0 8px 20px rgba(201,91,34,0.28)', textDecoration: 'none' }}>ابدأ الآن</Link>
                </div>
              )}
              {!monthlyPlan && !quarterlyPlan && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: TZ.muted, padding: '24px 0' }}>لا توجد خطط متاحة حالياً</div>
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
              <p style={{ fontSize: 14, color: TZ.muted, maxWidth: 260, lineHeight: 1.6 }}>منصة سعودية لإدارة طاولات المطاعم والمقاهي — مؤقتات للطاولات وقائمة QR في مكان واحد.</p>
            </div>
            {([
              { title: 'المنتج', links: [['المؤقتات', '#timers'], ['قائمة QR', '#qr'], ['الأسعار', '#pricing']] },
              { title: 'الشركة', links: [['عنّا', '#'], ['شركاؤنا', '#partners'], ['تواصل معنا', 'https://wa.me/966501549458']] },
              { title: 'الدعم',  links: [['مركز المساعدة', '#'], ['شروط الخدمة', '/terms'], ['سياسة الخصوصية', '/privacy'], ['اتفاقية الترخيص', '/eula']] },
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: `1px solid rgba(44,24,16,0.07)`, fontSize: 12, color: TZ.muted }}>
            <span>© ٢٠٢٦ Table Zone · جميع الحقوق محفوظة</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>صنع بـ ♥ في الرياض</span>
              <button onClick={() => setLang(isRTL ? 'en' : 'ar')} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, padding: 0 }} aria-label="Toggle language">
                <svg viewBox="0 0 122.88 92.91" style={{ width: 24, height: 24, fill: TZ.muted }} xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.15,83.63,31.63,73.4a2.89,2.89,0,0,1,1.91-.73h27.8a.92.92,0,0,0,.93-.93V65.9H68v5.84a6.71,6.71,0,0,1-6.68,6.68H34.62L19.3,92.07a2.87,2.87,0,0,1-4.9-2V78.42H6.69A6.71,6.71,0,0,1,0,71.74V28.59a6.76,6.76,0,0,1,6.69-6.68H43.35v5.75H6.69a1,1,0,0,0-.94.93V71.74a.91.91,0,0,0,.28.65,1,1,0,0,0,.66.28H17.27a2.88,2.88,0,0,1,2.88,2.88v8.08Zm.21-19.48L29.6,36.24h8.83l9.24,27.91H40.35L38.8,59.07H29.15l-1.51,5.08ZM30.79,53.24h6.37L34,41.81,30.79,53.24ZM76.63,13.35h8.7V11.11a.69.69,0,0,1,.69-.69h4.65a.68.68,0,0,1,.68.69v2.24h9.76a.68.68,0,0,1,.68.69V18.5a.68.68,0,0,1-.68.68H99.56a26.3,26.3,0,0,1-.91,3.88l0,.06a26.07,26.07,0,0,1-1.74,4.15,32.34,32.34,0,0,1-2.14,3.43c-.67,1-1.41,1.9-2.2,2.83a35.78,35.78,0,0,0,3.68,3.83,41.43,41.43,0,0,0,5.09,3.74.68.68,0,0,1,.21.94l-2.39,3.73a.69.69,0,0,1-1,.2,45.88,45.88,0,0,1-5.58-4.08l0,0a41.42,41.42,0,0,1-4-4.1C87.3,38.93,86.15,40,85,41l0,0c-1.36,1.12-2.79,2.2-4.47,3.36a.69.69,0,0,1-1-.17L77,40.53a.69.69,0,0,1,.17-1c1.66-1.14,3-2.19,4.36-3.28,1.16-1,2.28-2,3.49-3.16a44.82,44.82,0,0,1-2.77-4.45A28.84,28.84,0,0,1,80,22.9a.68.68,0,0,1,.47-.84l4.27-1.19a.68.68,0,0,1,.84.47A22.62,22.62,0,0,0,89,28.7L90.27,27a26.33,26.33,0,0,0,1.51-2.47l0,0A19.43,19.43,0,0,0,93,21.62a24,24,0,0,0,.66-2.44h-17a.69.69,0,0,1-.69-.68V14a.69.69,0,0,1,.69-.69Zm27,56.82L88.26,56.51H61.54a6.73,6.73,0,0,1-6.69-6.68V6.69a6.71,6.71,0,0,1,2-4.72l.2-.18A6.67,6.67,0,0,1,61.54,0h54.65a6.69,6.69,0,0,1,4.71,2l.19.2a6.69,6.69,0,0,1,1.79,4.51V49.83a6.73,6.73,0,0,1-6.69,6.68h-7.7V68.13a2.88,2.88,0,0,1-4.91,2ZM91.26,51.49l11.47,10.23V53.64a2.88,2.88,0,0,1,2.88-2.88h10.58a.92.92,0,0,0,.65-.28.91.91,0,0,0,.29-.65V6.69a1,1,0,0,0-.22-.58L116.84,6a1,1,0,0,0-.65-.29H61.54A.94.94,0,0,0,61,6L60.89,6a.92.92,0,0,0-.28.65V49.83a.92.92,0,0,0,.93.93H89.35a2.86,2.86,0,0,1,1.91.73Z"/>
                </svg>
              </button>
            </div>
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
