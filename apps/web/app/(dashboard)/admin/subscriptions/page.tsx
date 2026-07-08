'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { AdminFilterTabs } from '@/components/admin/AdminFilterTabs';

interface SubscriptionItem {
  userId: string;
  userName: string;
  userEmail: string;
  accountType: 'trial' | 'subscriber' | 'expired' | 'pending';
  plan: string;
  periodStart: string | null;
  periodEnd: string | null;
  daysRemaining: number | null;
  expiringSoon: boolean;
}

interface Stats {
  subscribers: number;
  trials: number;
  expired: number;
  expiringSoon: number;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  const [items, setItems] = useState<SubscriptionItem[]>([]);
  const [stats, setStats] = useState<Stats>({ subscribers: 0, trials: 0, expired: 0, expiringSoon: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'trial' | 'active' | 'expired' | 'expiring_soon'>('all');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subsRes, statsRes] = await Promise.all([
        adminAPI.getSubscriptions({
          search: search || undefined,
          filter: filter === 'all' ? undefined : filter,
          sortBy: 'period_end_asc',
          limit: 100,
        }),
        adminAPI.getSubscriptionStats(),
      ]);
      setItems(subsRes.data.data.subscriptions || []);
      setStats(statsRes.data.data.stats || { subscribers: 0, trials: 0, expired: 0, expiringSoon: 0 });
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [filter, user]);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const accountTypeLabel = (type: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      trial: { ar: 'تجربة مجانية', en: 'Free Trial' },
      subscriber: { ar: 'مشترك', en: 'Subscriber' },
      expired: { ar: 'منتهي', en: 'Expired' },
      pending: { ar: 'معلق', en: 'Pending' },
    };
    return isRTL ? labels[type]?.ar : labels[type]?.en;
  };

  const filterLabels = {
    all: isRTL ? 'الكل' : 'All',
    trial: isRTL ? 'تجارب' : 'Trials',
    active: isRTL ? 'نشطة' : 'Active',
    expired: isRTL ? 'منتهية' : 'Expired',
    expiring_soon: isRTL ? 'تنتهي قريبًا' : 'Expiring Soon',
  };

  return (
    <div>
      <AdminPageHeader
        title={isRTL ? 'إدارة الاشتراكات' : 'Subscriptions Management'}
        icon={CreditCard}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <AdminStatsCard label={isRTL ? 'المشتركين' : 'Subscribers'} count={stats.subscribers} icon={CreditCard} color="bg-tz-green/10 text-tz-green" delay={0} />
        <AdminStatsCard label={isRTL ? 'التجارب' : 'Trials'} count={stats.trials} icon={CreditCard} color="bg-tz-blue/10 text-tz-blue" delay={0.1} />
        <AdminStatsCard label={isRTL ? 'المنتهية' : 'Expired'} count={stats.expired} icon={CreditCard} color="bg-tz-red/10 text-tz-red" delay={0.2} />
        <AdminStatsCard label={isRTL ? 'تنتهي خلال 5 أيام' : 'Expiring in 5 days'} count={stats.expiringSoon} icon={AlertTriangle} color="bg-tz-amber/10 text-tz-amber" delay={0.3} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <AdminFilterTabs
          filters={['all', 'trial', 'active', 'expired', 'expiring_soon'] as const}
          active={filter}
          onChange={setFilter}
          labels={filterLabels}
        />
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder={isRTL ? 'بحث بالاسم أو البريد...' : 'Search by name or email...'}
          isRTL={isRTL}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <motion.div
              key={item.userId}
              className={`bg-white rounded-2xl border p-4 ${
                item.expiringSoon && item.accountType !== 'expired'
                  ? 'border-tz-red/50 bg-tz-red/5'
                  : 'border-tz-cream-dark'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-tz-espresso">{item.userName}</p>
                    <Badge variant={item.accountType === 'subscriber' ? 'free' : item.accountType === 'trial' ? 'occupied' : 'alert'}>
                      {accountTypeLabel(item.accountType)}
                    </Badge>
                    {item.expiringSoon && item.accountType !== 'expired' && (
                      <Badge variant="alert">{isRTL ? 'تنتهي قريبًا' : 'Expiring Soon'}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.userEmail}</p>
                  <p className="text-sm mt-1">{item.plan}</p>
                </div>
                <div className="text-sm text-end">
                  {item.periodStart && (
                    <p>{isRTL ? 'البداية:' : 'Start:'} {new Date(item.periodStart).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                  )}
                  {item.periodEnd && (
                    <p>{isRTL ? 'الانتهاء:' : 'End:'} {new Date(item.periodEnd).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}</p>
                  )}
                  {item.daysRemaining !== null && (
                    <p className={`font-semibold mt-1 ${item.expiringSoon ? 'text-tz-red' : ''}`}>
                      {item.daysRemaining} {isRTL ? 'يوم متبقي' : 'days left'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
