'use client';

import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  publicMenuUrl: string;
  isRTL: boolean;
  workspaceName: string;
}

interface StickerConfig {
  bgColor: string;
  qrFgColor: string;
  qrBgColor: string;
  ringColor: string;
  restaurantName: string;
  title: string;
  subtitle: string;
  labelText: string;
}

const makeDefaultConfigs = (name: string): StickerConfig[] => [
  { bgColor: '#4318a8', qrFgColor: '#ffffff', qrBgColor: 'transparent', ringColor: '#c9a227', restaurantName: name, title: 'MENU', subtitle: 'المنيو', labelText: 'امسح لاستكشاف القائمة' },
  { bgColor: '#ffffff', qrFgColor: '#7c3aed', qrBgColor: '#faf8ff', ringColor: '#c9a227', restaurantName: name, title: 'امسح القائمة', subtitle: 'Scan to view our menu', labelText: 'QR MENU' },
  { bgColor: '#fffdf5', qrFgColor: '#2c1a00', qrBgColor: '#ffffff', ringColor: '#c9a227', restaurantName: name, title: '', subtitle: '', labelText: 'المنيو' },
  { bgColor: '#f7f5ff', qrFgColor: '#1a0d3d', qrBgColor: '#ffffff', ringColor: '#c9a227', restaurantName: name, title: 'المنيو', subtitle: 'Digital Food Menu', labelText: 'Scan to explore · امسح للاستكشاف' },
];

