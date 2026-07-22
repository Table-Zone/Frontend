'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Wallet, Ticket, Users, Clock, Loader2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { marketerAPI } from '@/lib/marketer-api';

interface Code {
  id: string;
  code: string;
  percentOff: number;
  usageLimit: number | null;
  usedCount: number;
  remaining: number | null;
  conversions: number;
  isActive: boolean;
}

interface Redemption {
  id: string;
  code: string | null;
  customerName: string;
  planLabelEn: string;
  planLabelAr: string;
  state: string;
  redeemedAt: string;
}

interface Earnings {
  totalConversions: number;
  earnedSar: number;
  paidOutSar: number;
  totalSar: number;
  pendingConversions: number;
}

const SAR = (n: number) => `${n.toLocaleString()} SAR`;

export default function MarketerDashboard() {
  const { isRTL } = useLanguage();
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const [codes, setCodes] = useState<Code[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [c, r, e] = await Promise.all([
          marketerAPI.getCodes(),
          marketerAPI.getRedemptions(),
          marketerAPI.getEarnings(),
        ]);
        setCodes(c.data.data);
        setRedemptions(r.data.data);
        setEarnings(e.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const stateBadge = (state: string) => {
    const map: Record<string, { cls: string; ar: string; en: string }> = {
      pending: { cls: 'bg-amber-100 text-amber-700', ar: 'بانتظار الموافقة', en: 'Pending' },
      approved: { cls: 'bg-green-100 text-green-700', ar: 'معتمد', en: 'Approved' },
      rejected: { cls: 'bg-red-100 text-red-600', ar: 'مرفوض', en: 'Rejected' },
    };
    const s = map[state] ?? { cls: 'bg-gray-100 text-gray-600', ar: state, en: state };
    return <Badge className={`${s.cls} border-0`}>{t(s.ar, s.en)}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    );
  }

  const stats = [
    {
      icon: Wallet,
      label: t('العمولة المستحقة', 'Commission earned'),
      value: SAR(earnings?.earnedSar ?? 0),
      hint: t('لم تُدفع بعد', 'not yet paid'),
      accent: 'text-tz-primary',
    },
    {
      icon: Check,
      label: t('تم دفعها', 'Paid out'),
      value: SAR(earnings?.paidOutSar ?? 0),
      hint: t('حُوّلت لك', 'transferred to you'),
      accent: 'text-green-600',
    },
    {
      icon: Users,
      label: t('عمليات مؤكدة', 'Paid conversions'),
      value: String(earnings?.totalConversions ?? 0),
      hint: t('اشتراكات معتمدة', 'approved subs'),
      accent: 'text-tz-espresso',
    },
    {
      icon: Clock,
      label: t('قيد الانتظار', 'Pending'),
      value: String(earnings?.pendingConversions ?? 0),
      hint: t('بانتظار موافقة الإدارة', 'awaiting approval'),
      accent: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-tz-cream-dark"
          >
            <s.icon className={`w-5 h-5 ${s.accent} mb-2`} />
            <p className="text-2xl font-bold text-tz-espresso">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{s.hint}</p>
          </motion.div>
        ))}
      </div>

      {/* Codes */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-tz-espresso mb-3">
          <Ticket className="w-5 h-5 text-tz-primary" />
          {t('أكوادي', 'My codes')}
        </h2>
        {codes.length === 0 ? (
          <p className="text-muted-foreground text-sm bg-white rounded-2xl p-6 border border-tz-cream-dark text-center">
            {t('لا توجد أكواد بعد. تواصل مع الإدارة.', 'No codes yet. Contact the admin.')}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {codes.map((c) => {
              const limit = c.usageLimit ?? 0;
              const pct = limit ? Math.min((c.usedCount / limit) * 100, 100) : 0;
              return (
                <div key={c.id} className="bg-white rounded-2xl p-4 border border-tz-cream-dark">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-tz-espresso">{c.code}</span>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="text-muted-foreground hover:text-tz-primary transition-colors"
                        title={t('نسخ', 'Copy')}
                      >
                        {copied === c.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <Badge className="bg-tz-primary/10 text-tz-primary border-0 gap-1">
                      <Tag className="w-3 h-3" />
                      {c.percentOff}% {t('خصم', 'off')}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        {t('الاستخدام', 'Uses')}: {c.usedCount}/{c.usageLimit ?? '∞'}
                      </span>
                      {c.remaining !== null && (
                        <span className="font-medium text-tz-espresso">
                          {c.remaining} {t('متبقٍ', 'left')}
                        </span>
                      )}
                    </div>
                    <div className="h-2 rounded-full bg-tz-cream-dark overflow-hidden">
                      <div className="h-full bg-tz-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {c.conversions} {t('عملية مؤكدة (عمولة)', 'paid conversions (commission)')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Redemptions */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-tz-espresso mb-3">
          <Users className="w-5 h-5 text-tz-primary" />
          {t('من استخدم الكود', 'Who used your codes')}
        </h2>
        <div className="bg-white rounded-2xl border border-tz-cream-dark overflow-hidden">
          {redemptions.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6 text-center">
              {t('لا توجد استخدامات بعد', 'No redemptions yet')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b border-tz-cream-dark">
                    <th className="text-start font-medium px-4 py-3">{t('العميل', 'Customer')}</th>
                    <th className="text-start font-medium px-4 py-3">{t('الباقة', 'Plan')}</th>
                    <th className="text-start font-medium px-4 py-3">{t('الكود', 'Code')}</th>
                    <th className="text-start font-medium px-4 py-3">{t('الحالة', 'Status')}</th>
                    <th className="text-start font-medium px-4 py-3">{t('التاريخ', 'Date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((r) => (
                    <tr key={r.id} className="border-b border-tz-cream-dark/50 last:border-0">
                      <td className="px-4 py-3 font-medium text-tz-espresso">{r.customerName}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {t(r.planLabelAr, r.planLabelEn) || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.code}</td>
                      <td className="px-4 py-3">{stateBadge(r.state)}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {new Date(r.redeemedAt).toLocaleDateString(isRTL ? 'ar' : 'en')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground/70 mt-2">
          {t(
            'تُدفع العمولة (20%) فقط عند اعتماد الإدارة لاشتراك مدفوع. التجربة المجانية لا تُحتسب.',
            'Commission (20%) is earned only when the admin approves a paid subscription. Free trials do not count.'
          )}
        </p>
      </section>
    </div>
  );
}
