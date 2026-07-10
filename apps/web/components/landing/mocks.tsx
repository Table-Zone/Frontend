'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const TZ = {
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

export const STATUS_META = {
  free:     { labelKey: 'statusFree' as const,     color: TZ.green, bg: TZ.greenBg, bd: TZ.greenBd },
  occupied: { labelKey: 'statusOccupied' as const, color: TZ.blue,  bg: TZ.blueBg,  bd: TZ.blueBd  },
  warning:  { labelKey: 'statusWarning' as const,  color: TZ.amber, bg: TZ.amberBg, bd: TZ.amberBd },
  alert:    { labelKey: 'statusAlert' as const,    color: TZ.red,   bg: TZ.redBg,   bd: TZ.redBd   },
};

export function fmtTime(secs: number) {
  const over = secs < 0;
  const abs = Math.abs(secs);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${over ? '+' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function QRSvg({ size = 64, seed = 7 }: { size?: number; seed?: number }) {
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

export function MiniCard({ name, status, secs }: { name: string; status: keyof typeof STATUS_META; secs: number }) {
  const { t } = useLanguage();
  const m = STATUS_META[status];
  const over = secs < 0;
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: `1.5px solid ${m.bd}`, padding: '10px 11px', display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: TZ.espresso }}>{name}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content', background: m.bg, borderRadius: 999, padding: '2px 7px', fontSize: 10, fontWeight: 700, color: m.color }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color, flexShrink: 0 }}></span>
        {t.landing[m.labelKey]}
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: over ? TZ.red : (status === 'free' ? TZ.muted : m.color), letterSpacing: '-0.02em', lineHeight: 1 }}>
        {status === 'free' ? '––:––' : fmtTime(secs)}
      </div>
    </div>
  );
}

export interface DemoMenuItem { name: string; price: string; desc: string; img: string; cal: string }
export interface DemoTab { label: string; sections: { heading: string; headingColor: string; items: DemoMenuItem[] }[] }

