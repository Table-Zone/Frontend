'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Megaphone, LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { marketerAPI, MARKETER_TOKEN_KEY } from '@/lib/marketer-api';

interface MarketerProfile {
  id: string;
  name: string;
  email: string;
  commissionPercent: number;
}

export default function MarketerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [profile, setProfile] = useState<MarketerProfile | null>(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/marketer/login';
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await marketerAPI.getMe();
        if (active) setProfile(res.data.data);
      } catch {
        if (active) router.replace('/marketer/login');
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isLoginPage, router]);

  const logout = () => {
    localStorage.removeItem(MARKETER_TOKEN_KEY);
    router.replace('/marketer/login');
  };

  // Login page renders on its own, no chrome / no guard
  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tz-cream">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    );
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-tz-cream">
      <header className="bg-white border-b border-tz-cream-dark">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-tz-primary/10">
              <Megaphone className="w-5 h-5 text-tz-primary" />
            </div>
            <div>
              <p className="font-bold text-tz-espresso leading-tight">
                {profile?.name ?? t('المسوّق', 'Marketer')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('بوابة المسوّقين', 'Marketer Portal')}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('خروج', 'Log out')}
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
