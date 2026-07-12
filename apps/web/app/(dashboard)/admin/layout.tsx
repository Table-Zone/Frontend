'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CreditCard, Users, Ticket, Package, Wallet, LayoutDashboard, Tag,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { href: '/admin', icon: LayoutDashboard, labelAr: 'طلبات الاشتراك', labelEn: 'Requests' },
  { href: '/admin/trial-codes', icon: Ticket, labelAr: 'أكواد التجربة', labelEn: 'Trial Codes' },
  { href: '/admin/discount-codes', icon: Tag, labelAr: 'أكواد الخصم', labelEn: 'Discount Codes' },
  { href: '/admin/subscriptions', icon: CreditCard, labelAr: 'الاشتراكات', labelEn: 'Subscriptions' },
  { href: '/admin/users', icon: Users, labelAr: 'المستخدمين', labelEn: 'Users' },
  { href: '/admin/services', icon: Package, labelAr: 'الخدمات', labelEn: 'Services' },
  { href: '/admin/finance', icon: Wallet, labelAr: 'المالية', labelEn: 'Finance' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isRTL } = useLanguage();

  return (
    <div>
      <nav className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-tz-cream-dark">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-tz-primary text-white shadow-md'
                    : 'bg-white text-muted-foreground hover:bg-tz-cream-dark border border-tz-cream-dark'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {isRTL ? item.labelAr : item.labelEn}
              </div>
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
