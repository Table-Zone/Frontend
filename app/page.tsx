'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Coffee, Clock, Users, Shield, Zap, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LandingPage() {
  const { t, isRTL } = useLanguage();

  const features = [
    { icon: Clock, title: isRTL ? 'مؤقتات ذكية' : 'Smart Timers', desc: isRTL ? 'تتبع وقت كل طاولة بتنبيهات لونية' : 'Track every table with color-coded alerts' },
    { icon: Users, title: isRTL ? 'إدارة الفريق' : 'Team Management', desc: isRTL ? 'إدارة الموظفين والمقاعد في الوقت الفعلي' : 'Manage staff and seats in real-time' },
    { icon: Zap, title: isRTL ? 'مزامنة فورية' : 'Real-Time Sync', desc: isRTL ? 'تحديثات لحظية على جميع الأجهزة' : 'Instant updates across all devices' },
    { icon: Globe, title: isRTL ? 'عربي وإنجليزي' : 'Arabic & English', desc: isRTL ? 'دعم كامل للغتين مع تخطيط RTL' : 'Full bilingual support with RTL layout' },
  ];

  return (
    <div className="min-h-screen bg-tz-cream">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tz-primary/5 via-transparent to-tz-primary/10" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-tz-primary flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-tz-espresso">Table Zone</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t.login}
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold bg-tz-primary hover:bg-tz-primary-dark text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              {isRTL ? 'ابدأ الآن' : 'Get Started'}
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-16 pb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-tz-espresso leading-tight mb-6"
          >
            {isRTL ? 'أدر طاولات مقهاك ' : 'Manage Your Cafe Tables '}
            <span className="text-tz-primary">{isRTL ? 'في الوقت الفعلي' : 'in Real-Time'}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {isRTL
              ? 'تتبع إشغال الطاولات والمؤقتات ونشاط الموظفين.'
              : 'Track table occupancy, timers, and staff activity.'}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="bg-tz-primary hover:bg-tz-primary-dark text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-tz-primary/25 transition-all hover:-translate-y-0.5"
            >
              {isRTL ? 'ابدأ مجاناً' : 'Start Free Trial'}
            </Link>
            <Link
              href="/login"
              className="bg-white hover:bg-tz-cream-dark text-tz-espresso font-bold px-8 py-3.5 rounded-2xl border border-tz-cream-dark transition-all"
            >
              {t.login}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-tz-espresso mb-3">
              {isRTL ? 'كل ما تحتاجه' : 'Everything You Need'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'ميزات قوية مصممة لعمليات المقاهي' : 'Powerful features designed for cafe operations'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-2xl bg-tz-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-tz-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-tz-espresso mb-3">
              {isRTL ? 'تسعير بسيط' : 'Simple Pricing'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'لا رسوم خفية. ادفع مرة واحدة واستخدم للأبد' : 'No hidden fees. Pay once, use forever'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-3xl p-8 border-2 border-tz-cream-dark">
              <h3 className="font-bold text-lg mb-1">{t.monthly}</h3>
              <p className="text-sm text-muted-foreground mb-6">{isRTL ? '30 يوم' : '30 days'}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-tz-espresso">70</span>
                <span className="text-muted-foreground"> SAR</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  isRTL ? '1 مقعد موظف' : '1 staff seat',
                  isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                  isRTL ? 'دعم فني' : 'Support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-tz-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-tz-cream hover:bg-tz-cream-dark text-tz-espresso font-bold py-3 rounded-xl transition-colors"
              >
                {isRTL ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </div>

            <div className="rounded-3xl p-8 border-2 border-tz-primary bg-tz-primary/5 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-tz-primary text-white text-xs font-bold">
                {isRTL ? 'الأفضل قيمة' : 'Best Value'}
              </div>
              <h3 className="font-bold text-lg mb-1">{t.quarterly}</h3>
              <p className="text-sm text-muted-foreground mb-6">{isRTL ? '90 يوم' : '90 days'}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-tz-primary">200</span>
                <span className="text-muted-foreground"> SAR</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  isRTL ? '1 مقعد موظف' : '1 staff seat',
                  isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                  isRTL ? 'دعم فني' : 'Support',
                  isRTL ? 'توفير 10%' : 'Save 10%',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-tz-green shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center bg-tz-primary hover:bg-tz-primary-dark text-white font-bold py-3 rounded-xl transition-colors"
              >
                {isRTL ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-tz-cream-dark">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-tz-primary flex items-center justify-center">
              <Coffee className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-tz-espresso">Table Zone</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 Table Zone. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </footer>
    </div>
  );
}
