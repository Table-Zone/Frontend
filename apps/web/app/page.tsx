'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Clock, Users, Zap, Globe, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { subscriptionAPI } from '@/lib/api';

const partners = [
  { name: 'Appy', img: '/appy.jpg' },
  { name: 'Pantry', img: '/pantry.jpg' },
  { name: 'Masla', img: '/masla.jpg' },
  { name: 'Camilla', img: '/camilla.png' },
  { name: 'Sum', img: '/Sum.png' },
];

interface Plan {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  priceSar: number;
  baseStaffSeats: number;
  durationDays: number;
  extraStaffSeatPriceSar: number;
}

export default function LandingPage() {
  const { t, isRTL, setLang } = useLanguage();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchPlans = () => {
    setPlansLoading(true);
    setPlansError(false);
    subscriptionAPI.getPlans()
      .then((res) => setPlans(res.data.data.plans || []))
      .catch(() => setPlansError(true))
      .finally(() => setPlansLoading(false));
  };

  useEffect(() => { fetchPlans(); }, []);

  const monthlyPlan = plans.find((p) => p.name === 'monthly');
  const quarterlyPlan = plans.find((p) => p.name === 'quarterly');

  const features = [
    { icon: Clock, title: isRTL ? 'مؤقتات ذكية' : 'Smart Timers', desc: isRTL ? 'تتبع وقت كل طاولة بتنظيم ذكي' : 'Track every table with smart organization' },
    { icon: Users, title: isRTL ? 'إدارة الفريق' : 'Team Management', desc: isRTL ? 'إدارة الموظفين والمقاعد في الوقت الفعلي' : 'Manage staff and seats in real-time' },
    { icon: Zap, title: isRTL ? 'مزامنة فورية' : 'Real-Time Sync', desc: isRTL ? 'تحديثات لحظية على جميع الأجهزة' : 'Instant updates across all devices' },
    { icon: Globe, title: isRTL ? 'عربي وإنجليزي' : 'Arabic & English', desc: isRTL ? 'دعم كامل للغتين مع تخطيط RTL' : 'Full bilingual support with RTL layout' },
  ];

  return (
    <div className="min-h-screen bg-tz-cream dark:bg-gray-950">
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
      
      {/* Sticky Nav */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-tz-cream/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm border-b border-tz-cream-dark dark:border-gray-800' : ''}`}>
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden">
              <Image src="/logo.jpg" alt="Table Zone" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-lg text-tz-espresso dark:text-white">Table Zone</span>
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
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tz-primary/5 via-transparent to-tz-primary/10" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-32 pb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-tz-espresso dark:text-white leading-tight mb-6"
          >
            {isRTL ? 'ادر عملياتك ' : 'Manage Your Cafe Tables '}
            <span className="text-tz-primary">{isRTL ? 'بسهولة' : 'in Real-Time'}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {isRTL
              ? 'العديد من الخدمات التي تجعل تجربتك أسهل'
              : 'Multiple services that make your experience easier'}
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
              className="bg-white hover:bg-tz-cream-dark dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 text-tz-espresso dark:text-white font-bold px-8 py-3.5 rounded-2xl border border-tz-cream-dark transition-all"
            >
              {t.login}
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Partners Marquee */}
      <section className="py-12 bg-white dark:bg-gray-900 border-y border-tz-cream-dark dark:border-gray-700 overflow-hidden">
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
                className="flex items-center justify-center mx-4 sm:mx-8 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 border border-tz-cream-dark dark:border-gray-700 w-24 h-16 sm:w-32 sm:h-20 shrink-0"
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
            <h2 className="text-3xl font-bold text-tz-espresso dark:text-white mb-3">
              {isRTL ? 'كل ما تحتاجه' : 'Everything You Need'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'ما نقدمه لك' : 'What we offer you'}
            </p>
          </div>

          <div className="grid grid-cols-2 max-w-4xl mx-auto gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-tz-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <f.icon className="w-6 h-6 text-tz-primary" />
                </div>
                <h3 className="font-bold text-lg mb-1 text-tz-espresso dark:text-white">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-tz-espresso dark:text-white mb-4">
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
      <section className="py-20 px-6 bg-tz-cream dark:bg-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-tz-espresso dark:text-white mb-3">
              {isRTL ? 'تسعير بسيط' : 'Simple Pricing'}
            </h2>
            <p className="text-muted-foreground">
              {isRTL ? 'اختر الخطة التي تناسبك' : 'Choose the plan that fits you'}
            </p>
          </div>

          {plansLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">{isRTL ? 'جاري تحميل الخطط...' : 'Loading plans...'}</p>
            </div>
          ) : plansError ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-sm text-muted-foreground">{isRTL ? 'تعذر تحميل الخطط' : 'Could not load plans'}</p>
              <button
                onClick={fetchPlans}
                className="px-6 py-2.5 rounded-xl bg-tz-primary hover:bg-tz-primary-dark text-white text-sm font-bold transition-colors"
              >
                {isRTL ? 'حاول مجدداً' : 'Try again'}
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {monthlyPlan && (
                <div className="rounded-3xl p-8 border-2 border-tz-cream-dark dark:border-gray-700 bg-white dark:bg-gray-800">
                  <h3 className="font-bold text-lg mb-1 text-tz-espresso dark:text-white">{isRTL ? monthlyPlan.labelAr : monthlyPlan.labelEn}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{monthlyPlan.durationDays} {isRTL ? 'يوم' : 'days'}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-tz-espresso dark:text-white">{monthlyPlan.priceSar}</span>
                    <span className="text-muted-foreground"> SAR</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      isRTL ? (monthlyPlan.baseStaffSeats === 1 ? 'مقعد موظف واحد' : `${monthlyPlan.baseStaffSeats} مقاعد موظفين`) : `${monthlyPlan.baseStaffSeats} staff seat`,
                      isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                      isRTL ? 'دعم فني' : 'Support',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-tz-espresso dark:text-gray-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-tz-green shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className="block w-full text-center bg-tz-cream hover:bg-tz-cream-dark dark:bg-gray-700 dark:hover:bg-gray-600 text-tz-espresso dark:text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    {isRTL ? 'ابدأ الآن' : 'Get Started'}
                  </Link>
                </div>
              )}

              {quarterlyPlan && (
                <div className="rounded-3xl p-8 border-2 border-tz-primary bg-tz-primary/5 dark:bg-tz-primary/10 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-tz-primary text-white text-xs font-bold">
                    {isRTL ? 'الأفضل قيمة' : 'Best Value'}
                  </div>
                  <h3 className="font-bold text-lg mb-1 text-tz-espresso dark:text-white">{isRTL ? quarterlyPlan.labelAr : quarterlyPlan.labelEn}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{quarterlyPlan.durationDays} {isRTL ? 'يوم' : 'days'}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-tz-primary">{quarterlyPlan.priceSar}</span>
                    <span className="text-muted-foreground"> SAR</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[
                      isRTL ? (quarterlyPlan.baseStaffSeats === 1 ? 'مقعد موظف واحد' : `${quarterlyPlan.baseStaffSeats} مقاعد موظفين`) : `${quarterlyPlan.baseStaffSeats} staff seat`,
                      isRTL ? 'مؤقتات غير محدودة' : 'Unlimited timers',
                      isRTL ? 'دعم فني' : 'Support',
                      isRTL ? 'توفير أكثر' : 'Save more',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-tz-espresso dark:text-gray-300">
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
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white dark:bg-gray-900 border-t border-tz-cream-dark dark:border-gray-700">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg overflow-hidden">
              <Image src="/logo.jpg" alt="Table Zone" width={28} height={28} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-sm text-tz-espresso dark:text-white">Table Zone</span>
          </div>
          <a
            href="https://wa.me/966501549458"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-tz-primary transition-colors"
            dir="ltr"
          >
            <Phone className="w-4 h-4" />
            0501549458
          </a>
          <div className="flex items-center gap-1 rounded-xl border border-tz-cream-dark dark:border-gray-700 overflow-hidden text-xs font-bold">
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1.5 transition-colors ${isRTL ? 'bg-tz-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              عربي
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 transition-colors ${!isRTL ? 'bg-tz-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
            >
              EN
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2025 Table Zone. {isRTL ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/966501549458"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
