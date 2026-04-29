'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Coffee, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

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
        if (lastSlug) {
          router.push(`/dashboard?workspaceSlug=${encodeURIComponent(lastSlug)}`);
        } else if (user.hasWorkspace) {
          router.push('/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-tz-cream-dark">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tz-primary/10 mb-4">
              <Coffee className="w-8 h-8 text-tz-primary" />
            </div>
            <h1 className="text-2xl font-bold text-tz-espresso">{t.login}</h1>
            <p className="text-muted-foreground mt-1">{t.appName}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder={t.email}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="ps-10 h-12"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.password}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="px-10 h-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white text-base"
              disabled={isLoading}
            >
              {isLoading ? t.loading : t.login}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-tz-primary hover:underline block">
              {t.forgotPassword}
            </Link>
            <p className="text-sm text-muted-foreground">
              {t.noAccount}{' '}
              <Link href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} className="text-tz-primary hover:underline font-medium">
                {t.register}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
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
