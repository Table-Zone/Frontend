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
  instagramUrl?: string;
  tiktokUrl?: string;
  googleMapsUrl?: string;
}

type SocialKind = 'instagram' | 'tiktok' | 'maps';
interface SocialItem { kind: SocialKind; handle: string }

/* Derive a short display handle from a full URL */
function deriveHandle(kind: SocialKind, url: string): string {
  if (kind === 'maps') return url; // handled specially (icon only)
  try {
    const path = new URL(url).pathname.replace(/\/+$/, '');
    const seg = path.split('/').filter(Boolean).pop() || '';
    const clean = seg.replace(/^@/, '');
    return clean ? `@${clean}` : '';
  } catch {
    const seg = url.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
    const clean = seg.replace(/^@/, '');
    return clean ? `@${clean}` : '';
  }
}

function buildSocials(p: { instagramUrl?: string; tiktokUrl?: string; googleMapsUrl?: string }): SocialItem[] {
  const out: SocialItem[] = [];
  if (p.instagramUrl?.trim()) out.push({ kind: 'instagram', handle: deriveHandle('instagram', p.instagramUrl.trim()) });
  if (p.tiktokUrl?.trim()) out.push({ kind: 'tiktok', handle: deriveHandle('tiktok', p.tiktokUrl.trim()) });
  if (p.googleMapsUrl?.trim()) out.push({ kind: 'maps', handle: '' });
  return out;
}

/* Compact brand glyphs (inherit currentColor) */
const SocialGlyph = ({ kind, size = 12 }: { kind: SocialKind; size?: number }) => {
  if (kind === 'instagram') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
  if (kind === 'tiktok') return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .52.04.77.11V9.79a5.67 5.67 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.34 7.34 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
};

