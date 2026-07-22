'use client';

import { useState, useEffect } from 'react';
import { Megaphone, Plus, Ticket, Wallet, BadgeCheck, Ban, Loader2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

interface Marketer {
  id: string;
  name: string;
  email: string;
  commissionPercent: number;
  isActive: boolean;
  codesCount: number;
  conversions: number;
  earnedSar: number;
  paidOutSar: number;
  createdAt: string;
}

interface DetailCode {
  id: string;
  code: string;
  percentOff: number;
  usageLimit: number | null;
  usedCount: number;
  remaining: number | null;
  conversions: number;
  isActive: boolean;
}
interface DetailCommission {
  id: string;
  customerName: string;
  planName: string;
  planAmountSar: number;
  commissionSar: number;
  status: string;
  createdAt: string;
}
interface MarketerDetail extends Marketer {
  codes: DetailCode[];
  commissions: DetailCommission[];
}

const SAR = (n: number) => `${n.toLocaleString()} SAR`;

export default function AdminMarketersPage() {
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const [marketers, setMarketers] = useState<Marketer[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const [detail, setDetail] = useState<MarketerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [codeForm, setCodeForm] = useState({ code: '', percentOff: 10 });
  const [issuing, setIssuing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchMarketers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getMarketers();
      setMarketers(res.data.data.marketers || []);
    } catch {
      showToast(t('فشل تحميل المسوّقين', 'Failed to load marketers'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMarketers(); }, []);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await adminAPI.getMarketerDetail(id);
      setDetail(res.data.data.marketer);
    } catch {
      showToast(t('فشل التحميل', 'Failed to load'), 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const createMarketer = async () => {
    if (!createForm.name || !createForm.email || createForm.password.length < 8) {
      showToast(t('أكمل الحقول (كلمة مرور 8 أحرف+)', 'Fill all fields (password 8+ chars)'), 'error');
      return;
    }
    setSaving(true);
    try {
      await adminAPI.createMarketer(createForm);
      showToast(t('تم إنشاء المسوّق', 'Marketer created'), 'success');
      setCreateOpen(false);
      setCreateForm({ name: '', email: '', password: '' });
      fetchMarketers();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (m: Marketer) => {
    const ok = await confirm({
      title: m.isActive ? t('تعطيل المسوّق؟', 'Disable marketer?') : t('تفعيل المسوّق؟', 'Enable marketer?'),
      message: m.name,
    });
    if (!ok) return;
    try {
      await adminAPI.setMarketerActive(m.id, !m.isActive);
      fetchMarketers();
      if (detail?.id === m.id) openDetail(m.id);
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const issueCode = async () => {
    if (!detail) return;
    setIssuing(true);
    try {
      await adminAPI.issueMarketerCode(detail.id, {
        code: codeForm.code || undefined,
        percentOff: Number(codeForm.percentOff),
      });
      showToast(t('تم إصدار الكود (بحد 50 استخدام)', 'Code issued (50-use cap)'), 'success');
      setCodeForm({ code: '', percentOff: 10 });
      openDetail(detail.id);
      fetchMarketers();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIssuing(false);
    }
  };

  const markPaid = async () => {
    if (!detail) return;
    const ok = await confirm({
      title: t('تأكيد الدفع؟', 'Confirm payout?'),
      message: t(
        `سيتم تحديد ${SAR(detail.earnedSar)} كمدفوعة بعد التحويل البنكي.`,
        `This marks ${SAR(detail.earnedSar)} as paid after your bank transfer.`
      ),
    });
    if (!ok) return;
    try {
      const res = await adminAPI.markMarketerCommissionsPaid(detail.id);
      showToast(res.data.data.message || t('تم', 'Done'), 'success');
      openDetail(detail.id);
      fetchMarketers();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch { /* noop */ }
  };

  return (
    <div>
      <AdminPageHeader
        title={t('المسوّقون', 'Marketers')}
        description={t('إنشاء حسابات المسوّقين وإصدار الأكواد ومتابعة العمولات', 'Create marketers, issue codes, track commissions')}
        icon={Megaphone}
        action={
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-tz-primary hover:bg-tz-primary/90">
            <Plus className="w-4 h-4" />
            {t('مسوّق جديد', 'New marketer')}
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-tz-primary" /></div>
      ) : marketers.length === 0 ? (
        <p className="text-muted-foreground text-center bg-white rounded-2xl p-10 border border-tz-cream-dark">
          {t('لا يوجد مسوّقون بعد', 'No marketers yet')}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {marketers.map((m) => (
            <button
              key={m.id}
              onClick={() => openDetail(m.id)}
              className="text-start bg-white rounded-2xl p-4 border border-tz-cream-dark hover:border-tz-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-tz-espresso">{m.name}</p>
                {m.isActive ? (
                  <Badge className="bg-green-100 text-green-700 border-0">{t('نشط', 'Active')}</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500 border-0">{t('معطّل', 'Disabled')}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3">{m.email}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-sm font-bold text-tz-espresso">{m.codesCount}</p>
                  <p className="text-[10px] text-muted-foreground">{t('أكواد', 'codes')}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-tz-espresso">{m.conversions}</p>
                  <p className="text-[10px] text-muted-foreground">{t('عمليات', 'conv.')}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-tz-primary">{SAR(m.earnedSar)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('مستحق', 'earned')}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create marketer dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('مسوّق جديد', 'New marketer')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder={t('الاسم', 'Name')}
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <Input
              type="email"
              placeholder={t('البريد الإلكتروني', 'Email')}
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            />
            <Input
              type="text"
              placeholder={t('كلمة المرور (8 أحرف+)', 'Password (8+ chars)')}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t('العمولة الافتراضية 20% لكل الباقات.', 'Default commission is 20% across all plans.')}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t('إلغاء', 'Cancel')}</Button>
            <Button onClick={createMarketer} disabled={saving} className="bg-tz-primary hover:bg-tz-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t('إنشاء', 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Marketer detail dialog */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailLoading || !detail ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tz-primary" /></div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-tz-primary" />
                  {detail.name}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-tz-cream rounded-xl p-3 text-center">
                  <Wallet className="w-4 h-4 text-tz-primary mx-auto mb-1" />
                  <p className="font-bold text-tz-espresso text-sm">{SAR(detail.earnedSar)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('مستحق', 'Earned')}</p>
                </div>
                <div className="bg-tz-cream rounded-xl p-3 text-center">
                  <BadgeCheck className="w-4 h-4 text-green-600 mx-auto mb-1" />
                  <p className="font-bold text-tz-espresso text-sm">{SAR(detail.paidOutSar)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('مدفوع', 'Paid out')}</p>
                </div>
                <div className="bg-tz-cream rounded-xl p-3 text-center">
                  <Ticket className="w-4 h-4 text-tz-espresso mx-auto mb-1" />
                  <p className="font-bold text-tz-espresso text-sm">{detail.conversions}</p>
                  <p className="text-[10px] text-muted-foreground">{t('عمليات', 'Conversions')}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <Button size="sm" onClick={markPaid} disabled={detail.earnedSar <= 0} className="bg-green-600 hover:bg-green-700 gap-1">
                  <BadgeCheck className="w-4 h-4" />
                  {t('تحديد العمولة كمدفوعة', 'Mark commission paid')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => toggleActive(detail)} className="gap-1">
                  <Ban className="w-4 h-4" />
                  {detail.isActive ? t('تعطيل', 'Disable') : t('تفعيل', 'Enable')}
                </Button>
              </div>

              {/* Issue code */}
              <div className="bg-tz-cream rounded-xl p-3 mb-5">
                <p className="text-sm font-medium text-tz-espresso mb-2">{t('إصدار كود جديد (بحد 50 استخدام)', 'Issue new code (50-use cap)')}</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <Input
                    placeholder={t('كود مخصص (اختياري)', 'Custom code (optional)')}
                    value={codeForm.code}
                    onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
                    className="flex-1 min-w-[140px] h-9"
                  />
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={codeForm.percentOff}
                      onChange={(e) => setCodeForm({ ...codeForm, percentOff: Number(e.target.value) })}
                      className="w-20 h-9"
                    />
                    <span className="text-sm text-muted-foreground">% {t('خصم', 'off')}</span>
                  </div>
                  <Button size="sm" onClick={issueCode} disabled={issuing} className="bg-tz-primary hover:bg-tz-primary/90 gap-1">
                    {issuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {t('إصدار', 'Issue')}
                  </Button>
                </div>
              </div>

              {/* Codes */}
              <p className="text-sm font-medium text-tz-espresso mb-2">{t('الأكواد', 'Codes')}</p>
              <div className="space-y-2 mb-5">
                {detail.codes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t('لا توجد أكواد', 'No codes')}</p>
                ) : detail.codes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between bg-white border border-tz-cream-dark rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-tz-espresso">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-muted-foreground hover:text-tz-primary">
                        {copied === c.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <Badge className="bg-tz-primary/10 text-tz-primary border-0 text-[10px]">{c.percentOff}%</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {c.usedCount}/{c.usageLimit ?? '∞'} · {c.conversions} {t('عمولة', 'comm.')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Commissions */}
              <p className="text-sm font-medium text-tz-espresso mb-2">{t('العمولات', 'Commissions')}</p>
              {detail.commissions.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t('لا توجد عمولات بعد', 'No commissions yet')}</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.commissions.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm border-b border-tz-cream-dark/50 pb-1.5">
                      <span className="text-tz-espresso">{c.customerName}</span>
                      <span className="text-muted-foreground text-xs">{c.planName}</span>
                      <span className="font-medium text-tz-primary">{SAR(c.commissionSar)}</span>
                      <Badge className={`border-0 text-[10px] ${c.status === 'paid_out' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status === 'paid_out' ? t('مدفوع', 'Paid') : t('مستحق', 'Earned')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
