'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { marketerAPI, MARKETER_TOKEN_KEY } from '@/lib/marketer-api';

export default function MarketerLoginPage() {
  const { isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await marketerAPI.login({ email: form.email, password: form.password });
      const { token } = res.data.data;
      localStorage.setItem(MARKETER_TOKEN_KEY, token);
      window.location.href = '/marketer';
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('فشل تسجيل الدخول', 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-tz-cream-dark">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tz-primary/10 mb-4">
              <Megaphone className="w-8 h-8 text-tz-primary" />
            </div>
            <h1 className="text-2xl font-bold text-tz-espresso">
              {t('بوابة المسوّقين', 'Marketer Portal')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('تابع أكوادك وعمولاتك', 'Track your codes & commissions')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                placeholder={t('البريد الإلكتروني', 'Email')}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="ps-10 h-12"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t('كلمة المرور', 'Password')}
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
              className="w-full h-12 bg-tz-primary hover:bg-tz-primary/90 text-white text-base"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('دخول', 'Sign in')}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
