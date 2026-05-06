'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Loader2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminAPI } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'totp'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [totpCode, setTotpCode] = useState('');
  const [tempToken, setTempToken] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await adminAPI.login({ email: form.email, password: form.password });
      const data = res.data.data;
      if (data.requiresTotp) {
        setTempToken(data.tempToken);
        setStep('totp');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await adminAPI.verifyTotp({ tempToken, code: totpCode });
      const { token } = res.data.data;
      localStorage.setItem('access_token', token);
      document.cookie = `access_token=${token}; path=/; max-age=86400`;
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid code');
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tz-espresso/10 mb-4">
              <Shield className="w-8 h-8 text-tz-espresso" />
            </div>
            <h1 className="text-2xl font-bold text-tz-espresso">Admin Login</h1>
            <p className="text-muted-foreground mt-1">Table Zone Administration</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center">
              {error}
            </div>
          )}

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Shield className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="email"
                  placeholder="Admin Email"
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
                  placeholder="Password"
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
                className="w-full h-12 bg-tz-espresso hover:bg-tz-espresso/90 text-white text-base"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleTotp} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  className="ps-10 h-12 text-center tracking-widest text-lg"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-tz-espresso hover:bg-tz-espresso/90 text-white text-base"
                disabled={isLoading || totpCode.length !== 6}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
              </Button>

              <button
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
