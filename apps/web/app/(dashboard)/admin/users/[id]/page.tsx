'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Ban, CheckCircle, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI } from '@/lib/api';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser } = useAuth();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', language: 'ar' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await adminAPI.getUserDetail(params.id as string);
      const data = res.data.data;
      setUser(data);
      setForm({ name: data.name, email: data.email, language: data.language });
    } catch {
      showToast(isRTL ? 'المستخدم غير موجود' : 'User not found', 'error');
      router.push('/admin/users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser && authUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUser();
  }, [params.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await adminAPI.updateUser(params.id as string, form);
      showToast(isRTL ? 'تم الحفظ' : 'Saved', 'success');
      fetchUser();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuspend = async () => {
    try {
      await adminAPI.suspendUser(params.id as string);
      showToast(isRTL ? 'تم التعليق' : 'Suspended', 'success');
      fetchUser();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const handleActivate = async () => {
    try {
      await adminAPI.activateUser(params.id as string);
      showToast(isRTL ? 'تم التفعيل' : 'Activated', 'success');
      fetchUser();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: isRTL ? 'حذف المستخدم' : 'Delete User',
      message: isRTL ? 'حذف المستخدم وجميع بياناته؟' : 'Delete user and all related data?',
      confirmLabel: isRTL ? 'حذف' : 'Delete',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deleteUser(params.id as string);
      showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
      router.push('/admin/users');
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        {isRTL ? 'العودة للمستخدمين' : 'Back to Users'}
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-tz-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-tz-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          {user.isSuspended && <Badge variant="alert">{isRTL ? 'معلق' : 'Suspended'}</Badge>}
        </div>
        <div className="flex gap-2">
          {user.isSuspended ? (
            <Button variant="outline" onClick={handleActivate}><CheckCircle className="w-4 h-4 me-1" />{isRTL ? 'تفعيل' : 'Activate'}</Button>
          ) : (
            <Button variant="outline" onClick={handleSuspend}><Ban className="w-4 h-4 me-1" />{isRTL ? 'تعليق' : 'Suspend'}</Button>
          )}
          <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 me-1" />{isRTL ? 'حذف' : 'Delete'}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>{isRTL ? 'تعديل البيانات' : 'Edit Details'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isRTL ? 'الاسم' : 'Name'} />
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder={isRTL ? 'البريد' : 'Email'} />
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full h-10 rounded-xl border px-3"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 me-1" />{isRTL ? 'حفظ' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{isRTL ? 'معلومات الحساب' : 'Account Info'}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p><strong>{isRTL ? 'تاريخ التسجيل:' : 'Registered:'}</strong> {new Date(user.createdAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}</p>
            <p><strong>{isRTL ? 'آخر دخول:' : 'Last login:'}</strong> {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US') : '—'}</p>
            {user.subscription && (
              <>
                <p><strong>{isRTL ? 'نوع الحساب:' : 'Account type:'}</strong> {user.subscription.accountType}</p>
                <p><strong>{isRTL ? 'الباقة:' : 'Plan:'}</strong> {user.subscription.plan}</p>
                {user.subscription.periodEnd && (
                  <p><strong>{isRTL ? 'ينتهي:' : 'Expires:'}</strong> {new Date(user.subscription.periodEnd).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                )}
              </>
            )}
            {user.trialCodeUsed && (
              <p><strong>{isRTL ? 'كود التجربة:' : 'Trial code:'}</strong> {user.trialCodeUsed}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
