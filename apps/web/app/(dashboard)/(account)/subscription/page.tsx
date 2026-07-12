'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CreditCard, Check, Clock, AlertTriangle, Users,
  Plus, Minus, Upload, ArrowRight, Building2, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/shared/Toast';
import { subscriptionAPI, workspaceAPI } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  priceSar: number;
  baseStaffSeats: number;
  durationDays: number;
  extraStaffSeatPriceSar: number;
  features: string;
}

interface Subscription {
  status: string;
  plan: string;
  planLabelAr?: string;
  planLabelEn?: string;
  isTrial?: boolean;
  trialDays?: number | null;
  expiresAt: string | null;
  daysRemaining?: number | null;
  totalStaffSeats: number;
  extraStaffSeats: number;
}

interface Request {
  id: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  receiptImageUrl: string | null;
  type: string;
  extraSeatsCount: number;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { t, isRTL, lang } = useLanguage();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [lastRequest, setLastRequest] = useState<Request | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [workspaceId, setWorkspaceId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly');

  // Subscribe flow state
  const [step, setStep] = useState<'view' | 'payment' | 'success'>('view');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [requestId, setRequestId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankReference, setBankReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extra seats state
  const [extraSeatsCount, setExtraSeatsCount] = useState(1);
  const [showExtraSeats, setShowExtraSeats] = useState(false);
  const [extraSeatsRequestId, setExtraSeatsRequestId] = useState('');
  const [extraSeatsStep, setExtraSeatsStep] = useState<'count' | 'payment' | 'success'>('count');
  const { showToast } = useToast();

  // Extra seat price comes from backend plans (all plans share the same price)
  const extraSeatPrice = plans[0]?.extraStaffSeatPriceSar || 50;

  useEffect(() => {
    const load = async () => {
      try {
        const storedSlug = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceSlug') : null;
        const wsRes = await workspaceAPI.getMyWorkspace(storedSlug || undefined);
        const ws = wsRes.data.data.workspace;
        setWorkspaceId(ws.id);
        setSubscription(ws.subscription);

        const [plansRes, bankRes, reqRes] = await Promise.all([
          subscriptionAPI.getPlans(),
          subscriptionAPI.getBankDetails(),
          subscriptionAPI.getRequests(ws.id),
        ]);
        setPlans(plansRes.data.data.plans || []);
        setBankDetails(bankRes.data.data);
        const allRequests = reqRes.data.data.requests || [];
        const last = allRequests[0] || null;
        setLastRequest(last);
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
  }, [t.error, router]);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setReceiptFile(null);
    setBankReference('');
    setError('');
    setStep('payment');
  };

  const handleSubmitSubscription = async () => {
    if (!receiptFile || !selectedPlan) return;
    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('planId', selectedPlan.id);
      formData.append('receipt', receiptFile);
      if (bankReference) formData.append('bankReference', bankReference);
      const res = await subscriptionAPI.requestSubscription(workspaceId, formData);
      setRequestId(res.data.data.requestId);
      setStep('success');
      showToast(isRTL ? 'تم إرسال الطلب بنجاح' : 'Request submitted successfully', 'success');
      const reqRes = await subscriptionAPI.getRequests(workspaceId);
      const allRequests = reqRes.data.data.requests || [];
      setLastRequest(allRequests[0] || null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestExtraSeats = () => {
    if (extraSeatsCount < 1) return;
    setReceiptFile(null);
    setBankReference('');
    setError('');
    setExtraSeatsStep('payment');
  };

  const handleSubmitExtraSeats = async () => {
    if (!receiptFile) return;
    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('count', String(extraSeatsCount));
      formData.append('receipt', receiptFile);
      if (bankReference) formData.append('bankReference', bankReference);
      const res = await subscriptionAPI.requestExtraSeats(workspaceId, formData);
      setExtraSeatsRequestId(res.data.data.requestId);
      setExtraSeatsStep('success');
      showToast(isRTL ? 'تم إرسال طلب المقاعد بنجاح' : 'Extra seats request submitted', 'success');
      const reqRes = await subscriptionAPI.getRequests(workspaceId);
      const allRequests = reqRes.data.data.requests || [];
      setLastRequest(allRequests[0] || null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetFlow = () => {
    setStep('view');
    setSelectedPlan(null);
    setRequestId('');
    setReceiptFile(null);
    setBankReference('');
    setShowExtraSeats(false);
    setExtraSeatsRequestId('');
    setExtraSeatsStep('count');
    setExtraSeatsCount(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-tz-green/10 text-tz-green',
    trial: 'bg-tz-blue/10 text-tz-blue',
    grace: 'bg-tz-amber/10 text-tz-amber',
    lapsed: 'bg-tz-red/10 text-tz-red',
    cancelled: 'bg-gray-100 text-gray-500',
    pending: 'bg-tz-blue/10 text-tz-blue',
  };

  const statusLabels: Record<string, string> = {
    active: t.active,
    trial: isRTL ? 'تجربة مجانية' : 'Free Trial',
    grace: isRTL ? 'فترة سماح' : 'Grace',
    lapsed: t.lapsed,
    cancelled: isRTL ? 'ملغى' : 'Cancelled',
    pending: t.pending,
  };

  const planLabel = subscription
    ? (isRTL ? subscription.planLabelAr : subscription.planLabelEn) ||
      (subscription.plan === 'monthly' ? t.monthly : subscription.plan === 'trial' ? (isRTL ? 'تجربة مجانية' : 'Free Trial') : t.quarterly)
    : '';


  const ArrowIcon = isRTL ? ArrowRight : ArrowRight;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-tz-primary" />
        </div>
        <h1 className="text-2xl font-bold text-tz-espresso dark:text-white">{t.subscription}</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-tz-red/10 border border-tz-red/20 text-tz-red text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Active / Trial Subscription Banner */}
      {subscription?.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-tz-green/10 border border-tz-green/20 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-tz-green flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-tz-green">
              {isRTL ? 'الاشتراك نشط' : 'Subscription Active'}
            </p>
            <p className="text-sm text-tz-green/70">
              {isRTL
                ? `الخطة: ${planLabel} · ${subscription.totalStaffSeats} مقاعد`
                : `Plan: ${planLabel} · ${subscription.totalStaffSeats} seats`}
            </p>
          </div>
        </motion.div>
      )}

      {subscription?.status === 'trial' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-tz-blue/10 border border-tz-blue/20 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-tz-blue flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-tz-blue">
              {isRTL ? 'أنت على خطة تجريبية' : 'You are on a free trial'}
            </p>
            <p className="text-sm text-tz-blue/70">
              {isRTL
                ? `تجربة مجانية لمدة 7 أيام · ${subscription.daysRemaining ?? 0} ${subscription.daysRemaining === 1 ? 'يوم متبقي' : 'أيام متبقية'}`
                : `7-day free trial · ${subscription.daysRemaining ?? 0} day${subscription.daysRemaining === 1 ? '' : 's'} left`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-700 mb-6">
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
              <span className="font-medium">{planLabel}</span>
            </div>

            {subscription.isTrial && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'مدة التجربة' : 'Trial duration'}</span>
                <span className="font-medium">{isRTL ? '7 أيام' : '7 days'}</span>
              </div>
            )}

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
                  {subscription.isTrial ? (isRTL ? 'تنتهي التجربة' : 'Trial ends') : (isRTL ? 'تاريخ الانتهاء' : 'Expires')}
                </span>
                <span className="font-medium">{new Date(subscription.expiresAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
            )}

            {subscription.isTrial && subscription.daysRemaining != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isRTL ? 'الأيام المتبقية' : 'Days remaining'}</span>
                <span className={`font-bold ${subscription.daysRemaining <= 2 ? 'text-tz-red' : 'text-tz-blue'}`}>
                  {subscription.daysRemaining} {isRTL ? 'يوم' : 'days'}
                </span>
              </div>
            )}

            {/* Add Extra Seats Button */}
            {subscription.status === 'active' && (
              <div className="pt-4 border-t border-tz-cream-dark dark:border-gray-700">
                {!showExtraSeats ? (
                  <Button
                    onClick={() => setShowExtraSeats(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'شراء مقاعد إضافية' : 'Buy Extra Seats'}
                  </Button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    {extraSeatsStep === 'count' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{isRTL ? 'عدد المقاعد الإضافية' : 'Extra Seats'}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setExtraSeatsCount(Math.max(1, extraSeatsCount - 1))}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-tz-cream dark:hover:bg-gray-800"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-6 text-center">{extraSeatsCount}</span>
                            <button
                              onClick={() => setExtraSeatsCount(extraSeatsCount + 1)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-tz-cream dark:hover:bg-gray-800"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-tz-primary/5 border border-tz-primary/20">
                          <p className="text-sm font-medium text-tz-primary">
                            {isRTL
                              ? `المبلغ المطلوب: ${extraSeatsCount * extraSeatPrice} ر.س`
                              : `Total: ${extraSeatsCount * extraSeatPrice} SAR`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowExtraSeats(false)} className="flex-1">
                            {t.cancel}
                          </Button>
                          <Button
                            onClick={handleRequestExtraSeats}
                            disabled={isSubmitting}
                            className="flex-1 bg-tz-primary hover:bg-tz-primary-dark text-white"
                          >
                            {isSubmitting ? t.loading : isRTL ? 'متابعة الدفع' : 'Continue to Payment'}
                          </Button>
                        </div>
                      </>
                    )}

                    {extraSeatsStep === 'payment' && bankDetails && (
                      <PaymentFormStep
                        bankDetails={bankDetails}
                        amount={extraSeatsCount * extraSeatPrice}
                        receiptFile={receiptFile}
                        setReceiptFile={setReceiptFile}
                        bankReference={bankReference}
                        setBankReference={setBankReference}
                        onSubmit={handleSubmitExtraSeats}
                        onCancel={() => setShowExtraSeats(false)}
                        isSubmitting={isSubmitting}
                        isRTL={isRTL}
                        t={t}
                      />
                    )}

                    {extraSeatsStep === 'success' && (
                      <SuccessStep
                        message={isRTL ? 'تم إرسال الطلب. سيتم تفعيل المقاعد قريباً.' : 'Request submitted. Seats will be activated soon.'}
                        onClose={() => { setShowExtraSeats(false); resetFlow(); }}
                        isRTL={isRTL}
                      />
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              {isRTL ? 'لا يوجد اشتراك نشط' : 'No active subscription'}
            </p>
          </div>
        )}
      </div>

      {/* Plans (for new subscription, renewal, or upgrade from trial) */}
      {(!subscription || subscription.status !== 'active') && step === 'view' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-700 mb-6">
          <h2 className="text-lg font-bold mb-1">
            {subscription?.status === 'trial'
              ? (isRTL ? 'خطط الاشتراك' : 'Subscription Plans')
              : (isRTL ? 'الخطط المتاحة' : 'Available Plans')}
          </h2>
          {subscription?.status === 'trial' && (
            <p className="text-sm text-muted-foreground mb-4">
              {isRTL
                ? 'يمكنك الاشتراك في أي وقت قبل انتهاء التجربة المجانية'
                : 'You can subscribe anytime before your free trial ends'}
            </p>
          )}

          {/* Billing Period Toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center bg-tz-cream dark:bg-gray-800 rounded-2xl p-1.5 border border-tz-cream-dark dark:border-gray-700">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  billingPeriod === 'monthly'
                    ? 'bg-tz-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isRTL ? 'شهري' : 'Monthly'}
              </button>
              <button
                onClick={() => setBillingPeriod('quarterly')}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  billingPeriod === 'quarterly'
                    ? 'bg-tz-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isRTL ? '3 أشهر' : 'Quarterly'}
              </button>
            </div>
          </div>

          {/* Filtered Plans */}
          {(() => {
            const tablesPlan = plans.find((p) => p.name === `${billingPeriod}-tables`);
            const qrcodePlan = plans.find((p) => p.name === `${billingPeriod}-qrcode`);
            const tablesFeatures = isRTL
              ? ['مؤقتات ذكية للطاولات', 'تتبع حالة الطاولات', 'تنبيهات وقت الاستخدام', 'مقعد موظف واحد', 'دعم فني']
              : ['Smart table timers', 'Track table status', 'Usage time alerts', '1 staff seat', 'Technical support'];
            const qrcodeFeatures = isRTL
              ? ['كل مميزات خطة الطاولات', 'قائمة رقمية بتصميم QR', '4 قوالب تصميم جاهزة', 'تخصيص الألوان والشعار', 'إدارة المنتجات والتصنيفات', 'مقعد موظف واحد', 'دعم فني']
              : ['All Table Management features', 'Digital QR menu', '4 ready-made templates', 'Customize colors & logo', 'Manage products & categories', '1 staff seat', 'Technical support'];

            return (
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Tables Only */}
                {tablesPlan && (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative rounded-2xl border-2 border-tz-cream-dark dark:border-gray-700 bg-white dark:bg-gray-800 p-5 flex flex-col"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-lg">{isRTL ? 'إدارة الطاولات' : 'Table Management'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'مؤقتات ذكية وتنظيم الطاولات' : 'Smart timers & table organization'}
                      </p>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold text-tz-espresso dark:text-white">{tablesPlan.priceSar}</span>
                      <span className="text-sm text-muted-foreground"> {isRTL ? 'ر.س' : 'SAR'}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRTL ? `لمدة ${tablesPlan.durationDays} يوم` : `For ${tablesPlan.durationDays} days`}
                      </p>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {tablesFeatures.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-tz-espresso dark:text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-tz-green shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan(tablesPlan)}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full"
                    >
                      {isSubmitting ? t.loading : isRTL ? 'اشترك الآن' : 'Subscribe'}
                    </Button>
                  </motion.div>
                )}

                {/* Tables + QR */}
                {qrcodePlan && (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative rounded-2xl border-2 border-tz-primary bg-tz-primary/5 dark:bg-tz-primary/10 p-5 flex flex-col"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-tz-primary text-white text-xs font-bold">
                      {isRTL ? 'الأكثر شيوعاً' : 'Most Popular'}
                    </div>
                    <div className="mb-4">
                      <h3 className="font-bold text-lg">{isRTL ? 'الطاولات + قائمة QR' : 'Tables + QR Menu'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'كل شيء في خطة الطاولات + قائمة رقمية' : 'Everything in Tables + digital menu'}
                      </p>
                    </div>
                    <div className="mb-4">
                      <span className="text-3xl font-extrabold text-tz-primary">{qrcodePlan.priceSar}</span>
                      <span className="text-sm text-muted-foreground"> {isRTL ? 'ر.س' : 'SAR'}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRTL ? `لمدة ${qrcodePlan.durationDays} يوم` : `For ${qrcodePlan.durationDays} days`}
                      </p>
                    </div>
                    <ul className="space-y-2 mb-5 flex-1">
                      {qrcodeFeatures.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-tz-espresso dark:text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-tz-green shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handleSelectPlan(qrcodePlan)}
                      disabled={isSubmitting}
                      className="w-full bg-tz-primary hover:bg-tz-primary-dark text-white"
                    >
                      {isSubmitting ? t.loading : isRTL ? 'اشترك الآن' : 'Subscribe'}
                    </Button>
                  </motion.div>
                )}
              </div>
            );
          })()}

          {plans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? 'لا توجد خطط متاحة' : 'No plans available'}
            </div>
          )}
        </div>
      )}

      {/* Subscribe payment form */}
      {step === 'payment' && bankDetails && selectedPlan && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-700 mb-6">
          <h2 className="text-lg font-bold mb-4">
            {isRTL ? `إتمام الاشتراك - ${selectedPlan.labelAr}` : `Complete Subscription - ${selectedPlan.labelEn}`}
          </h2>
          <PaymentFormStep
            bankDetails={bankDetails}
            amount={selectedPlan.priceSar}
            receiptFile={receiptFile}
            setReceiptFile={setReceiptFile}
            bankReference={bankReference}
            setBankReference={setBankReference}
            onSubmit={handleSubmitSubscription}
            onCancel={resetFlow}
            isSubmitting={isSubmitting}
            isRTL={isRTL}
            t={t}
          />
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-700 mb-6">
          <SuccessStep
            message={isRTL ? 'تم إرسال الطلب. سيتم تفعيل الاشتراك قريباً.' : 'Request submitted. Subscription will be activated soon.'}
            onClose={resetFlow}
            isRTL={isRTL}
          />
        </div>
      )}


    </div>
  );
}

