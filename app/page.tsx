'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Users, Zap, Globe, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const partners = [
  { name: 'Appy', img: '/appy.jpg' },
  { name: 'Pantry', img: '/pantry.jpg' },
  { name: 'Masla', img: '/masla.jpg' },
  { name: 'Camilla', img: '/camilla.png' },
];

export default function LandingPage() {
  const { t, isRTL } = useLanguage();

  const features = [
    { icon: Clock, title: isRTL ? 'مؤقتات ذكية' : 'Smart Timers', desc: isRTL ? 'تتبع وقت كل طاولة بتنظيم ذكي' : 'Track every table with smart organization' },
    { icon: Users, title: isRTL ? 'إدارة الفريق' : 'Team Management', desc: isRTL ? 'إدارة الموظفين والمقاعد في الوقت الفعلي' : 'Manage staff and seats in real-time' },
    { icon: Zap, title: isRTL ? 'مزامنة فورية' : 'Real-Time Sync', desc: isRTL ? 'تحديثات لحظية على جميع الأجهزة' : 'Instant updates across all devices' },
    { icon: Globe, title: isRTL ? 'عربي وإنجليزي' : 'Arabic & English', desc: isRTL ? 'دعم كامل للغتين مع تخطيط RTL' : 'Full bilingual support with RTL layout' },
  ];

  return (
    <div className="min-h-screen bg-tz-cream">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 18s linear infinite;
          will-change: transform;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tz-primary/5 via-transparent to-tz-primary/10" />

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <Image src="/logo.jpg" alt="Table Zone" width={36} height={36} className="w-full h-full object-cover" />
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
            {isRTL ? 'أدر طاولاتك ' : 'Manage Your Cafe Tables '}
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

      {/* Partners Marquee */}
      <section className="py-12 bg-white border-y border-tz-cream-dark overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-6 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
            {isRTL ? 'شركاؤنا' : 'Our Partners'}
          </p>
        </div>
        <div className="overflow-hidden" dir="ltr">
          <div className="marquee-track">
            {[...partners, ...partners, ...partners].map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-center mx-4 sm:mx-8 rounded-2xl overflow-hidden bg-white border border-tz-cream-dark w-24 h-16 sm:w-32 sm:h-20 shrink-0"
              >
                <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-2 max-w-4xl mx-auto gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-tz-cream-dark hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-tz-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <f.icon className="w-6 h-6 text-tz-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-tz-espresso mb-4">
              {isRTL ? 'من نحن' : 'About Us'}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              {isRTL
                ? 'Table Zone هي منصة سعودية مصممة لإدارة الطاولات، تقدم أدوات تساعد على تحسين تجربة العملاء وتسهيل عمل الفريق للتمكن من إدارة طاولاتك بشكل احترافي ودقيق'
                : 'Table Zone is a Saudi-built platform designed for table management, offering tools that help improve the customer experience and streamline team operations so you can manage your tables professionally and precisely.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-tz-cream">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-tz-espresso mb-3">
              {isRTL ? 'تسعير بسيط' : 'Simple Pricing'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'اختر الخطة التي تناسبك' : 'Choose the plan that fits you'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="rounded-3xl p-8 border-2 border-tz-cream-dark bg-white">
              <h3 className="font-bold text-lg mb-1">{t.monthly}</h3>
              <p className="text-sm text-muted-foreground mb-6">{isRTL ? '30 يوم' : '30 days'}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-tz-espresso">69</span>
                <span className="text-muted-foreground"> SAR</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  isRTL ? 'مقعد موظف واحد' : '1 staff seat',
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
                <span className="text-4xl font-extrabold text-tz-primary">199</span>
                <span className="text-muted-foreground"> SAR</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  isRTL ? 'مقعد موظف واحد' : '1 staff seat',
                  isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                  isRTL ? 'دعم فني' : 'Support',
                  isRTL ? 'توفير أكثر' : 'Save more',
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
      <footer className="py-12 px-6 bg-white border-t border-tz-cream-dark">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <Image src="/logo.jpg" alt="Table Zone" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-sm text-tz-espresso">Table Zone</span>
          </div>
          <a
            href="tel:0556088384"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-tz-primary transition-colors"
            dir="ltr"
          >
            <Phone className="w-4 h-4" />
            0556088384
          </a>
          <p className="text-xs text-muted-foreground">
            © 2025 Table Zone. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </footer>
    </div>
  );
}
