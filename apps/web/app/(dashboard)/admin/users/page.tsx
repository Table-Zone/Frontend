'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Eye, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminFilterTabs } from '@/components/admin/AdminFilterTabs';

interface UserItem {
  id: string;
  name: string;
  email: string;
  isSuspended: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  accountType: string;
  plan: string | null;
  daysRemaining: number | null;
  expiringSoon: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getUsers({
        search: search || undefined,
        status: filter === 'all' ? undefined : filter,
        limit: 100,
      });
      setUsers(res.data.data.users || []);
    } catch {
      showToast(isRTL ? 'فشل التحميل' : 'Failed to load', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchUsers();
  }, [filter, user]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSuspend = async (id: string) => {
    const ok = await confirm({
      title: isRTL ? 'تعليق الحساب' : 'Suspend Account',
      message: isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
      confirmLabel: isRTL ? 'تعليق' : 'Suspend',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.suspendUser(id);
      showToast(isRTL ? 'تم التعليق' : 'Suspended', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await adminAPI.activateUser(id);
      showToast(isRTL ? 'تم التفعيل' : 'Activated', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: isRTL ? 'حذف المستخدم' : 'Delete User',
      message: isRTL ? `حذف ${name} وجميع بياناته؟` : `Delete ${name} and all related data?`,
      confirmLabel: isRTL ? 'حذف' : 'Delete',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deleteUser(id);
      showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const filterLabels = {
    all: isRTL ? 'الكل' : 'All',
    active: isRTL ? 'نشط' : 'Active',
    suspended: isRTL ? 'معلق' : 'Suspended',
  };

  return (
    <div>
      <AdminPageHeader title={isRTL ? 'إدارة المستخدمين' : 'Users Management'} icon={Users} />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <AdminFilterTabs filters={['all', 'active', 'suspended'] as const} active={filter} onChange={setFilter} labels={filterLabels} />
        <AdminSearchBar value={search} onChange={setSearch} placeholder={isRTL ? 'بحث...' : 'Search...'} isRTL={isRTL} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <motion.div
              key={u.id}
              className={`bg-white rounded-2xl border p-4 ${u.expiringSoon ? 'border-tz-red/30' : 'border-tz-cream-dark'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{u.name}</p>
                    {u.isSuspended && <Badge variant="alert">{isRTL ? 'معلق' : 'Suspended'}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'التسجيل:' : 'Joined:'} {new Date(u.createdAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    {u.lastLoginAt && ` · ${isRTL ? 'آخر دخول:' : 'Last login:'} ${new Date(u.lastLoginAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/users/${u.id}`}>
                    <Button variant="outline" size="sm"><Eye className="w-4 h-4 me-1" />{isRTL ? 'عرض' : 'View'}</Button>
                  </Link>
                  {u.isSuspended ? (
                    <Button variant="outline" size="sm" onClick={() => handleActivate(u.id)}>
                      <CheckCircle className="w-4 h-4 me-1 text-tz-green" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleSuspend(u.id)}>
                      <Ban className="w-4 h-4 me-1 text-tz-amber" />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => handleDelete(u.id, u.name)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
