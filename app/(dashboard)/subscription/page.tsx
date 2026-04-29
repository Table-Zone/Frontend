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
}

interface Subscription {
  status: string;
  plan: string;
  expiresAt: string | null;
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

  // Subscribe flow state
  const [step, setStep] = useState<'view' | 'bank' | 'upload' | 'success'>('view');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [requestId, setRequestId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankReference, setBankReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extra seats state
  const [extraSeatsCount, setExtraSeatsCount] = useState(1);
  const [showExtraSeats, setShowExtraSeats] = useState(false);
  const [extraSeatsRequestId, setExtraSeatsRequestId] = useState('');
  const [extraSeatsStep, setExtraSeatsStep] = useState<'form' | 'bank' | 'upload' | 'success'>('form');

  // Receipt modal


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

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan);
    setError('');
    setIsSubmitting(true);
    try {
      const res = await subscriptionAPI.requestSubscription(workspaceId, plan.id);
      setRequestId(res.data.data.requestId);
      setStep('bank');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadReceipt = async () => {
    if (!receiptFile || !requestId) return;
    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      if (bankReference) formData.append('bankReference', bankReference);
      await subscriptionAPI.uploadReceipt(requestId, formData);
      setStep('success');
      const reqRes = await subscriptionAPI.getRequests(workspaceId);
      const allRequests = reqRes.data.data.requests || [];
      setLastRequest(allRequests[0] || null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestExtraSeats = async () => {
    if (extraSeatsCount < 1) return;
    setError('');
    setIsSubmitting(true);
    try {
      const res = await subscriptionAPI.requestExtraSeats(workspaceId, extraSeatsCount);
      setExtraSeatsRequestId(res.data.data.requestId);
      setExtraSeatsStep('bank');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to request extra seats');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadExtraSeatsReceipt = async () => {
    if (!receiptFile || !extraSeatsRequestId) return;
    setError('');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      if (bankReference) formData.append('bankReference', bankReference);
      await subscriptionAPI.uploadReceipt(extraSeatsRequestId, formData);
      setExtraSeatsStep('success');
      const reqRes = await subscriptionAPI.getRequests(workspaceId);
      const allRequests = reqRes.data.data.requests || [];
      setLastRequest(allRequests[0] || null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to upload receipt');
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
    setExtraSeatsStep('form');
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

  const ArrowIcon = isRTL ? ArrowRight : ArrowRight;

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

      {/* Active Subscription Banner */}
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
                ? `الخطة: ${subscription.plan === 'monthly' ? 'شهري' : 'ربع سنوي'} · ${subscription.totalStaffSeats} مقاعد`
                : `Plan: ${subscription.plan} · ${subscription.totalStaffSeats} seats`}
            </p>
          </div>
        </motion.div>
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

            {/* Add Extra Seats Button */}
            {subscription.status === 'active' && (
              <div className="pt-4 border-t border-tz-cream-dark">
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
                    {extraSeatsStep === 'form' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{isRTL ? 'عدد المقاعد الإضافية' : 'Extra Seats'}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setExtraSeatsCount(Math.max(1, extraSeatsCount - 1))}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-tz-cream"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-6 text-center">{extraSeatsCount}</span>
                            <button
                              onClick={() => setExtraSeatsCount(extraSeatsCount + 1)}
                              className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-tz-cream"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-tz-primary/5 border border-tz-primary/20">
                          <p className="text-sm font-medium text-tz-primary">
                            {isRTL
                              ? `المبلغ المطلوب: ${extraSeatsCount * 50} ر.س`
                              : `Total: ${extraSeatsCount * 50} SAR`}
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

                    {extraSeatsStep === 'bank' && bankDetails && (
                      <BankTransferStep
                        bankDetails={bankDetails}
                        amount={extraSeatsCount * 50}
                        onTransferred={() => setExtraSeatsStep('upload')}
                        onCancel={() => setShowExtraSeats(false)}
                        isRTL={isRTL}
                        copyToClipboard={copyToClipboard}
                      />
                    )}

                    {extraSeatsStep === 'upload' && (
                      <UploadReceiptStep
                        receiptFile={receiptFile}
                        setReceiptFile={setReceiptFile}
                        bankReference={bankReference}
                        setBankReference={setBankReference}
                        onUpload={handleUploadExtraSeatsReceipt}
                        onCancel={() => setShowExtraSeats(false)}
                        isSubmitting={isSubmitting}
                        isRTL={isRTL}
                        t={t}
                      />
                    )}

                    {extraSeatsStep === 'success' && (
                      <SuccessStep
                        message={isRTL ? 'تم رفع الإيصال. سيتم تفعيل المقاعد قريباً.' : 'Receipt uploaded. Seats will be activated soon.'}
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

      {/* Plans (for new subscription or renewal) */}
      {(!subscription || subscription.status !== 'active') && step === 'view' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark mb-6">
          <h2 className="text-lg font-bold mb-4">{isRTL ? 'الخطط المتاحة' : 'Available Plans'}</h2>

          <div className="space-y-3">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                className={`relative rounded-2xl border-2 p-5 transition-colors ${
                  selectedPlan?.id === plan.id
                    ? 'border-tz-primary bg-tz-primary/5'
                    : 'border-tz-cream-dark hover:border-tz-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{isRTL ? plan.labelAr : plan.labelEn}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.durationDays} {isRTL ? 'يوم' : 'days'} · {plan.baseStaffSeats} {t.staffSeats}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-tz-primary">{plan.priceSar}</p>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'ر.س' : 'SAR'}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-tz-primary hover:bg-tz-primary-dark text-white"
                >
                  {isSubmitting ? t.loading : isRTL ? 'اشترك الآن' : 'Subscribe'}
                </Button>
              </motion.div>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? 'لا توجد خطط متاحة' : 'No plans available'}
            </div>
          )}
        </div>
      )}

      {/* Subscribe flow steps */}
      {step === 'bank' && bankDetails && selectedPlan && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark mb-6">
          <BankTransferStep
            bankDetails={bankDetails}
            amount={selectedPlan.priceSar}
            onTransferred={() => setStep('upload')}
            onCancel={resetFlow}
            isRTL={isRTL}
            copyToClipboard={copyToClipboard}
          />
        </div>
      )}

      {step === 'upload' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark mb-6">
          <UploadReceiptStep
            receiptFile={receiptFile}
            setReceiptFile={setReceiptFile}
            bankReference={bankReference}
            setBankReference={setBankReference}
            onUpload={handleUploadReceipt}
            onCancel={resetFlow}
            isSubmitting={isSubmitting}
            isRTL={isRTL}
            t={t}
          />
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark mb-6">
          <SuccessStep
            message={isRTL ? 'تم رفع الإيصال. سيتم تفعيل الاشتراك قريباً.' : 'Receipt uploaded. Subscription will be activated soon.'}
            onClose={resetFlow}
            isRTL={isRTL}
          />
        </div>
      )}


    </div>
  );
}

// Sub-components
function BankTransferStep({ bankDetails, amount, onTransferred, onCancel, isRTL, copyToClipboard }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-tz-cream rounded-2xl p-5 space-y-3">
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
          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(bankDetails.accountName)}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-tz-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{isRTL ? 'رقم الحساب' : 'Account Number'}</p>
            <p className="font-medium font-mono">{bankDetails.accountNumber}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(bankDetails.accountNumber)}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-tz-primary" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">IBAN</p>
            <p className="font-medium font-mono text-sm">{bankDetails.iban}</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(bankDetails.iban)}>
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-tz-primary/5 rounded-2xl p-4 border border-tz-primary/20">
        <p className="text-sm font-medium text-tz-primary">
          {isRTL
            ? `يرجى تحويل ${amount} ر.س إلى الحساب أعلاه`
            : `Please transfer ${amount} SAR to the account above`}
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">{isRTL ? 'إلغاء' : 'Cancel'}</Button>
        <Button onClick={onTransferred} className="flex-1 bg-tz-primary hover:bg-tz-primary-dark text-white">
          {isRTL ? 'تم التحويل، لنرفع الإيصال' : 'Transferred, upload receipt'}
        </Button>
      </div>
    </div>
  );
}

function UploadReceiptStep({ receiptFile, setReceiptFile, bankReference, setBankReference, onUpload, onCancel, isSubmitting, isRTL, t }: any) {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-tz-cream-dark rounded-2xl p-8 text-center hover:border-tz-primary/50 transition-colors">
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
          onClick={onUpload}
          disabled={!receiptFile || isSubmitting}
          className="flex-1 bg-tz-primary hover:bg-tz-primary-dark text-white"
        >
          {isSubmitting ? t.loading : t.uploadReceipt}
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
