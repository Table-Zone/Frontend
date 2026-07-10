'use client';

import Image from 'next/image';
import { QrCode, Timer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

function QrGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 33 33" className={className} aria-hidden="true">
      <rect width="33" height="33" fill="#fff" rx="2" />
      {/* finder patterns */}
      {[[2, 2], [24, 2], [2, 24]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" fill="#1E1B18" />
          <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1E1B18" />
        </g>
      ))}
      {/* data modules */}
      {[
        [11, 2], [13, 2], [16, 3], [19, 2], [11, 4], [14, 5], [17, 5], [20, 4],
        [11, 7], [13, 8], [16, 7], [19, 8], [2, 11], [4, 12], [7, 11], [9, 13],
        [12, 11], [14, 12], [17, 11], [19, 13], [22, 11], [24, 12], [27, 11], [29, 13],
        [3, 15], [6, 16], [9, 15], [12, 16], [15, 15], [18, 16], [21, 15], [24, 16],
        [27, 15], [30, 16], [2, 19], [5, 20], [8, 19], [11, 20], [14, 19], [17, 20],
        [20, 19], [23, 20], [26, 19], [29, 20], [11, 23], [14, 24], [17, 23], [20, 24],
        [23, 23], [26, 24], [29, 23], [12, 27], [15, 28], [18, 27], [21, 28], [24, 27],
        [27, 28], [30, 27], [11, 30], [14, 30], [17, 30], [20, 30], [25, 30], [29, 30],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="2" height="2" fill="#1E1B18" />
      ))}
    </svg>
  );
}

export default function LoginPromo() {
  const { t } = useLanguage();

  const tables = [
    { name: `${t.loginPromoTable} 4`, time: '12:45', status: t.occupied, dot: 'bg-tz-green', text: 'text-tz-green' },
    { name: `${t.loginPromoTable} 7`, time: '38:20', status: t.warning, dot: 'bg-tz-amber-light', text: 'text-tz-amber' },
    { name: `${t.loginPromoTable} 2`, time: '00:00', status: t.free, dot: 'bg-tz-espresso/20', text: 'text-muted-foreground' },
  ];

  return (
    <section className="relative hidden lg:flex flex-col overflow-hidden text-white px-14 pt-11 pb-9 bg-[linear-gradient(158deg,#C75B12_0%,#9A4309_46%,#5C2B0C_100%)]">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_-8%,rgba(232,126,58,0.45),transparent_60%),radial-gradient(760px_620px_at_105%_108%,rgba(0,0,0,0.35),transparent_62%)]" />

      {/* top: brand + chip */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-[46px] h-[46px] rounded-[13px] overflow-hidden shadow-[0_10px_22px_rgba(0,0,0,0.3)]">
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

      {/* stage: phone (timers) + floating QR card + overtime ping */}
      <div className="relative flex-1 grid place-items-center my-2">
        {/* floating QR menu card */}
        <div className="absolute z-[4] top-[10%] end-[calc(50%-215px)] w-[150px] bg-white rounded-2xl p-3.5 shadow-[0_24px_50px_rgba(0,0,0,0.3)] rotate-3 text-center">
          <QrGlyph className="w-full aspect-square rounded-lg border border-tz-espresso/10" />
          <div className="text-[11.5px] font-extrabold text-tz-espresso mt-2">{t.loginPromoQrTitle}</div>
          <div className="text-[10px] text-tz-espresso/55 font-semibold mt-0.5">{t.loginPromoScanToView}</div>
        </div>

        {/* overtime alert ping */}
        <div className="absolute z-[4] bottom-[13%] start-[calc(50%-215px)] w-[216px] bg-white rounded-2xl px-3.5 py-3 shadow-[0_24px_50px_rgba(0,0,0,0.3)] -rotate-3 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-tz-red shrink-0 shadow-[0_0_0_4px_rgba(185,28,28,0.2)] animate-pulse-slow" />
          <span className="min-w-0">
            <span className="block text-[12px] font-extrabold text-tz-espresso truncate">
              {t.loginPromoTable} 12 · <span className="text-tz-red font-mono">62:10</span>
            </span>
            <span className="block text-[11px] text-tz-espresso/55 font-semibold truncate">{t.loginPromoOvertimeAlert}</span>
          </span>
        </div>

        {/* phone running the Tables Timer */}
        <div className="relative z-[2] w-[266px] h-[540px] bg-[#140A04] rounded-[42px] p-2.5 -rotate-[4deg] shadow-[0_48px_90px_rgba(0,0,0,0.45),inset_0_0_0_1.5px_rgba(255,255,255,0.08)]">
          <div className="absolute top-[9px] start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-[90px] h-[23px] bg-[#140A04] rounded-full z-[3]" />
          <div className="w-full h-full bg-[#FFFCF6] rounded-[33px] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-5 pt-4 pb-1 text-[12px] font-bold text-tz-espresso">
              <span>9:41</span>
              <span className="tracking-tight">●●●</span>
            </div>
            <div className="px-4 pt-1 pb-3 text-center">
              <div className="text-[11.5px] text-tz-espresso/50 font-semibold">{t.appName}</div>
              <div className="text-[17px] font-extrabold text-tz-espresso mt-0.5">{t.tablesTimer}</div>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-tz-primary/10 text-tz-primary-dark text-[11px] font-bold">
                <Timer className="w-3 h-3" /> {t.startTimer}
              </div>
            </div>
            <div className="px-4 flex flex-col gap-2.5">
              {tables.map((tb) => (
                <div key={tb.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 bg-white border border-tz-espresso/10 rounded-[14px] px-3 py-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${tb.dot}`} />
                  <span>
                    <span className="block font-bold text-[12.5px] text-tz-espresso">{tb.name}</span>
                    <span className={`block text-[10.5px] font-bold mt-0.5 ${tb.text}`}>{tb.status}</span>
                  </span>
                  <span className={`font-mono font-extrabold text-[14px] tabular-nums ${tb.text}`}>{tb.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-auto mx-4 mb-4 bg-tz-espresso text-white rounded-[14px] px-3.5 py-3 flex justify-between items-center text-[12.5px] font-bold">
              <span className="flex items-center gap-2"><QrCode className="w-4 h-4" /> {t.menuDesign}</span>
              <span className="bg-tz-primary rounded-full px-2.5 py-0.5 text-[11px]">{t.active}</span>
            </div>
          </div>
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
