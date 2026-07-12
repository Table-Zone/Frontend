'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, CreditCard, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);

  useEffect(() => {
    setWorkspaceSlug(localStorage.getItem('currentWorkspaceSlug'));
  }, []);

  const isAdmin = user?.role === 'admin';

  const makeHref = (path: string) => {
    if (workspaceSlug && path !== '/profile') {
      return `${path}?workspaceSlug=${encodeURIComponent(workspaceSlug)}`;
    }
    return path;
  };

  const tabs = [
    { path: '/settings', label: t.settings, icon: Settings },
    ...(!isAdmin ? [{ path: '/subscription', label: t.subscription, icon: CreditCard }] : []),
    { path: '/profile', label: t.profile, icon: UserCircle },
  ];

  return (
    <div>
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex gap-1.5 p-1.5 bg-white dark:bg-gray-900 rounded-2xl border border-tz-cream-dark dark:border-gray-800 shadow-sm">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={makeHref(tab.path)}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-tz-primary text-white shadow-md shadow-tz-primary/25'
                    : 'text-muted-foreground hover:bg-tz-cream dark:hover:bg-gray-800 hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
