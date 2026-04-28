'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Building2 } from 'lucide-react';
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

export default function RegisterPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', workspaceName: '' });

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
      });
      setShowVerifyModal(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tz-primary/10 mb-4">
              <User className="w-8 h-8 text-tz-primary" />
            </div>
            <h1 className="text-2xl font-bold text-tz-espresso">{t.register}</h1>
            <p className="text-muted-foreground mt-1">{t.appName}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t.name}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="ps-10 h-12"
                required
              />
            </div>

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

            <div className="relative">
              <Building2 className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder={t.workspaceName}
                value={form.workspaceName}
                onChange={(e) => setForm({ ...form, workspaceName: e.target.value })}
                className="ps-10 h-12"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white text-base"
              disabled={isLoading}
            >
              {isLoading ? t.loading : t.register}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t.haveAccount}{' '}
              <Link href="/login" className="text-tz-primary hover:underline font-medium">
                {t.login}
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="sm:rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-tz-green/10 flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-tz-green" />
            </div>
            <DialogTitle className="text-xl font-bold">
              {lang === 'ar' ? 'تم إنشاء الحساب بنجاح' : 'Account Created'}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {lang === 'ar'
                ? `تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول وبدء استخدام Table Zone.`
                : `Your account has been created successfully. You can now log in and start using Table Zone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-4">
            <Button
              onClick={() => {
                setShowVerifyModal(false);
                router.push('/login');
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
