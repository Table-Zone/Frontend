'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, workspaceAPI } from '@/lib/api';
import LoginPromo from '@/components/auth/LoginPromo';

// Land on the product the workspace is subscribed to (QR-only owners go to the menu designer)
async function resolveLandingPath(userId: string, lastSlug: string | null): Promise<string> {
  try {
    const res = await workspaceAPI.getMyWorkspace(lastSlug || undefined);
    const ws = res.data?.data?.workspace;
    if (ws) {
      const features: string[] = ws.subscription?.features || [];
      const qrOnly = features.includes('qrcode') && !features.includes('tables');
      const base = qrOnly && ws.ownerId === userId ? '/menu-design' : '/dashboard';
      const slug = ws.slug || lastSlug;
      return slug ? `${base}?workspaceSlug=${encodeURIComponent(slug)}` : base;
    }
  } catch {
    // fall through to the default landing
  }
  return lastSlug ? `/dashboard?workspaceSlug=${encodeURIComponent(lastSlug)}` : '/dashboard';
}

function LoginForm() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    setResendSuccess(false);
    try {
      await authAPI.resendVerification(unverifiedEmail);
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('[Login] Submitting...', form.email);

    try {
      const user = await login(form.email, form.password);
      console.log('[Login] Success — redirecting');
      if (redirect) {
        router.push(redirect);
      } else if (user.role === 'admin') {
        router.push('/admin');
      } else {
        const lastSlug = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceSlug') : null;
        if (lastSlug || user.hasWorkspace) {
          router.push(await resolveLandingPath(user.id, lastSlug));
        } else {
          router.push('/create-workspace');
        }
      }
    } catch (err: any) {
      console.error('[Login] Error:', err);
      const msg = err.response?.data?.error?.message || t.error;
      const code = err.response?.data?.error?.code;
      if (code === 'EMAIL_NOT_VERIFIED' || msg === 'Email not verified') {
        setUnverifiedEmail(form.email);
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_0.95fr]">
      <LoginPromo />

      <main className="flex flex-col items-center justify-center p-6 sm:p-12 bg-gradient-to-b from-white to-tz-cream">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[404px]"
        >
          <form onSubmit={handleSubmit}>
            <h1 className="text-[34px] font-extrabold tracking-tight text-tz-espresso">{t.login}</h1>
            <p className="text-[15px] text-muted-foreground mt-2 mb-8">{t.loginSubtitle}</p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold text-center">
                {error}
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="block mx-auto mt-2 text-xs font-bold underline hover:no-underline"
                  >
                    {resending ? 'Sending...' : resendSuccess ? 'Sent! Check your email' : 'Resend verification email'}
                  </button>
                )}
              </div>
            )}

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
                  autoComplete="username"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="ps-11 h-12 rounded-xl bg-white focus-visible:ring-tz-primary/20 focus-visible:border-tz-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-1.5">
              <label htmlFor="password" className="block text-[13px] font-bold text-tz-espresso mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 start-3.5 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
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

            <div className="flex justify-end mb-6">
              <Link href="/forgot-password" className="text-[13.5px] font-bold text-tz-primary hover:text-tz-primary-dark">
                {t.forgotPassword}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-[52px] rounded-xl bg-tz-primary hover:bg-tz-primary-dark text-white text-base font-extrabold shadow-[0_12px_24px_rgba(199,91,18,0.3)]"
              disabled={isLoading}
            >
              {isLoading ? t.loading : t.login}
            </Button>

            <p className="text-sm text-muted-foreground text-center mt-6">
              {t.noAccount}{' '}
              <Link
                href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
                className="text-tz-primary hover:text-tz-primary-dark font-extrabold"
              >
                {t.register}
              </Link>
            </p>
          </form>
        </motion.div>

        <div className="w-full max-w-[404px] mt-8 pt-5 border-t border-tz-espresso/10 flex items-center justify-center gap-2 flex-wrap text-[12.5px] font-semibold text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">{t.landing.footerPrivacy}</Link>
          <span className="opacity-40">•</span>
          <Link href="/terms" className="hover:text-foreground">{t.landing.footerTerms}</Link>
          <span className="opacity-40">•</span>
          <span>© 2026 {t.appName}</span>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
