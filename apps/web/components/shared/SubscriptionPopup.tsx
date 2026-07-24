'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Check, Building2, Hash, CreditCard, UserCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { subscriptionAPI } from '@/lib/api';
import { getPlanBullets, extractPeriod, PERIOD_LABELS } from '@/lib/plan-utils';

interface Plan {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  priceSar: number;
  baseStaffSeats: number;
  durationDays: number;
  extraStaffSeatPriceSar: number;
  features: string[];
  texts?: {
    benefitsAr?: string[];
    benefitsEn?: string[];
  };
}

interface SubscriptionPopupProps {
  workspaceId: string;
  onClose: () => void;
}

export default function SubscriptionPopup({ workspaceId, onClose }: SubscriptionPopupProps) {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankReference, setBankReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [billingPeriod, setBillingPeriod] = useState<string>('monthly');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentOff: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);

  useEffect(() => {
    subscriptionAPI.getPlans().then((res) => {
      const fetched: Plan[] = res.data.data.plans;
      setPlans(fetched);
      if (fetched.length > 0) {
        setBillingPeriod(extractPeriod(fetched[0]));
      }
    });
    subscriptionAPI.getBankDetails().then((res) => {
      setBankDetails(res.data.data);
    });
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setReceiptFile(null);
    setBankReference('');
    setDiscountCode('');
    setAppliedDiscount(null);
    setDiscountError('');
    setError('');
    setStep('payment');
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountError('');
    setIsValidatingDiscount(true);
    try {
      const res = await subscriptionAPI.validateDiscountCode(discountCode.trim());
      setAppliedDiscount({ code: discountCode.trim().toUpperCase(), percentOff: res.data.data.percentOff });
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || (isRTL ? 'كود غير صالح' : 'Invalid discount code');
      setDiscountError(msg);
      setAppliedDiscount(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  const handleSubmit = async () => {
    if (!receiptFile || !selectedPlan) return;
    setError('');
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('planId', selectedPlan.id);
      formData.append('receipt', receiptFile);
      if (bankReference) formData.append('bankReference', bankReference);
      if (appliedDiscount) formData.append('discountCode', appliedDiscount.code);
      await subscriptionAPI.requestSubscription(workspaceId, formData);
      setStep('success');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to submit request';
      setError(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const billingPeriods = Array.from(new Set(plans.map((p) => extractPeriod(p))));
  const plansForPeriod = plans.filter((p) => extractPeriod(p) === billingPeriod);
  const mostPopularId = plansForPeriod.reduce<Plan | null>((best, p) => {
    if (!best) return p;
    if (p.features.length > best.features.length) return p;
    if (p.features.length === best.features.length && p.priceSar > best.priceSar) return p;
    return best;
  }, null)?.id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-tz-cream-dark">
          <h2 className="text-xl font-bold text-tz-espresso">
            {step === 'plans' && t.subscriptionRequired}
            {step === 'payment' && (isRTL ? 'إتمام الاشتراك' : 'Complete Subscription')}
            {step === 'success' && t.thanksForPurchase}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {step === 'plans' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm mb-4">
                {t.subscriptionRequiredDesc}
              </p>

              {/* Billing Period Toggle */}
              {billingPeriods.length > 1 && (
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center bg-tz-cream rounded-2xl p-1.5 border border-tz-cream-dark">
                    {billingPeriods.map((period) => {
                      const label = PERIOD_LABELS[period];
                      return (
                        <button
                          key={period}
                          onClick={() => setBillingPeriod(period)}
                          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                            billingPeriod === period
                              ? 'bg-tz-primary text-white shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {label ? (isRTL ? label.ar : label.en) : period}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Plan Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                {plansForPeriod.map((plan) => {
                  const isPopular = plan.id === mostPopularId;
                  const bullets = getPlanBullets(plan, isRTL);
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-colors flex flex-col ${
                        isPopular
                          ? 'border-tz-primary bg-tz-primary/5'
                          : 'border-tz-cream-dark hover:border-tz-primary/50'
                      }`}
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-tz-primary text-white text-xs font-bold">
                          {isRTL ? 'الأكثر شيوعاً' : 'Most Popular'}
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="font-bold text-lg">{isRTL ? plan.labelAr : plan.labelEn}</h3>
                      </div>
                      <div className="mb-4">
                        <span className={`text-3xl font-extrabold ${isPopular ? 'text-tz-primary' : 'text-tz-espresso'}`}>
                          {plan.priceSar}
                        </span>
                        <span className="text-sm text-muted-foreground"> {isRTL ? 'ر.س' : 'SAR'}</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isRTL ? `لمدة ${plan.durationDays} يوم` : `For ${plan.durationDays} days`}
                        </p>
                      </div>
                      <ul className="space-y-2 flex-1">
                        {bullets.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-tz-espresso">
                            <div className="w-1.5 h-1.5 rounded-full bg-tz-green shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>

              {plans.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {isRTL ? 'لا توجد خطط متاحة' : 'No plans available'}
                </div>
              )}
            </div>
          )}

          {step === 'payment' && bankDetails && selectedPlan && (
            <div className="space-y-6">
              {/* Bank Details */}
              <div className="bg-tz-cream rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-tz-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{isRTL ? 'البنك' : 'Bank'}</p>
                    <p className="font-medium">{bankDetails.bankName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UserCircle className="w-5 h-5 text-tz-primary" />
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
                {bankDetails.swift && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-5 h-5 text-tz-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{isRTL ? 'كود سويفت' : 'SWIFT'}</p>
                      <p className="font-medium font-mono text-sm">{bankDetails.swift}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(bankDetails.swift)}>
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Online payment coming soon notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800/50">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {isRTL
                    ? 'نعمل حالياً على توفير الدفع الإلكتروني، نعتذر عن الإزعاج. في الوقت الحالي يرجى التحويل البنكي.'
                    : "We're working on providing online payment — sorry for the inconvenience. For now, please pay by bank transfer."}
                </p>
              </div>

              {/* Discount Code */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  {isRTL ? 'كود الخصم (اختياري)' : 'Discount Code (optional)'}
                </label>
                {appliedDiscount ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-tz-green/10 border border-tz-green/30">
                    <Tag className="w-4 h-4 text-tz-green shrink-0" />
                    <span className="text-sm font-medium text-tz-green flex-1">
                      {appliedDiscount.code} — {appliedDiscount.percentOff}% {isRTL ? 'خصم' : 'off'}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setAppliedDiscount(null); setDiscountCode(''); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyDiscount()}
                      className="flex-1 h-10 px-3 rounded-xl border-2 border-input bg-background text-sm uppercase"
                      placeholder={isRTL ? 'أدخل الكود' : 'Enter code'}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-4 text-sm"
                      onClick={handleApplyDiscount}
                      disabled={!discountCode.trim() || isValidatingDiscount}
                    >
                      {isValidatingDiscount ? '...' : (isRTL ? 'تطبيق' : 'Apply')}
                    </Button>
                  </div>
                )}
                {discountError && (
                  <p className="text-xs text-red-500">{discountError}</p>
                )}
              </div>

              <div className="bg-tz-primary/5 rounded-2xl p-4 border border-tz-primary/20">
                {appliedDiscount ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{isRTL ? 'السعر الأصلي' : 'Original price'}</span>
                      <span className="line-through">{Number(selectedPlan.priceSar)} {isRTL ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-tz-green font-medium">
                      <span>{isRTL ? `خصم ${appliedDiscount.percentOff}%` : `${appliedDiscount.percentOff}% discount`}</span>
                      <span>- {(Number(selectedPlan.priceSar) * appliedDiscount.percentOff / 100).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="border-t border-tz-primary/20 pt-1 flex items-center justify-between font-bold text-tz-primary">
                      <span>{isRTL ? 'المبلغ المطلوب تحويله' : 'Amount to transfer'}</span>
                      <span>{(Number(selectedPlan.priceSar) * (1 - appliedDiscount.percentOff / 100)).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-tz-primary">
                    {isRTL
                      ? `يرجى تحويل ${selectedPlan.priceSar} ر.س إلى الحساب أعلاه، ثم رفع الإيصال`
                      : `Please transfer ${selectedPlan.priceSar} SAR to the account above, then upload the receipt`}
                  </p>
                )}
              </div>

              {/* Receipt Upload */}
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

              <Button
                className="w-full bg-tz-primary hover:bg-tz-primary-dark text-white h-12"
                onClick={handleSubmit}
                disabled={!receiptFile || isLoading}
              >
                {isLoading ? t.loading : (isRTL ? 'إرسال الطلب' : 'Submit Request')}
              </Button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-tz-green/10 flex items-center justify-center mx-auto"
              >
                <Check className="w-10 h-10 text-tz-green" />
              </motion.div>
              <h3 className="text-xl font-bold">{t.thanksForPurchase}</h3>
              <p className="text-muted-foreground">{t.subscriptionPending}</p>
              <Button
                className="bg-tz-primary hover:bg-tz-primary-dark text-white"
                onClick={onClose}
              >
                {t.close}
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