export const PHONE_TABS: DemoTab[] = [
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

export const PHONE_TABS_EN: DemoTab[] = [
  {
    label: 'Burgers',
    sections: [
      {
        heading: '~ Best Sellers ~',
        headingColor: '#9B7730',
        items: [
          { name: 'Smoky Beef Burger',    price: '18 SAR', desc: 'Beef patty, sauce, lettuce', img: '/Smokey_beef.jpg', cal: '580 cal' },
          { name: 'Smoky Chicken Burger', price: '28 SAR', desc: 'Crispy chicken, smoked mayo, pickles', img: '/smoky_chick.webp', cal: '620 cal' },
        ],
      },
      {
        heading: 'Classics',
        headingColor: '#B85C3A',
        items: [
          { name: 'Classic Beef Burger',   price: '24 SAR', desc: 'Beef, cheddar cheese, onion', img: '/meat_burg.jpg', cal: '650 cal' },
          { name: 'Crispy Chicken Burger', price: '38 SAR', desc: 'Crispy chicken, cheese, sauce', img: '/chicken_burg.webp', cal: '710 cal' },
        ],
      },
    ],
  },
  {
    label: 'Sides',
    sections: [
      {
        heading: '~ Side Dishes ~',
        headingColor: '#9B7730',
        items: [
          { name: 'French Fries', price: '12 SAR', desc: 'Crispy fries with ketchup', img: '/fries.jpg', cal: '320 cal' },
        ],
      },
    ],
  },
  {
    label: 'Drinks',
    sections: [
      {
        heading: '~ Our Drinks ~',
        headingColor: '#9B7730',
        items: [
          { name: 'Soft Drinks', price: '8 SAR', desc: 'Cola, Pepsi, Sprite', img: '/Soft_drinks.jpg', cal: '140 cal' },
        ],
      },
    ],
  },
];

export const CAFE_TABS: DemoTab[] = [
  {
    label: 'المشروبات الساخنة',
    sections: [
      {
        heading: '~ الأكثر طلبًا ~',
        headingColor: '#6B4226',
        items: [
          { name: 'لاتيه', price: '١٨ ر.س', desc: 'إسبريسو مع حليب مبخّر ', img: '/Latte.jpg', cal: '١٨٠ سعرة' },
          { name: 'ايس دريب', price: '٢٠ ر.س', desc: 'محصول يمني', img: '/iceCoffee.jpg', cal: '١٥٠ سعرة' },
        ],
      },
      {
        heading: 'قهوة مختصة',
        headingColor: '#9B7730',
        items: [
          { name: 'V60', price: '١٢ ر.س', desc: 'محصول اثيوبي', img: '/hotcoffee.jpg', cal: '٤٠ سعرة' },
        ],
      },
    ],
  },
  {
    label: 'الحلويات',
    sections: [
      {
        heading: '~ طازج يوميًا ~',
        headingColor: '#9B7730',
        items: [
          { name: 'كوكيز', price: '١٤ ر.س', desc: 'طازج يوميًا من الفرن', img: '/cookies.jpg', cal: '٣٨٠ سعرة' },
          { name:  'تشيز كيك مدريد', price: '٢٢ ر.س', desc: 'كريمي وبارد', img: '/cheesecake.jpg', cal: '٤٢٠ سعرة' },
        ],
      },
    ],
  },
  {
    label: 'بارد',
    sections: [
      {
        heading: '~ مشروبات باردة ~',
        headingColor: '#6B4226',
        items: [
          { name: ' آيس تي خوخ', price: '٢٠ ر.س', desc: 'يوقيك من حر الصيف', img: '/IceTea.jpg', cal: '٢٠٠ سعرة' },
          { name: 'فريدو', price: '١٨ ر.س', desc: 'اسبريسو مبخر', img: '/Freddo.jpg', cal: '٢٢٠ سعرة' },
        ],
      },
    ],
  },
];

export const CAFE_TABS_EN: DemoTab[] = [
  {
    label: 'Hot Drinks',
    sections: [
      {
        heading: '~ Most Ordered ~',
        headingColor: '#6B4226',
        items: [
          { name: 'Latte',     price: '18 SAR', desc: 'Espresso with steamed milk', img: '/Latte.jpg', cal: '180 cal' },
          { name: 'Iced Drip', price: '20 SAR', desc: 'Yemeni beans', img: '/iceCoffee.jpg', cal: '150 cal' },
        ],
      },
      {
        heading: 'Specialty Coffee',
        headingColor: '#9B7730',
        items: [
          { name: 'V60', price: '12 SAR', desc: 'Ethiopian beans', img: '/hotcoffee.jpg', cal: '40 cal' },
        ],
      },
    ],
  },
  {
    label: 'Desserts',
    sections: [
      {
        heading: '~ Fresh Daily ~',
        headingColor: '#9B7730',
        items: [
          { name: 'Cookies',           price: '14 SAR', desc: 'Baked fresh every day', img: '/cookies.jpg', cal: '380 cal' },
          { name: 'Madrid Cheesecake', price: '22 SAR', desc: 'Creamy and chilled', img: '/cheesecake.jpg', cal: '420 cal' },
        ],
      },
    ],
  },
  {
    label: 'Cold Drinks',
    sections: [
      {
        heading: '~ Cold Drinks ~',
        headingColor: '#6B4226',
        items: [
          { name: 'Peach Iced Tea', price: '20 SAR', desc: 'Beats the summer heat', img: '/IceTea.jpg', cal: '200 cal' },
          { name: 'Freddo',         price: '18 SAR', desc: 'Shaken espresso', img: '/Freddo.jpg', cal: '220 cal' },
        ],
      },
    ],
  },
];

export const DEMO_MENUS: Record<'ar' | 'en', { restaurant: DemoTab[]; cafe: DemoTab[] }> = {
  ar: { restaurant: PHONE_TABS, cafe: CAFE_TABS },
  en: { restaurant: PHONE_TABS_EN, cafe: CAFE_TABS_EN },
};

export const PHONE_CHROME = {
  ar: { time: '٩:٤١', location: 'الرياض ، حي المونسية' },
  en: { time: '9:41', location: 'Riyadh, Al Munsiyah' },
};

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

export function PhoneMock({ tabs = PHONE_TABS }: { tabs?: DemoTab[] }) {
  const { lang, isRTL } = useLanguage();
  const chrome = PHONE_CHROME[lang];
  const [tab, setTab] = useState(0);
  const safeTab = Math.min(tab, tabs.length - 1);
  const current = tabs[safeTab];
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ width: 196, background: '#1A1A1A', borderRadius: 38, padding: 10, boxShadow: '0 28px 60px rgba(44,24,16,0.30), 0 8px 20px rgba(44,24,16,0.14)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 64, height: 18, background: '#1A1A1A', borderRadius: 999, zIndex: 3 }}></div>
      <div style={{ background: '#FAFAF8', borderRadius: 30, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 400 }}>
        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 5px', fontSize: 10, fontWeight: 700, color: '#1A1A1A', flexShrink: 0, background: '#fff' }}>
          <span>{chrome.time}</span>
          <span style={{ fontSize: 7, letterSpacing: 1 }}>●●● ▮</span>
        </div>

        {/* Menu picker */}
        <div style={{ padding: '7px 11px 6px', borderBottom: '1px solid #EBEBEB', flexShrink: 0 }}>
          <div style={{ fontSize: 7, color: '#BBB', marginBottom: 2 }}></div>
          <div style={{ border: '1px solid #CDCDCD', borderRadius: 7, padding: '4px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9.5, fontWeight: 700, color: '#1A1A1A' }}>
            <span>{chrome.location}</span>
            <span style={{ fontSize: 8.5, color: '#888', lineHeight: 1 }}>⌃⌄</span>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', padding: '5px 11px 0', borderBottom: '1px solid #EBEBEB', gap: 2, flexShrink: 0 }}>
          {tabs.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding: '3px 7px 5px', fontSize: 8.5, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', color: safeTab === i ? '#1A1A1A' : '#999', borderBottom: safeTab === i ? '1.5px solid #1A1A1A' : '1.5px solid transparent', flexShrink: 0, transition: 'color .15s' }}>{t.label}</button>
          ))}
        </div>

        {/* Content — switches per tab */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff', padding: '9px 11px 8px' }}>
          {current.sections.map((section, si) => (
            <div key={si}>
              <div style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: section.headingColor, fontStyle: 'italic', marginBottom: 8, letterSpacing: '-0.01em' }}>
                {section.heading}
              </div>
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

export interface TimerMockTable { name: string; status: keyof typeof STATUS_META; secs: number }

export function TimerPhoneMock({ tables }: { tables: TimerMockTable[] }) {
  const { t, lang, isRTL } = useLanguage();
  const chrome = PHONE_CHROME[lang];
  const activeCount = tables.filter((tb) => tb.status !== 'free').length;
  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ width: 196, background: '#1A1A1A', borderRadius: 38, padding: 10, boxShadow: '0 28px 60px rgba(44,24,16,0.30), 0 8px 20px rgba(44,24,16,0.14)', position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 64, height: 18, background: '#1A1A1A', borderRadius: 999, zIndex: 3 }}></div>
      <div style={{ background: '#FAFAF8', borderRadius: 30, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 400 }}>
        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px 5px', fontSize: 10, fontWeight: 700, color: '#1A1A1A', flexShrink: 0, background: '#fff' }}>
          <span>{chrome.time}</span>
          <span style={{ fontSize: 7, letterSpacing: 1 }}>●●● ▮</span>
        </div>

        {/* App header */}
        <div style={{ padding: '6px 12px 8px', borderBottom: '1px solid #EBEBEB', flexShrink: 0, background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 7.5, fontWeight: 700, color: '#BBB', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.appName}</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: TZ.espresso, marginTop: 1 }}>{t.tablesTimer}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, background: TZ.orangeTint, borderRadius: 999, padding: '2px 8px', fontSize: 8.5, fontWeight: 700, color: TZ.orangeDk }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: TZ.orange }}></span>
            {activeCount}/{tables.length} {t.occupied}
          </div>
        </div>

        {/* Table timer grid */}
        <div style={{ flex: 1, background: '#fff', padding: '9px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, alignContent: 'start', overflow: 'hidden' }}>
          {tables.map((tb, i) => <MiniCard key={i} name={tb.name} status={tb.status} secs={tb.secs} />)}
        </div>

        {/* QR menu cross-promo bar */}
        <div style={{ margin: '0 10px 10px', background: TZ.espresso, color: '#fff', borderRadius: 12, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 9.5, fontWeight: 700, flexShrink: 0 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/></svg>
            {t.menuDesign}
          </span>
          <span style={{ background: TZ.orange, borderRadius: 999, padding: '2px 7px', fontSize: 8.5 }}>{t.active}</span>
        </div>
      </div>
    </div>
  );
}
