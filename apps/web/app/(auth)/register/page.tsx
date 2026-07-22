'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Loader2, Ticket, ArrowUp, CornerDownLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI } from '@/lib/api';
import LoginPromo from '@/components/auth/LoginPromo';

type StepKey = 'name' | 'email' | 'password' | 'trialCode';

function RegisterForm() {
  const { t, lang } = useLanguage();
  const ar = lang === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', trialCode: '' });

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const steps: {
    key: StepKey;
    icon: typeof User;
    type: 'text' | 'email' | 'password';
    question: string;
    hint?: string;
    placeholder: string;
    optional?: boolean;
    validate: (v: string) => string;
  }[] = [
    {
      key: 'name',
      icon: User,
      type: 'text',
      question: ar ? 'لنبدأ باسمك' : "Let's start with your name",
      hint: ar ? 'سيكون هذا اسم مساحة عملك أيضاً' : 'This will also be your workspace name',
      placeholder: ar ? 'اكتب اسمك هنا...' : 'Type your name here...',
      validate: (v) => (v.trim() ? '' : ar ? 'الرجاء إدخال اسمك' : 'Please enter your name'),
    },
    {
      key: 'email',
      icon: Mail,
      type: 'email',
      question: ar ? 'ما هو بريدك الإلكتروني؟' : 'What is your email?',
      hint: ar ? 'سنرسل لك رابط التأكيد على هذا البريد' : "We'll send your verification link here",
      placeholder: 'you@example.com',
      validate: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
          ? ''
          : ar
            ? 'الرجاء إدخال بريد إلكتروني صحيح'
            : 'Please enter a valid email',
    },
    {
      key: 'password',
      icon: Lock,
      type: 'password',
      question: ar ? 'اختر كلمة مرور' : 'Choose a password',
      hint: ar
        ? '٨ أحرف على الأقل، مع حرف كبير وصغير ورقم ورمز'
        : 'At least 8 characters, with upper & lower case, a number and a symbol',
      placeholder: '••••••••',
      validate: (v) => {
        if (v.length < 8) return ar ? 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل' : 'Password must be at least 8 characters';
        if (!/[a-z]/.test(v)) return ar ? 'يجب أن تحتوي على حرف صغير' : 'Must contain a lowercase letter';
        if (!/[A-Z]/.test(v)) return ar ? 'يجب أن تحتوي على حرف كبير' : 'Must contain an uppercase letter';
        if (!/[0-9]/.test(v)) return ar ? 'يجب أن تحتوي على رقم' : 'Must contain a number';
        if (!/[^a-zA-Z0-9]/.test(v)) return ar ? 'يجب أن تحتوي على رمز خاص' : 'Must contain a special character';
        return '';
      },
    },
    {
      key: 'trialCode',
      icon: Ticket,
      type: 'text',
      question: ar ? 'لنبدأ!' : "Let's get started!",
      hint: ar ? 'هل لديك كود إحالة؟ (اختياري)' : 'Do you have a referral code? (optional)',
      placeholder: ar ? 'كود الإحالة' : 'Referral code',
      optional: true,
      validate: () => '',
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const value = form[current.key];

  // Focus the active step's input on each transition.
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 260);
    return () => clearTimeout(id);
  }, [step]);

  const setValue = (v: string) => {
    setForm({ ...form, [current.key]: current.key === 'trialCode' ? v.toUpperCase() : v });
    if (error) setError('');
  };

  const goNext = async () => {
    const validationError = current.validate(value);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    if (isLast) {
      await submit();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setError('');
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const submit = async () => {
    setIsLoading(true);
    setError('');
    try {
      await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        workspaceName: form.name,
        trialCode: form.trialCode || undefined,
      });
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading) goNext();
    }
  };

  const StepIcon = current.icon;
  const progress = ((step + (value && !current.validate(value) ? 1 : 0)) / steps.length) * 100;

  return (
    <div className="relative min-h-screen grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden">
      <LoginPromo />

      <main className="relative flex flex-col items-center justify-start lg:justify-center lg:pt-12 p-6 sm:px-12 sm:pb-12 bg-[linear-gradient(165deg,#FAF7F2_0%,#FAF5EE_52%,#F5ECDD_100%)]">
        {/* progress bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-tz-espresso/[0.06]">
          <motion.div
            className="h-full bg-tz-primary"
            initial={false}
            animate={{ width: `${Math.max(progress, 4)}%` }}
            transition={{ type: 'spring', stiffness: 160, damping: 24 }}
          />
        </div>

        {/* Brand header — mobile only (the promo panel carries the logo on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex flex-col items-center gap-2.5 mb-7 mt-2"
        >
          <span className="w-[46px] h-[46px] rounded-[13px] overflow-hidden shadow-[0_10px_22px_rgba(199,91,18,0.26)]">
            <Image src="/logo.jpg" alt={t.appName} width={46} height={46} className="w-full h-full object-cover" />
          </span>
          <span className="font-extrabold text-[19px] leading-none tracking-tight text-tz-espresso">
            {t.appName}
          </span>
        </motion.div>

        <div className="relative z-10 w-full max-w-[440px]">
          {/* step counter */}
          <div className="flex items-center gap-2 mb-6 text-[13px] font-bold text-tz-primary">
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-md bg-tz-primary/10">
              {step + 1}
            </span>
            <span className="text-muted-foreground font-semibold">
              {ar ? `من ${steps.length}` : `of ${steps.length}`}
            </span>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.key}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 28 : -28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -28 : 28 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-[26px] sm:text-[30px] font-extrabold tracking-tight text-tz-espresso leading-snug">
                {current.question}
                {!current.optional && <span className="text-tz-primary"> *</span>}
              </h1>
              {current.hint && (
                <p className="text-[14.5px] text-muted-foreground mt-2.5">{current.hint}</p>
              )}

              <div className="relative mt-7">
                <StepIcon className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  ref={inputRef}
                  id={current.key}
                  type={current.type === 'password' ? (showPassword ? 'text' : 'password') : current.type}
                  inputMode={current.type === 'email' ? 'email' : undefined}
                  autoComplete={
                    current.key === 'name'
                      ? 'name'
                      : current.key === 'email'
                        ? 'email'
                        : current.key === 'password'
                          ? 'new-password'
                          : 'off'
                  }
                  placeholder={current.placeholder}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="ps-11 pe-11 h-14 text-lg rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                />
                {current.type === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>

              {error && (
                <p className="mt-3 text-sm font-semibold text-destructive">{error}</p>
              )}

              <div className="flex items-center gap-3 mt-6">
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={isLoading}
                  className="h-12 px-6 rounded-xl bg-tz-primary hover:bg-tz-primary-dark text-white text-base font-extrabold shadow-[0_12px_24px_rgba(199,91,18,0.3)] gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isLast ? (
                    <>
                      <Check className="w-5 h-5" />
                      {t.register}
                    </>
                  ) : (
                    ar ? 'التالي' : 'OK'
                  )}
                </Button>
                {!isLoading && (
                  <span className="hidden sm:flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground">
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    {ar ? 'اضغط Enter' : 'press Enter'}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* back + login */}
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-tz-espresso disabled:opacity-50"
              >
                <ArrowUp className="w-4 h-4" />
                {ar ? 'رجوع' : 'Back'}
              </button>
            ) : (
              <span />
            )}
            <p className="text-sm text-muted-foreground">
              {t.haveAccount}{' '}
              <Link
                href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
                className="text-tz-primary hover:text-tz-primary-dark font-extrabold"
              >
                {t.login}
              </Link>
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[440px] mt-auto lg:mt-10 pt-5 border-t border-tz-espresso/10 flex items-center justify-center gap-2 flex-wrap text-[12.5px] font-semibold text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">{t.landing.footerPrivacy}</Link>
          <span className="opacity-40">•</span>
          <Link href="/terms" className="hover:text-foreground">{t.landing.footerTerms}</Link>
          <span className="opacity-40">•</span>
          <span>© 2026 {t.appName}</span>
        </div>
      </main>

      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="sm:rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-tz-green/10 flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-tz-green" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {ar ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {ar
                ? `تم إنشاء حسابك. يرجى التحقق من بريدك الإلكتروني والضغط على رابط التأكيد قبل تسجيل الدخول.`
                : `Your account has been created. Please check your email and click the verification link before logging in.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={() => {
                setShowVerifyModal(false);
                router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
              }}
              className="bg-tz-primary hover:bg-tz-primary-dark text-white px-8"
            >
              {ar ? 'حسناً' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
