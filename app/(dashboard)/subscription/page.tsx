'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Check, Clock, AlertTriangle, Users, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { subscriptionAPI, workspaceAPI } from '@/lib/api';

interface Subscription {
  status: string;
  plan: string;
  expiresAt: string | null;
  totalStaffSeats: number;
}

interface Request {
  id: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  receiptImageUrl: string | null;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { t, isRTL, lang } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const wsRes = await workspaceAPI.getMyWorkspace();
        const ws = wsRes.data.data.workspace;
        setSubscription(ws.subscription);

        const reqRes = await subscriptionAPI.getRequests(ws.id);
        setRequests(reqRes.data.data.requests || []);
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/create-workspace');
          return;
        }
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [t.error]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-tz-green/10 text-tz-green',
    grace: 'bg-tz-amber/10 text-tz-amber',
    lapsed: 'bg-tz-red/10 text-tz-red',
    cancelled: 'bg-gray-100 text-gray-500',
    pending: 'bg-tz-blue/10 text-tz-blue',
  };

  const statusLabels: Record<string, string> = {
    active: t.active,
    grace: isRTL ? 'فترة سماح' : 'Grace',
    lapsed: t.lapsed,
    cancelled: isRTL ? 'ملغى' : 'Cancelled',
    pending: t.pending,
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-tz-primary" />
        </div>
        <h1 className="text-2xl font-bold text-tz-espresso">{t.subscription}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-tz-red/10 border border-tz-red/20 text-tz-red text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Current Subscription */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark mb-6">
        <h2 className="text-lg font-bold mb-4">{isRTL ? 'الاشتراك الحالي' : 'Current Subscription'}</h2>

        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[subscription.status] || 'bg-gray-100 text-gray-500'}`}>
                {statusLabels[subscription.status] || subscription.status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t.plan}</span>
              <span className="font-medium">{subscription.plan === 'monthly' ? t.monthly : t.quarterly}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {t.staffSeats}
              </span>
              <span className="font-medium">{subscription.totalStaffSeats}</span>
            </div>

            {subscription.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {isRTL ? 'تاريخ الانتهاء' : 'Expires'}
                </span>
                <span className="font-medium">{new Date(subscription.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'لا يوجد اشتراك نشط' : 'No active subscription'}
            </p>
            <Button className="bg-tz-primary hover:bg-tz-primary-dark text-white">
              {t.viewPlans}
            </Button>
          </div>
        )}
      </div>

      {/* Plans */}
      {(!subscription || subscription.status !== 'active') && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark mb-6">
          <h2 className="text-lg font-bold mb-4">{isRTL ? 'الخطط المتاحة' : 'Available Plans'}</h2>

          <div className="space-y-3">
            <PlanCard
              name={t.monthly}
              price="70"
              duration={isRTL ? '30 يوم' : '30 days'}
              features={[
                isRTL ? '1 مقعد موظف' : '1 staff seat',
                isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                isRTL ? 'دعم فني' : 'Support',
              ]}
              recommended={false}
            />
            <PlanCard
              name={t.quarterly}
              price="200"
              duration={isRTL ? '90 يوم' : '90 days'}
              features={[
                isRTL ? '1 مقعد موظف' : '1 staff seat',
                isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                isRTL ? 'دعم فني' : 'Support',
                isRTL ? 'توفير 10%' : 'Save 10%',
              ]}
              recommended={true}
            />
          </div>

          <div className="mt-4 p-4 rounded-xl bg-tz-cream text-sm text-muted-foreground">
            <p className="font-medium text-tz-espresso mb-1">
              {isRTL ? 'مقاعد إضافية:' : 'Extra seats:'}
            </p>
            {isRTL
              ? 'كل مقعد إضافي بـ 50 ريال (نفس طريقة الدفع).'
              : 'Each extra seat is 50 SAR (same payment method).'}
          </div>
        </div>
      )}

      {/* Request History */}
      {requests.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-tz-primary" />
            {isRTL ? 'سجل الطلبات' : 'Request History'}
          </h2>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 rounded-xl bg-tz-cream"
              >
                <div>
                  <p className="font-medium text-sm">{req.plan === 'monthly' ? t.monthly : t.quarterly}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[req.status]}`}>
                  {statusLabels[req.status] || req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanCard({ name, price, duration, features, recommended }: {
  name: string;
  price: string;
  duration: string;
  features: string[];
  recommended: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-5 border-2 transition-all ${
      recommended
        ? 'border-tz-primary bg-tz-primary/5'
        : 'border-tz-cream-dark hover:border-tz-primary/30'
    }`}>
      {recommended && (
        <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-tz-primary text-white text-xs font-bold">
          Recommended
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-xs text-muted-foreground">{duration}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-tz-primary">{price}</span>
          <span className="text-sm text-muted-foreground"> SAR</span>
        </div>
      </div>

      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-tz-green shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