/* Small social strip shown at the bottom of a sticker */
function StickerSocial({ socials, color, size = 12 }: { socials: SocialItem[]; color: string; size?: number }) {
  if (!socials.length) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 10, color, direction: 'ltr' }}>
      {socials.map((s) => (
        <span key={s.kind} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <SocialGlyph kind={s.kind} size={size} />
          {s.handle && <span style={{ fontSize: size - 2, fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.01em' }}>{s.handle}</span>}
        </span>
      ))}
    </div>
  );
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
  { bgColor: '#ffffff', qrFgColor: '#c2410c', qrBgColor: 'transparent', ringColor: '#c9a227', restaurantName: name, title: 'MENU', subtitle: 'المنيو', labelText: 'امسح لاستكشاف القائمة' },
  { bgColor: '#ffffff', qrFgColor: '#0d9488', qrBgColor: '#f0fdfa', ringColor: '#c9a227', restaurantName: name, title: 'امسح القائمة', subtitle: 'Scan to view our menu', labelText: 'QR MENU' },
  { bgColor: '#ffffff', qrFgColor: '#2c1a00', qrBgColor: '#ffffff', ringColor: '#c9a227', restaurantName: name, title: '', subtitle: '', labelText: 'المنيو' },
  { bgColor: '#ffffff', qrFgColor: '#1f2937', qrBgColor: '#ffffff', ringColor: '#c9a227', restaurantName: name, title: 'المنيو', subtitle: 'Digital Food Menu', labelText: 'Scan to explore · امسح للاستكشاف' },
];

/* ── Sticker 01: Aurora — clean light card with violet accents ── */
function StickerNeon({ cfg, qrUrl, socials }: { cfg: StickerConfig; qrUrl: string; socials: SocialItem[] }) {
  const accent = cfg.qrFgColor; // violet by default
  return (
    <div style={{
      width: 260, height: 370, borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(165deg, ${cfg.bgColor} 0%, ${cfg.bgColor} 55%, ${accent}0d 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '26px 22px 22px',
      border: `1px solid ${accent}1f`,
    }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(${accent}0f 1px,transparent 1px),linear-gradient(90deg,${accent}0f 1px,transparent 1px)`,
        backgroundSize: '22px 22px' }} />
      <div style={{ position: 'absolute', top: -70, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle,${accent}26 0%,transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: 9.5, letterSpacing: '0.38em', color: accent, fontFamily: 'system-ui, sans-serif', fontWeight: 700, textTransform: 'uppercase', marginBottom: 9, opacity: 0.75 }}>{cfg.restaurantName}</div>
        <div style={{ fontSize: 48, fontWeight: 900, fontFamily: 'system-ui, sans-serif', lineHeight: 0.9, color: accent,
          textShadow: `0 2px 18px ${accent}33` }}>{cfg.title}</div>
        {cfg.subtitle && <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8, direction: 'rtl' }}>{cfg.subtitle}</div>}
      </div>

      <div style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ padding: 14, background: '#fff', borderRadius: 18,
          border: `1.5px solid ${accent}26`,
          boxShadow: `0 14px 40px ${accent}1f, 0 4px 14px rgba(0,0,0,.05)` }}>
          <QRCodeSVG value={qrUrl} size={116} fgColor={cfg.qrFgColor} bgColor="transparent" level="M" />
        </div>
      </div>

      <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 20,
          background: accent }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.7)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#fff', fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.14em' }}>{cfg.labelText}</span>
        </div>
        <StickerSocial socials={socials} color={accent} />
      </div>
    </div>
  );
}

/* ── Sticker 02: Purple Vision ───────────────────────────────── */
function StickerPurple({ cfg, qrUrl, socials }: { cfg: StickerConfig; qrUrl: string; socials: SocialItem[] }) {
  return (
    <div style={{ width: 260, height: 370, borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: cfg.bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 7, background: 'linear-gradient(90deg,#0d9488,#2dd4bf)', flexShrink: 0 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle,rgba(13,148,136,.06) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />

      <div style={{ position: 'absolute', top: 18, left: 18, zIndex: 2 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>{cfg.restaurantName}</span>
      </div>

      <div style={{ marginTop: 68, padding: 18, background: cfg.qrBgColor, borderRadius: 20,
        border: '1.5px solid #ccfbf1', boxShadow: '0 8px 40px rgba(13,148,136,.14)', zIndex: 1 }}>
        <QRCodeSVG value={qrUrl} size={128} fgColor={cfg.qrFgColor} bgColor={cfg.qrBgColor} level="M" />
      </div>

      <div style={{ textAlign: 'center', marginTop: 18, padding: '0 24px', zIndex: 1 }}>
        {cfg.title && <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', fontFamily: 'system-ui, sans-serif', direction: 'rtl' }}>{cfg.title}</div>}
        {cfg.subtitle && <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'system-ui, sans-serif', marginTop: 4, letterSpacing: '0.04em' }}>{cfg.subtitle}</div>}
      </div>

      <div style={{ marginTop: 'auto', paddingBottom: 22, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', borderRadius: 20, background: '#0d9488' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.55)', flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#fff', fontFamily: 'system-ui, sans-serif', fontWeight: 600, letterSpacing: '0.1em' }}>{cfg.labelText}</span>
        </div>
        <StickerSocial socials={socials} color="#0d9488" />
      </div>
    </div>
  );
}

/* ── Sticker 03: Circle Seal ─────────────────────────────────── */
function StickerSeal({ cfg, qrUrl, socials }: { cfg: StickerConfig; qrUrl: string; socials: SocialItem[] }) {
  return (
    <div style={{ width: 290, height: 290, borderRadius: '50%', overflow: 'hidden', position: 'relative',
      background: `radial-gradient(ellipse at 40% 35%, ${cfg.bgColor}, ${cfg.bgColor})`,
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
        <StickerSocial socials={socials} color={cfg.ringColor} size={11} />
      </div>
    </div>
  );
}

/* ── Sticker 04: Minimal Float ───────────────────────────────── */
function StickerFloat({ cfg, qrUrl, socials }: { cfg: StickerConfig; qrUrl: string; socials: SocialItem[] }) {
  return (
    <div style={{ width: 260, height: 370, borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: cfg.bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: 5, background: 'linear-gradient(90deg,#D97757,#e8a07a)', flexShrink: 0 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle,rgba(217,119,87,.07) 1px,transparent 1px)', backgroundSize: '20px 20px', backgroundPosition: '10px 10px' }} />

      <div style={{ marginTop: 24, zIndex: 1 }}>
        <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>{cfg.restaurantName}</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: 16, padding: '0 20px', zIndex: 1 }}>
        {cfg.title && <div style={{ fontSize: 26, fontWeight: 700, color: cfg.qrFgColor, fontFamily: 'system-ui, sans-serif', lineHeight: 1.2, direction: 'rtl' }}>{cfg.title}</div>}
        {cfg.subtitle && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{cfg.subtitle}</div>}
      </div>

      <div style={{ marginTop: 22, zIndex: 1, padding: 16, background: cfg.qrBgColor, borderRadius: 20,
        boxShadow: '0 28px 70px rgba(217,119,87,.16),0 6px 22px rgba(0,0,0,.06)' }}>
        <QRCodeSVG value={qrUrl} size={118} fgColor={cfg.qrFgColor} bgColor={cfg.qrBgColor} level="M" />
      </div>

      <div style={{ marginTop: 20, zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 16px', borderRadius: 20, border: '1.5px solid #f5ddd0', background: '#fff' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D97757', boxShadow: '0 0 6px rgba(217,119,87,.5)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: '#6b5544', fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}>{cfg.labelText}</span>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingBottom: 22, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <StickerSocial socials={socials} color="#6b5544" />
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 28, height: 3, borderRadius: 2, background: '#D97757' }} />
          <div style={{ width: 8, height: 3, borderRadius: 2, background: '#f5ddd0' }} />
          <div style={{ width: 8, height: 3, borderRadius: 2, background: '#f5ddd0' }} />
        </div>
      </div>
    </div>
  );
}

const STICKER_META = [
  { id: 1, name: 'Sticker 1', nameAr: 'ملصق 1', Comp: StickerNeon },
  { id: 2, name: 'Sticker 2', nameAr: 'ملصق 2', Comp: StickerPurple },
  { id: 3, name: 'Sticker 3', nameAr: 'ملصق 3', Comp: StickerSeal },
  { id: 4, name: 'Sticker 4', nameAr: 'ملصق 4', Comp: StickerFloat },
];

export default function QRStickersTab({ publicMenuUrl, isRTL, workspaceName, instagramUrl, tiktokUrl, googleMapsUrl }: Props) {
  const socials = buildSocials({ instagramUrl, tiktokUrl, googleMapsUrl });
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
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                selected === i ? 'bg-tz-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                0{s.id}
              </div>
              <div className="hidden xl:block">
                <p className="text-xs font-semibold text-gray-800">{isRTL ? s.nameAr : s.name}</p>
              </div>
            </button>
          ))}

          {/* Request a custom sticker — opens WhatsApp */}
          <a
            href={`https://wa.me/966501549458?text=${encodeURIComponent(
              isRTL ? 'مرحباً، أرغب في طلب تصميم ملصق QR خاص بي' : "Hi, I'd like to request my own custom QR sticker",
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 transition-all text-left xl:w-48 hover:border-tz-primary hover:shadow-sm bg-gray-50/50"
          >
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
              </svg>
            </div>
            <div className="hidden xl:block">
              <p className="text-xs font-semibold text-gray-900 leading-snug">
                {isRTL ? 'ما اعجبك ولا ملصق هنا؟' : 'Request your own sticker'}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                {isRTL ? 'تواصل معنا وبنصمم لك ملصق خاص' : 'Chat with us on WhatsApp'}
              </p>
            </div>
          </a>
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
            <Comp cfg={cfg} qrUrl={publicMenuUrl || 'https://tablezone.app/menu/demo'} socials={socials} />
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
