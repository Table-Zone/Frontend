'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Building2, Hash, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { workspaceAPI } from '@/lib/api';

export default function CreateWorkspacePage() {
  const { t, isRTL } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    tableCount: 6,
    redAlertMinutes: 5,
  });

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.hasWorkspace) {
        router.push('/dashboard');
      }
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const slug = form.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 30);

      await workspaceAPI.create({
        name: form.name,
        slug: slug + '-' + Date.now().toString(36).slice(-4),
        tableCount: form.tableCount,
        redAlertMinutes: form.redAlertMinutes,
        timezone: 'Asia/Riyadh',
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error('Create workspace error:', err);
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
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
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-4">
              <Image src="/logo.jpg" alt="Table Zone" width={64} height={64} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-tz-espresso">
              {t.createWorkspace}
            </h1>
            <p className="text-muted-foreground mt-1">{t.createWorkspaceDesc}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Workspace Name */}
            <div>
              <label className="block text-sm font-medium mb-2 text-tz-espresso">
                {t.workspaceName}
              </label>
              <div className="relative">
                <Building2 className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder={isRTL ? 'اسم المكان' : 'e.g. Dream Coffee'}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="ps-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Table Count */}
            <div>
              <label className="block text-sm font-medium mb-2 text-tz-espresso">
                {t.tableCount}
              </label>
              <div className="relative">
                <Hash className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.tableCount}
                  onChange={(e) =>
                    setForm({ ...form, tableCount: parseInt(e.target.value) || 1 })
                  }
                  className="ps-10 h-12"
                  required
                />
              </div>
            </div>

            {/* Red Alert Minutes */}
            <div>
              <label className="block text-sm font-medium mb-2 text-tz-espresso">
                {t.redAlertMinutes}
              </label>
              <div className="relative">
                <Clock className="absolute top-1/2 -translate-y-1/2 start-3 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={form.redAlertMinutes}
                  onChange={(e) =>
                    setForm({ ...form, redAlertMinutes: parseInt(e.target.value) || 1 })
                  }
                  className="ps-10 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white text-base"
              disabled={isLoading}
            >
              {isLoading ? t.loading : t.createWorkspaceButton}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
