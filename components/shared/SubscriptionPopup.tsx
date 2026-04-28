'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Check, ArrowLeft, ArrowRight, Building2, Hash, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { subscriptionAPI } from '@/lib/api';

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

interface SubscriptionPopupProps {
  workspaceId: string;
  onClose: () => void;
}

export default function SubscriptionPopup({ workspaceId, onClose }: SubscriptionPopupProps) {
  const { t, isRTL } = useLanguage();
  const [step, setStep] = useState<'plans' | 'bank' | 'upload' | 'success'>('plans');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [requestId, setRequestId] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [bankReference, setBankReference] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    subscriptionAPI.getPlans().then((res) => {
      setPlans(res.data.data.plans);
    });
    subscriptionAPI.getBankDetails().then((res) => {
      setBankDetails(res.data.data);
    });
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan);
    setIsLoading(true);
    try {
      const res = await subscriptionAPI.requestSubscription(workspaceId, plan.id);
      setRequestId(res.data.data.requestId);
      setStep('bank');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!receiptFile || !requestId) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      if (bankReference) formData.append('bankReference', bankReference);
      await subscriptionAPI.uploadReceipt(requestId, formData);
      setStep('success');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-tz-cream-dark">
          <h2 className="text-xl font-bold text-tz-espresso">
            {step === 'plans' && t.subscriptionRequired}
            {step === 'bank' && t.bankTransfer}
            {step === 'upload' && t.uploadReceipt}
            {step === 'success' && t.thanksForPurchase}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'plans' && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm mb-4">
                {t.subscriptionRequiredDesc}
              </p>
              {plans.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative rounded-2xl border-2 p-5 cursor-pointer transition-colors ${
                    selectedPlan?.id === plan.id
                      ? 'border-tz-primary bg-tz-primary/5'
                      : 'border-tz-cream-dark hover:border-tz-primary/50'
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        {isRTL ? plan.labelAr : plan.labelEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {plan.durationDays} {isRTL ? 'يوم' : 'days'} · {plan.baseStaffSeats} {t.staffSeats}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-tz-primary">{plan.priceSar}</p>
                      <p className="text-xs text-muted-foreground">{isRTL ? 'ر.س' : 'SAR'}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {step === 'bank' && bankDetails && (
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
                    ? `يرجى تحويل ${selectedPlan?.priceSar} ر.س إلى الحساب أعلاه`
                    : `Please transfer ${selectedPlan?.priceSar} SAR to the account above`}
                </p>
              </div>

              <Button
                className="w-full bg-tz-primary hover:bg-tz-primary-dark text-white h-12"
                onClick={() => setStep('upload')}
              >
                {isRTL ? 'تم التحويل، لنرفع الإيصال' : 'Transferred, upload receipt'}
                <ArrowIcon className="w-5 h-5 mr-2" />
              </Button>
            </div>
          )}

          {step === 'upload' && (
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

              <Button
                className="w-full bg-tz-primary hover:bg-tz-primary-dark text-white h-12"
                onClick={handleUpload}
                disabled={!receiptFile || isLoading}
              >
                {isLoading ? t.loading : t.uploadReceipt}
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
