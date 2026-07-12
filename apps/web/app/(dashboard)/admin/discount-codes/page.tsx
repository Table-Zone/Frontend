'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tag, Plus, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminFilterTabs } from '@/components/admin/AdminFilterTabs';

interface DiscountCode {
  id: string;
  code: string;
  percentOff: number;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  code: '',
  percentOff: 10,
  usageLimit: '' as string | number,
  expiresAt: '',
};

export default function DiscountCodesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getDiscountCodes();
      setCodes(res.data.data.codes || []);
    } catch {
      showToast(isRTL ? 'فشل تحميل الأكواد' : 'Failed to load codes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchCodes();
  }, [user]);

  const filteredCodes = codes.filter((code) => {
    if (filter === 'active') return code.isActive;
    if (filter === 'inactive') return !code.isActive;
    return true;
  });

  const isExpired = (code: DiscountCode) =>
    code.expiresAt ? new Date(code.expiresAt) < new Date() : false;

  const isExhausted = (code: DiscountCode) =>
    code.usageLimit !== null && code.usedCount >= code.usageLimit;

  const handleCreate = async () => {
    if (!form.code.trim()) {
      showToast(isRTL ? 'أدخل الكود' : 'Enter a code', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await adminAPI.createDiscountCode({
        code: form.code.trim(),
        percentOff: form.percentOff,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      });
      showToast(isRTL ? 'تم إنشاء الكود' : 'Code created', 'success');
      setDialogOpen(false);
      setForm(emptyForm);
      fetchCodes();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async (code: DiscountCode) => {
    const ok = await confirm({
      title: isRTL ? 'تعطيل الكود' : 'Deactivate Code',
      message: isRTL
        ? `هل تريد تعطيل الكود ${code.code}؟`
        : `Deactivate code ${code.code}?`,
      confirmLabel: isRTL ? 'تعطيل' : 'Deactivate',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deactivateDiscountCode(code.id);
      showToast(isRTL ? 'تم التعطيل' : 'Deactivated', 'success');
      fetchCodes();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const filterLabels = {
    all: isRTL ? 'الكل' : 'All',
    active: isRTL ? 'نشط' : 'Active',
    inactive: isRTL ? 'معطّل' : 'Inactive',
  };

  return (
    <div>
      <AdminPageHeader
        title={isRTL ? 'أكواد الخصم' : 'Discount Codes'}
        icon={Tag}
        description={isRTL ? 'إنشاء أكواد خصم للاشتراكات' : 'Create discount codes for subscriptions'}
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 me-2" />
            {isRTL ? 'إنشاء كود' : 'Create Code'}
          </Button>
        }
      />

      <div className="mb-6">
        <AdminFilterTabs
          filters={['all', 'active', 'inactive'] as const}
          active={filter}
          onChange={setFilter}
          labels={filterLabels}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border">
          {isRTL ? 'لا توجد أكواد' : 'No codes found'}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCodes.map((code) => (
            <motion.div
              key={code.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-tz-cream-dark p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <code className="font-mono font-bold text-lg text-tz-primary">{code.code}</code>
                    <Badge variant="warning">-{code.percentOff}%</Badge>
                    {!code.isActive && (
                      <Badge variant="secondary">{isRTL ? 'معطّل' : 'Inactive'}</Badge>
                    )}
                    {isExpired(code) && (
                      <Badge variant="outline">{isRTL ? 'منتهي' : 'Expired'}</Badge>
                    )}
                    {isExhausted(code) && (
                      <Badge variant="outline">{isRTL ? 'مستنفد' : 'Exhausted'}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>
                      {isRTL ? 'الاستخدام' : 'Usage'}: {code.usedCount}
                      {code.usageLimit !== null ? ` / ${code.usageLimit}` : ` (${isRTL ? 'غير محدود' : 'unlimited'})`}
                    </span>
                    {code.expiresAt && (
                      <span>
                        {isRTL ? 'ينتهي' : 'Expires'}:{' '}
                        {new Date(code.expiresAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </span>
                    )}
                    <span>
                      {new Date(code.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>
                {code.isActive && (
                  <Button variant="outline" size="sm" onClick={() => handleDeactivate(code)}>
                    <Ban className="w-4 h-4 me-2" />
                    {isRTL ? 'تعطيل' : 'Deactivate'}
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إنشاء كود خصم' : 'Create Discount Code'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input
              placeholder={isRTL ? 'الكود (مثال: SUMMER20)' : 'Code (e.g. SUMMER20)'}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            />
            <Input
              type="number"
              min={1}
              max={100}
              placeholder={isRTL ? 'نسبة الخصم %' : 'Discount %'}
              value={form.percentOff}
              onChange={(e) => setForm({ ...form, percentOff: parseInt(e.target.value) || 0 })}
            />
            <Input
              type="number"
              min={1}
              placeholder={isRTL ? 'حد الاستخدام (اختياري)' : 'Usage limit (optional)'}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
