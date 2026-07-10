'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { QrCode, Timer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TimerPhoneMock, QRSvg, DEMO_MENUS, TZ, type TimerMockTable } from '@/components/landing/mocks';

export default function LoginPromo() {
  const { t, lang } = useLanguage();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const tables: TimerMockTable[] = [
    { name: `${t.loginPromoTable} 1`, status: 'occupied', secs: 765 + tick },
    { name: `${t.loginPromoTable} 2`, status: 'free', secs: 0 },
    { name: `${t.loginPromoTable} 3`, status: 'warning', secs: 2300 + tick },
    { name: `${t.loginPromoTable} 4`, status: 'occupied', secs: 410 + tick },
    { name: `${t.loginPromoTable} 5`, status: 'alert', secs: -(130 + tick) },
    { name: `${t.loginPromoTable} 6`, status: 'free', secs: 0 },
  ];
  const menuItem = DEMO_MENUS[lang].restaurant[0].sections[0].items[0];

  return (
    <section className="relative hidden lg:flex flex-col overflow-hidden text-white px-14 pt-11 pb-9 bg-[linear-gradient(158deg,#E87E3A_0%,#C75B12_52%,#9A4309_100%)]">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_-8%,rgba(251,228,208,0.35),transparent_60%),radial-gradient(760px_620px_at_105%_108%,rgba(90,43,12,0.35),transparent_62%)]" />

      {/* top: brand + chip */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-[46px] h-[46px] rounded-[13px] overflow-hidden shadow-[0_10px_22px_rgba(0,0,0,0.25)]">
            <Image src="/logo.jpg" alt="Table Zone" width={46} height={46} className="w-full h-full object-cover" />
          </span>
          <span className="font-extrabold text-[19px] leading-tight tracking-tight">
            {t.appName}
            <small className="block text-[11.5px] font-semibold opacity-80 uppercase tracking-wider mt-0.5">
              {t.loginPromoTag}
            </small>
          </span>
        </div>
        <span className="text-[12.5px] font-bold px-4 py-2 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
          ⏱️ {t.tablesTimer} · 📱 {t.menuDesign}
        </span>
      </div>

      {/* stage: table-timer phone + QR menu promo cards */}
      <div className="relative flex-1 grid place-items-center my-4">
        {/* QR menu card */}
        <div className="absolute z-[3] top-[12%] end-[calc(50%-230px)] bg-white rounded-2xl p-3.5 rotate-3 shadow-[0_24px_50px_rgba(0,0,0,0.25)] text-center">
          <div className="rounded-lg border border-tz-espresso/10 overflow-hidden leading-[0]">
            <QRSvg size={104} seed={17} />
          </div>
          <div className="text-[11.5px] font-extrabold text-tz-espresso mt-2">{t.loginPromoQrTitle}</div>
          <div className="text-[10px] text-tz-espresso/55 font-semibold mt-0.5">{t.loginPromoScanToView}</div>
        </div>

        {/* menu item preview (what guests see after scanning) */}
        <div className="absolute z-[3] bottom-[12%] start-[calc(50%-235px)] w-[190px] bg-white rounded-2xl p-3 -rotate-3 shadow-[0_24px_50px_rgba(0,0,0,0.25)] flex items-center gap-2.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={menuItem.img} alt={menuItem.name} className="w-11 h-11 rounded-lg object-cover shrink-0" />
          <span className="min-w-0">
            <span className="block text-[11.5px] font-extrabold text-tz-espresso truncate">{menuItem.name}</span>
            <span className="block text-[11px] font-bold mt-0.5" style={{ color: TZ.orangeDk }}>{menuItem.price}</span>
          </span>
        </div>

        {/* phone running the Tables Timer with live countdowns */}
        <div className="relative z-[2] -rotate-2">
          <TimerPhoneMock tables={tables} />
        </div>
      </div>

      {/* copy + feature cards */}
      <div className="relative text-center max-w-[480px] mx-auto">
        <h2 className="text-[28px] font-extrabold tracking-tight mb-2">{t.loginPromoTitle}</h2>
        <p className="text-[14.5px] leading-relaxed opacity-85 max-w-[420px] mx-auto mb-5">{t.loginPromoDesc}</p>
        <div className="grid grid-cols-2 gap-3 text-start">
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center shrink-0"><Timer className="w-5 h-5" /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-extrabold truncate">{t.loginPromoTimersTitle}</span>
              <span className="block text-[11.5px] opacity-75 font-semibold truncate">{t.loginPromoTimersDesc}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <span className="w-9 h-9 rounded-xl bg-white/15 grid place-items-center shrink-0"><QrCode className="w-5 h-5" /></span>
            <span className="min-w-0">
              <span className="block text-[13px] font-extrabold truncate">{t.loginPromoQrTitle}</span>
              <span className="block text-[11.5px] opacity-75 font-semibold truncate">{t.loginPromoQrDesc}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