// Combined payment form: bank details + receipt upload + reference + submit
function PaymentFormStep({ bankDetails, amount, receiptFile, setReceiptFile, bankReference, setBankReference, onSubmit, onCancel, isSubmitting, isRTL, t }: any) {
  return (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="bg-tz-cream dark:bg-gray-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <Building2 className="w-5 h-5 text-tz-primary" />
          <div>
            <p className="text-xs text-muted-foreground">{isRTL ? 'البنك' : 'Bank'}</p>
            <p className="font-medium">{bankDetails.bankName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-tz-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{isRTL ? 'اسم الحساب' : 'Account Holder'}</p>
            <p className="font-medium">{bankDetails.accountName}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(bankDetails.accountName)}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-tz-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{isRTL ? 'رقم الحساب' : 'Account Number'}</p>
            <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(bankDetails.accountNumber)}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-tz-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">IBAN</p>
            <p className="font-medium font-mono text-sm">{bankDetails.iban}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(bankDetails.iban)}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-tz-primary/5 rounded-2xl p-4 border border-tz-primary/20">
        <p className="text-sm font-medium text-tz-primary">
          {isRTL
            ? `يرجى تحويل ${amount} ر.س إلى الحساب أعلاه، ثم رفع الإيصال`
            : `Please transfer ${amount} SAR to the account above, then upload the receipt`}
        </p>
      </div>

      {/* Receipt Upload */}
      <div className="border-2 border-dashed border-tz-cream-dark dark:border-gray-700 rounded-2xl p-8 text-center hover:border-tz-primary/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
          className="hidden"
          id="receipt-upload"
        />
        <label htmlFor="receipt-upload" className="cursor-pointer">
          {receiptFile ? (
            <div className="space-y-2">
              <Check className="w-8 h-8 text-tz-green mx-auto" />
              <p className="text-sm font-medium">{receiptFile.name}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'اضغط لرفع صورة الإيصال' : 'Click to upload receipt image'}
              </p>
            </div>
          )}
        </label>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">
          {isRTL ? 'رقم المرجع (اختياري)' : 'Reference Number (optional)'}
        </label>
        <input
          type="text"
          value={bankReference}
          onChange={(e) => setBankReference(e.target.value)}
          className="w-full h-12 px-4 rounded-xl border-2 border-input bg-background"
          placeholder={isRTL ? 'رقم العملية' : 'Transaction number'}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
        <Button
          onClick={onSubmit}
          disabled={!receiptFile || isSubmitting}
          className="flex-1 bg-tz-primary hover:bg-tz-primary-dark text-white"
        >
          {isSubmitting ? t.loading : isRTL ? 'إرسال الطلب' : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
}

function SuccessStep({ message, onClose, isRTL }: any) {
  return (
    <div className="text-center py-8 space-y-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full bg-tz-green/10 flex items-center justify-center mx-auto"
      >
        <Check className="w-10 h-10 text-tz-green" />
      </motion.div>
      <h3 className="text-xl font-bold">{isRTL ? 'شكراً!' : 'Thank You!'}</h3>
      <p className="text-muted-foreground">{message}</p>
      <Button onClick={onClose} className="bg-tz-primary hover:bg-tz-primary-dark text-white">
        {isRTL ? 'إغلاق' : 'Close'}
      </Button>
    </div>
  );
}
