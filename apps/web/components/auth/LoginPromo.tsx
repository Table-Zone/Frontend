'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { TimerPhoneMock, QRSvg, type TimerMockTable } from '@/components/landing/mocks';

export default function LoginPromo() {
  const { t } = useLanguage();
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

  return (
    <section className="relative hidden lg:flex flex-col overflow-hidden text-white px-14 pt-11 pb-9 bg-[linear-gradient(158deg,#E87E3A_0%,#C75B12_52%,#9A4309_100%)]">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_-8%,rgba(251,228,208,0.35),transparent_60%),radial-gradient(760px_620px_at_105%_108%,rgba(90,43,12,0.35),transparent_62%)]" />

      {/* top: brand */}
      <div className="relative flex items-center gap-3">
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

      {/* phone + copy centered together in the remaining space */}
      <div className="relative flex-1 flex flex-col items-center justify-center gap-8">
        {/* stage: table-timer phone + QR menu promo cards */}
        <div className="relative grid place-items-center">
          {/* QR menu card */}
          <div className="absolute z-[3] top-[-4%] end-[calc(50%-230px)] bg-white rounded-2xl p-3.5 rotate-3 shadow-[0_24px_50px_rgba(0,0,0,0.25)] text-center">
            <div className="rounded-lg border border-tz-espresso/10 overflow-hidden leading-[0]">
              <QRSvg size={104} seed={17} />
            </div>
            <div className="text-[11.5px] font-extrabold text-tz-espresso mt-2">{t.loginPromoQrTitle}</div>
            <div className="text-[10px] text-tz-espresso/55 font-semibold mt-0.5">{t.loginPromoScanToView}</div>
          </div>

          {/* phone running the Tables Timer with live countdowns */}
          <div className="relative z-[2] -rotate-2">
            <TimerPhoneMock tables={tables} />
          </div>
        </div>

        {/* copy */}
        <div className="relative text-center max-w-[480px] mx-auto">
          <h2 className="text-[28px] font-extrabold tracking-tight mb-2">{t.loginPromoTitle}</h2>
          <p className="text-[14.5px] leading-relaxed opacity-85 max-w-[420px] mx-auto">{t.loginPromoDesc}</p>
        </div>
      </div>
    </section>
  );
}
