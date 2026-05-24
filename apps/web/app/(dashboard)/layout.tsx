'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Settings, Users, CreditCard, UserCircle,
  LogOut, Menu, X, ChevronLeft, ChevronRight, Shield, QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { workspaceAPI } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [planFeatures, setPlanFeatures] = useState<string[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWorkspaceSlug(localStorage.getItem('currentWorkspaceSlug'));
    }
  }, [pathname]);

  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const res = await workspaceAPI.getMyWorkspace();
        const workspace = res.data?.data?.workspace;
        if (workspace) {
          setPlanFeatures(workspace.subscription?.features || []);
          // Check ownership
          if (workspace.ownerId && user) {
            setIsOwner(workspace.ownerId === user.id);
          }
        }
      } catch {
        // ignore
      }
    };
    if (user && !isAdmin) {
      fetchWorkspace();
    }
  }, [user, isAdmin]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tz-cream dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return (
      <div className="min-h-screen flex items-center justify-center bg-tz-cream dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  const makeHref = (path: string) => {
    if (workspaceSlug && !path.startsWith('/admin') && !path.startsWith('/profile')) {
      return `${path}?workspaceSlug=${encodeURIComponent(workspaceSlug)}`;
    }
    return path;
  };

  const baseNavItems = isAdmin
    ? [
        { href: makeHref('/admin'), icon: LayoutDashboard, label: isRTL ? 'لوحة التحكم' : 'Dashboard' },
        { href: makeHref('/settings'), icon: Settings, label: t.settings },
      ]
    : [
        { href: makeHref('/dashboard'), icon: LayoutDashboard, label: t.dashboard },
        { href: makeHref('/settings'), icon: Settings, label: t.settings },
        { href: makeHref('/team'), icon: Users, label: t.members },
        { href: makeHref('/subscription'), icon: CreditCard, label: t.subscription },
        { href: makeHref('/profile'), icon: UserCircle, label: t.profile },
      ];

  const navItems = isOwner
    ? [
        ...baseNavItems.slice(0, 1),
        { href: makeHref('/menu-design'), icon: QrCode, label: t.menuDesign },
        ...baseNavItems.slice(1),
      ]
    : baseNavItems;

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="min-h-screen bg-tz-cream dark:bg-gray-950 flex">
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className={`fixed lg:sticky top-0 h-[100dvh] lg:h-screen bg-white dark:bg-gray-900 border-l border-tz-cream-dark dark:border-gray-800 z-50 flex flex-col shadow-lg lg:shadow-none transition-all ${
          mobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ right: isRTL ? 0 : 'auto', left: isRTL ? 'auto' : 0 }}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-tz-cream-dark dark:border-gray-800">
          <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3 overflow-hidden">
            <img src="/logo.jpg" alt="" className="w-8 h-8 shrink-0 rounded-lg object-cover" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-tz-espresso dark:text-white whitespace-nowrap">{t.appName}</motion.span>
              )}
            </AnimatePresence>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <ChevronIcon className={`w-5 h-5 transition-transform ${!sidebarOpen && 'rotate-180'}`} />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const itemPath = item.href.split('?')[0];
            const isActive = pathname === itemPath;
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-tz-primary text-white shadow-md shadow-tz-primary/25'
                    : 'text-muted-foreground hover:bg-tz-cream-dark dark:hover:bg-gray-800 hover:text-foreground'
                }`}>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap">{item.label}</motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-tz-cream-dark dark:border-gray-800 space-y-1" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
              <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
            onClick={() => { logout(); window.location.href = '/login'; }}>
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm">{t.logout}</motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden h-16 bg-white dark:bg-gray-900 border-b border-tz-cream-dark dark:border-gray-800 flex items-center px-4 sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-bold text-lg ml-3 dark:text-white">{t.appName}</span>
        </div>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
