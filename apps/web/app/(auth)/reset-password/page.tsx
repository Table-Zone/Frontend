'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { authAPI } from '@/lib/api';

function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ password: '', confirmPassword: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword({ token, password: form.password });
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-tz-cream-dark text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-tz-espresso mb-2">Password Updated</h1>
            <p className="text-muted-foreground">Your password has been reset successfully. Redirecting to login...</p>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-4">
              <Image src="/logo.jpg" alt="Table Zone" width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-tz-espresso">Reset Password</h1>
            <p className="text-muted-foreground mt-1">Enter your new password</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
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

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="px-10 h-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white text-base"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-tz-primary hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