/* ── Sticker 01: Neon Night ──────────────────────────────────── */
function StickerNeon({ cfg, qrUrl }: { cfg: StickerConfig; qrUrl: string }) {
  return (
    <div style={{
      width: 260, height: 370, borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(160deg, ${cfg.bgColor} 0%, ${cfg.bgColor}cc 45%, ${cfg.bgColor}99 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '26px 22px 22px',
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(192,160,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(192,160,255,0.1) 1px,transparent 1px)',
        backgroundSize: '22px 22px' }} />
      <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(167,139,250,0.55) 0%,rgba(124,58,237,0.2) 50%,transparent 75%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(217,119,87,0.3) 0%,transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.38em', color: '#c4b5fd', fontFamily: 'system-ui, sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 9, opacity: 0.8 }}>{cfg.restaurantName}</div>
        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'system-ui, sans-serif', lineHeight: 0.9, color: cfg.qrFgColor,
          textShadow: `0 0 12px rgba(255,255,255,.6),0 0 30px rgba(192,160,255,.9),0 0 80px ${cfg.bgColor}` }}>{cfg.title}</div>
        {cfg.subtitle && <div style={{ fontSize: 14, color: '#e9d5ff', marginTop: 8, direction: 'rtl' }}>{cfg.subtitle}</div>}
      </div>

      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -20, borderRadius: 28,
          background: 'radial-gradient(circle,rgba(167,139,250,.5) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ padding: 14, background: 'rgba(255,255,255,0.12)', borderRadius: 18,
          border: '1.5px solid rgba(192,160,255,.45)',
          boxShadow: '0 0 28px rgba(167,139,250,.6),0 0 70px rgba(124,58,237,.3)' }}>
          <QRCodeSVG value={qrUrl} size={116} fgColor={cfg.qrFgColor} bgColor="transparent" level="M" />
        </div>
      </div>

      <div style={{ zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px', borderRadius: 20,
          border: '1px solid rgba(192,160,255,.45)', background: 'rgba(167,139,250,.18)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c4b5fd', boxShadow: '0 0 8px #a78bfa', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#e9d5ff', fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.14em' }}>{cfg.labelText}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Sticker 02: Purple Vision ───────────────────────────────── */
function StickerPurple({ cfg, qrUrl }: { cfg: StickerConfig; qrUrl: string }) {
  return (
    <div style={{ width: 260, height: 370, borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: cfg.bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 7, background: 'linear-gradient(90deg,#7c3aed,#a855f7)', flexShrink: 0 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle,rgba(124,58,237,.05) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />

      <div style={{ position: 'absolute', top: 18, left: 18, zIndex: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a0d3d', fontFamily: 'system-ui, sans-serif' }}>{cfg.restaurantName}</span>
      </div>

      <div style={{ marginTop: 68, padding: 18, background: cfg.qrBgColor, borderRadius: 20,
        border: '1.5px solid #ede9fb', boxShadow: '0 8px 40px rgba(124,58,237,.14)', zIndex: 1 }}>
        <QRCodeSVG value={qrUrl} size={128} fgColor={cfg.qrFgColor} bgColor={cfg.qrBgColor} level="M" />
      </div>

      <div style={{ textAlign: 'center', marginTop: 18, padding: '0 24px', zIndex: 1 }}>
        {cfg.title && <div style={{ fontSize: 19, fontWeight: 800, color: '#1a0d3d', fontFamily: 'system-ui, sans-serif', direction: 'rtl' }}>{cfg.title}</div>}
        {cfg.subtitle && <div style={{ fontSize: 11, color: '#9087aa', fontFamily: 'system-ui, sans-serif', marginTop: 4, letterSpacing: '0.04em' }}>{cfg.subtitle}</div>}
      </div>

      <div style={{ marginTop: 'auto', paddingBottom: 22, zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: '#7c3aed' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.55)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#fff', fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.1em' }}>{cfg.labelText}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Sticker 03: Circle Seal ─────────────────────────────────── */
function StickerSeal({ cfg, qrUrl }: { cfg: StickerConfig; qrUrl: string }) {
  return (
    <div style={{ width: 290, height: 290, borderRadius: '50%', overflow: 'hidden', position: 'relative',
      background: `radial-gradient(ellipse at 40% 35%, ${cfg.bgColor}, #fdf4e0)`,
      boxShadow: `0 0 0 5px ${cfg.ringColor}, 0 0 0 9px ${cfg.ringColor}47, 0 0 0 15px ${cfg.ringColor}1a, 0 10px 40px ${cfg.ringColor}4d` }}>

      <svg style={{ position: 'absolute', inset: 0 }} width="290" height="290" viewBox="0 0 290 290">
        <circle cx="145" cy="145" r="132" fill="none" stroke={cfg.ringColor} strokeWidth="1.5" strokeDasharray="5 4" />
        <circle cx="145" cy="145" r="124" fill="none" stroke={`${cfg.ringColor}59`} strokeWidth="0.8" />
        {[0, 90, 180, 270].map(a => {
          const rad = a * Math.PI / 180;
          return <circle key={a} cx={145 + 116 * Math.cos(rad)} cy={145 + 116 * Math.sin(rad)} r="3.5" fill={cfg.ringColor} />;
        })}
        <defs>
          <path id="cp-seal" d="M145,145 m-104,0 a104,104 0 1,1 208,0 a104,104 0 1,1-208,0" />
        </defs>
        <text fontFamily="system-ui, sans-serif" fontSize="10.5" fill={cfg.ringColor} letterSpacing="6" fontWeight="600">
          <textPath href="#cp-seal">{`· ${cfg.restaurantName} · امسح الكود · قائمتنا الرقمية · SCAN ME ·`}</textPath>
        </text>
      </svg>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.28em', color: cfg.ringColor, fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>{cfg.restaurantName}</div>
        <div style={{ background: '#fff', padding: 11, borderRadius: 12, border: `1.5px solid ${cfg.ringColor}4d`,
          boxShadow: `0 3px 18px ${cfg.ringColor}38` }}>
          <QRCodeSVG value={qrUrl} size={96} fgColor={cfg.qrFgColor} bgColor="#fff" level="M" />
        </div>
        <div style={{ fontSize: 12, color: cfg.ringColor, direction: 'rtl', letterSpacing: '0.05em' }}>{cfg.labelText}</div>
      </div>
    </div>
  );
}

/* ── Sticker 04: Minimal Float ───────────────────────────────── */
function StickerFloat({ cfg, qrUrl }: { cfg: StickerConfig; qrUrl: string }) {
  return (
    <div style={{ width: 260, height: 370, borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: cfg.bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 5, background: 'linear-gradient(90deg,#D97757,#e8a07a)', flexShrink: 0 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle,rgba(124,58,237,.07) 1px,transparent 1px)', backgroundSize: '20px 20px', backgroundPosition: '10px 10px' }} />

      <div style={{ marginTop: 24, zIndex: 1 }}>
        <span style={{ color: '#1a0d3d', fontSize: 13, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>{cfg.restaurantName}</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, padding: '0 20px', zIndex: 1 }}>
        {cfg.title && <div style={{ fontSize: 26, fontWeight: 700, color: cfg.qrFgColor, fontFamily: 'system-ui, sans-serif', lineHeight: 1.2, direction: 'rtl' }}>{cfg.title}</div>}
        {cfg.subtitle && <div style={{ fontSize: 11, color: '#9087aa', marginTop: 4 }}>{cfg.subtitle}</div>}
      </div>

      <div style={{ marginTop: 22, zIndex: 1, padding: 16, background: cfg.qrBgColor, borderRadius: 20,
        boxShadow: '0 28px 70px rgba(100,70,200,.18),0 6px 22px rgba(100,70,200,.1)' }}>
        <QRCodeSVG value={qrUrl} size={118} fgColor={cfg.qrFgColor} bgColor={cfg.qrBgColor} level="M" />
      </div>

      <div style={{ marginTop: 20, zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 20, border: '1.5px solid #ede9fb', background: '#fff' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97757', boxShadow: '0 0 6px rgba(217,119,87,.5)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#4a3f6a', fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}>{cfg.labelText}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingBottom: 22, zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 28, height: 3, borderRadius: 2, background: '#D97757' }} />
          <div style={{ width: 8, height: 3, borderRadius: 2, background: '#ede9fb' }} />
          <div style={{ width: 8, height: 3, borderRadius: 2, background: '#ede9fb' }} />
        </div>
      </div>
    </div>
  );
}

const STICKER_META = [
  { id: 1, name: 'Night',    nameAr: 'ليلي',    Comp: StickerNeon },
  { id: 2, name: 'Purple',   nameAr: 'بنفسجي',  Comp: StickerPurple },
  { id: 3, name: 'Circular', nameAr: 'دائري',   Comp: StickerSeal },
  { id: 4, name: 'Float',    nameAr: 'تقليدي',  Comp: StickerFloat },
];

export default function QRStickersTab({ publicMenuUrl, isRTL, workspaceName }: Props) {
  const [configs, setConfigs] = useState<StickerConfig[]>(() => makeDefaultConfigs(workspaceName));
  const [selected, setSelected] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);

  const updateConfig = (field: keyof StickerConfig, value: string) => {
    setConfigs(prev => prev.map((c, i) => i === selected ? { ...c, [field]: value } : c));
  };

  const handleDownload = async () => {
    if (!stickerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(stickerRef.current, { pixelRatio: 3, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `qr-sticker-${STICKER_META[selected].name.toLowerCase().replace(/ /g, '-')}.png`;
      a.click();
    } catch {
      // fallback: open in new tab
    } finally {
      setDownloading(false);
    }
  };

  const cfg = configs[selected];
  const { Comp } = STICKER_META[selected];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-tz-espresso">
          {isRTL ? 'ملصقات الباركود' : 'QR Stickers'}
        </h2>
        <p className="text-sm text-gray-500">
          {isRTL ? '4 تصاميم إبداعية — خصّص الألوان والنص ثم حمّل بدقة عالية' : '4 creative designs — customize colors & text, then download in high quality'}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* Sticker thumbnail strip */}
        <div className="flex xl:flex-col gap-3 overflow-x-auto xl:overflow-x-visible xl:overflow-y-auto pb-2 xl:pb-0 shrink-0">
          {STICKER_META.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(i)}
              className={`shrink-0 flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left xl:w-48 ${
                selected === i
                  ? 'border-tz-primary bg-orange-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: configs[i].bgColor === '#ffffff' || configs[i].bgColor === '#f7f5ff' || configs[i].bgColor === '#fffdf5' || configs[i].bgColor === '#f5e8ca' ? '#f3f0ff' : configs[i].bgColor, color: '#fff' }}>
                0{s.id}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-semibold text-gray-800">{isRTL ? s.nameAr : s.name}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="flex-1 flex flex-col items-center gap-4">
          {/* Navigation arrows for mobile */}
          <div className="flex items-center gap-3 xl:hidden">
            <button onClick={() => setSelected(s => Math.max(0, s - 1))} disabled={selected === 0}
              className="p-1.5 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-600">{isRTL ? STICKER_META[selected].nameAr : STICKER_META[selected].name}</span>
            <button onClick={() => setSelected(s => Math.min(STICKER_META.length - 1, s + 1))} disabled={selected === STICKER_META.length - 1}
              className="p-1.5 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div ref={stickerRef} className="inline-block">
            <Comp cfg={cfg} qrUrl={publicMenuUrl || 'https://tablezone.app/menu/demo'} />
          </div>

          <Button onClick={handleDownload} disabled={downloading} className="gap-2 min-w-[160px]">
            <Download className="w-4 h-4" />
            {downloading ? (isRTL ? 'جاري التحميل...' : 'Downloading…') : (isRTL ? 'تحميل PNG' : 'Download PNG')}
          </Button>
        </div>

        {/* Customization panel */}
        <div className="w-full xl:w-64 space-y-4 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">
              {isRTL ? 'تخصيص التصميم' : 'Customize Design'}
            </h3>

            {/* Background color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'لون الخلفية' : 'Background'}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                <div className="relative w-6 h-6 shrink-0">
                  <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: cfg.bgColor }} />
                  <input type="color" value={cfg.bgColor} onChange={e => updateConfig('bgColor', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
                <input type="text" value={cfg.bgColor.toUpperCase()}
                  onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) updateConfig('bgColor', e.target.value.toLowerCase()); }}
                  onBlur={e => { if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateConfig('bgColor', cfg.bgColor); }}
                  maxLength={7} className="w-20 text-xs font-mono text-gray-600 bg-transparent outline-none border-none" spellCheck={false} />
              </div>
            </div>

            {/* QR foreground color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'لون الباركود' : 'QR Color'}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                <div className="relative w-6 h-6 shrink-0">
                  <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: cfg.qrFgColor }} />
                  <input type="color" value={cfg.qrFgColor} onChange={e => updateConfig('qrFgColor', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
                <input type="text" value={cfg.qrFgColor.toUpperCase()}
                  onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) updateConfig('qrFgColor', e.target.value.toLowerCase()); }}
                  onBlur={e => { if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateConfig('qrFgColor', cfg.qrFgColor); }}
                  maxLength={7} className="w-20 text-xs font-mono text-gray-600 bg-transparent outline-none border-none" spellCheck={false} />
              </div>
            </div>

            {/* QR background color */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'خلفية الباركود' : 'QR Background'}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                <div className="relative w-6 h-6 shrink-0">
                  <div className="w-6 h-6 rounded-md border border-black/10 bg-[repeating-conic-gradient(#ddd_0%_25%,white_0%_50%)] bg-[length:8px_8px]"
                    style={{ backgroundColor: cfg.qrBgColor === 'transparent' ? undefined : cfg.qrBgColor }} />
                  <input type="color" value={cfg.qrBgColor === 'transparent' ? '#ffffff' : cfg.qrBgColor}
                    onChange={e => updateConfig('qrBgColor', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </div>
                <input type="text" value={cfg.qrBgColor === 'transparent' ? 'transparent' : cfg.qrBgColor.toUpperCase()}
                  onChange={e => { const v = e.target.value; if (v === 'transparent' || /^#[0-9A-Fa-f]{0,6}$/.test(v)) updateConfig('qrBgColor', v.toLowerCase()); }}
                  maxLength={11} className="w-24 text-xs font-mono text-gray-600 bg-transparent outline-none border-none" spellCheck={false} />
              </div>
            </div>

            {/* Ring color — Circular sticker only */}
            {selected === 2 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                  {isRTL ? 'لون الحلقة' : 'Ring Color'}
                </label>
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                  <div className="relative w-6 h-6 shrink-0">
                    <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: cfg.ringColor }} />
                    <input type="color" value={cfg.ringColor} onChange={e => updateConfig('ringColor', e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                  <input type="text" value={cfg.ringColor.toUpperCase()}
                    onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) updateConfig('ringColor', e.target.value.toLowerCase()); }}
                    onBlur={e => { if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateConfig('ringColor', cfg.ringColor); }}
                    maxLength={7} className="w-20 text-xs font-mono text-gray-600 bg-transparent outline-none border-none" spellCheck={false} />
                </div>
              </div>
            )}

            {/* Label text */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'نص البادج السفلي' : 'Bottom Badge'}
              </label>
              <input
                type="text"
                value={cfg.labelText}
                onChange={e => updateConfig('labelText', e.target.value)}
                dir="auto"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-tz-primary focus:ring-2 focus:ring-tz-primary/10 transition-colors"
                placeholder={isRTL ? 'نص البادج...' : 'Badge text...'}
              />
            </div>

            {/* Restaurant name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'اسم المطعم' : 'Restaurant Name'}
              </label>
              <input
                type="text"
                value={cfg.restaurantName}
                onChange={e => updateConfig('restaurantName', e.target.value)}
                dir="auto"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-tz-primary focus:ring-2 focus:ring-tz-primary/10 transition-colors"
                placeholder="Table Zone"
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'العنوان الرئيسي' : 'Title'}
              </label>
              <input
                type="text"
                value={cfg.title}
                onChange={e => updateConfig('title', e.target.value)}
                dir="auto"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-tz-primary focus:ring-2 focus:ring-tz-primary/10 transition-colors"
                placeholder={isRTL ? 'مثال: MENU' : 'e.g. MENU'}
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block">
                {isRTL ? 'النص الثانوي' : 'Subtitle'}
              </label>
              <input
                type="text"
                value={cfg.subtitle}
                onChange={e => updateConfig('subtitle', e.target.value)}
                dir="auto"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-tz-primary focus:ring-2 focus:ring-tz-primary/10 transition-colors"
                placeholder={isRTL ? 'مثال: المنيو' : 'e.g. Digital Menu'}
              />
            </div>

            {/* Reset */}
            <button
              onClick={() => setConfigs(prev => prev.map((c, i) => i === selected ? makeDefaultConfigs(workspaceName)[selected] : c))}
              className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              {isRTL ? 'إعادة تعيين الافتراضي' : 'Reset to default'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
