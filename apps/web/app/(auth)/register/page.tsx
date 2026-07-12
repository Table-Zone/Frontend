'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building2, Loader2, Ticket } from 'lucide-react';
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

function RegisterForm() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '', trialCode: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authAPI.register({
        name: form.name,
        email: form.email,
        password: form.password,
        workspaceName: form.workspaceName,
        trialCode: form.trialCode || undefined,
      });
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden">
      <LoginPromo />

      <main className="relative flex flex-col items-center justify-start lg:justify-center lg:pt-12 p-6 sm:px-12 sm:pb-12 bg-[linear-gradient(165deg,#FAF7F2_0%,#FAF5EE_52%,#F5ECDD_100%)]">
        {/* Brand header — mobile only (the promo panel carries the logo on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden flex flex-col items-center gap-2.5 mb-7"
        >
          <motion.span
            className="w-[46px] h-[46px] rounded-[13px] overflow-hidden shadow-[0_10px_22px_rgba(199,91,18,0.26)]"
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Image src="/logo.jpg" alt={t.appName} width={46} height={46} className="w-full h-full object-cover" />
          </motion.span>
          <span className="font-extrabold text-[19px] leading-none tracking-tight text-tz-espresso">
            {t.appName}
          </span>
        </motion.div>

        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } } }}
          initial="hidden"
          animate="show"
          className="relative z-10 w-full max-w-[404px]"
        >
          <motion.form
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            onSubmit={handleSubmit}
          >
            <h1 className="text-[34px] font-extrabold tracking-tight text-tz-espresso">{t.register}</h1>
            <p className="text-[15px] text-muted-foreground mt-2 mb-8">{t.registerSubtitle}</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold text-center">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-[13px] font-bold text-tz-espresso mb-2">
                {t.name}
              </label>
              <div className="relative">
                <User className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t.name}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="ps-11 h-12 rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-[13px] font-bold text-tz-espresso mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="ps-11 h-12 rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-4">
              <label htmlFor="password" className="block text-[13px] font-bold text-tz-espresso mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="ps-11 pe-11 h-12 rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Workspace name */}
            <div className="mb-4">
              <label htmlFor="workspaceName" className="block text-[13px] font-bold text-tz-espresso mb-2">
                {t.workspaceName}
              </label>
              <div className="relative">
                <Building2 className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder={t.workspaceName}
                  value={form.workspaceName}
                  onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                  className="ps-11 h-12 rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                  required
                />
              </div>
            </div>

            {/* Trial code */}
            <div className="mb-6">
              <label htmlFor="trialCode" className="block text-[13px] font-bold text-tz-espresso mb-2">
                {lang === 'ar' ? 'كود التجربة المجانية' : 'Trial code'}
                <span className="font-semibold text-muted-foreground"> ({lang === 'ar' ? 'اختياري' : 'optional'})</span>
              </label>
              <div className="relative">
                <Ticket className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="trialCode"
                  type="text"
                  placeholder={lang === 'ar' ? 'كود التجربة المجانية (اختياري)' : 'Trial code (optional)'}
                  value={form.trialCode}
                  onChange={(e) => setForm({ ...form, trialCode: e.target.value.toUpperCase() })}
                  className="ps-11 h-12 rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-[52px] rounded-xl bg-tz-primary hover:bg-tz-primary-dark text-white text-base font-extrabold shadow-[0_12px_24px_rgba(199,91,18,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? t.loading : t.register}
            </Button>

            <p className="text-sm text-muted-foreground text-center mt-6">
              {t.haveAccount}{' '}
              <Link
                href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
                className="text-tz-primary hover:text-tz-primary-dark font-extrabold"
              >
                {t.login}
              </Link>
            </p>
          </motion.form>
        </motion.div>

        <div className="relative z-10 w-full max-w-[404px] mt-auto lg:mt-8 pt-5 border-t border-tz-espresso/10 flex items-center justify-center gap-2 flex-wrap text-[12.5px] font-semibold text-muted-foreground">
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
              {lang === 'ar' ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {lang === 'ar'
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
              {lang === 'ar' ? 'حسناً' : 'OK'}
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
