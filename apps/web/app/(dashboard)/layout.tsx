'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Settings, Users, Clock, CreditCard,
  LogOut, Menu, X, ChevronLeft, ChevronRight, QrCode, Shield, Ticket, Package, Wallet, Tag,
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

  // Product links, subscribed product first (stable sort keeps Tables Timer first on ties)
  const productNavItems = [
    { href: makeHref('/dashboard'), icon: Clock, label: t.tablesTimer, feature: 'tables' },
    ...(isOwner ? [{ href: makeHref('/menu-design'), icon: QrCode, label: t.menuDesign, feature: 'qrcode' }] : []),
  ].sort((a, b) => Number(planFeatures.includes(b.feature)) - Number(planFeatures.includes(a.feature)));

  const navItems = isAdmin
    ? [
        { href: makeHref('/admin'), icon: LayoutDashboard, label: isRTL ? 'طلبات الاشتراك' : 'Requests' },
        { href: makeHref('/admin/trial-codes'), icon: Ticket, label: isRTL ? 'أكواد التجربة' : 'Trial Codes' },
        { href: makeHref('/admin/discount-codes'), icon: Tag, label: isRTL ? 'أكواد الخصم' : 'Discount Codes' },
        { href: makeHref('/admin/subscriptions'), icon: CreditCard, label: isRTL ? 'الاشتراكات' : 'Subscriptions' },
        { href: makeHref('/admin/users'), icon: Users, label: isRTL ? 'المستخدمين' : 'Users' },
        { href: makeHref('/admin/services'), icon: Package, label: isRTL ? 'الخدمات' : 'Services' },
        { href: makeHref('/admin/finance'), icon: Wallet, label: isRTL ? 'المالية' : 'Finance' },
      ]
    : [
        ...productNavItems,
        { href: makeHref('/team'), icon: Users, label: t.members },
        { href: makeHref('/settings'), icon: Settings, label: t.settings },
      ];

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
        <div className={`h-16 flex items-center border-b border-tz-cream-dark dark:border-gray-800 ${sidebarOpen ? 'justify-between px-4' : 'justify-center px-2'}`}>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
                  <img src="/logo.jpg" alt="" className="w-8 h-8 shrink-0 rounded-lg object-cover" />
                  <span className="font-bold text-tz-espresso dark:text-white whitespace-nowrap">{t.appName}</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center">
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
            const isActive = pathname === itemPath || (itemPath === '/settings' && ['/subscription', '/profile'].includes(pathname));
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

        <div className="p-3 border-t border-tz-cream-dark dark:border-gray-800" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className={`flex items-center gap-2 min-w-0 ${sidebarOpen ? '' : 'justify-center'}`}>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 text-sm font-medium truncate px-3">{user.name}</motion.p>
              )}
            </AnimatePresence>
            <Button variant="ghost" size="icon" aria-label={t.logout} title={t.logout}
              className="shrink-0 rounded-xl bg-tz-red/10 text-tz-red hover:bg-tz-red/20 hover:text-tz-red"
              onClick={() => { logout(); window.location.href = '/login'; }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden h-16 bg-tz-cream dark:bg-gray-900 flex items-center px-4 sticky top-0 z-30 relative">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-tz-cream-dark dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <Menu className="w-6 h-6 text-tz-espresso dark:text-white" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
            <img src="/logo.jpg" alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            <span className="font-bold text-base dark:text-white">{t.appName}</span>
          </div>
        </div>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
