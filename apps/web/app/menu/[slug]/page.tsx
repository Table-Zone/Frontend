'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicMenuAPI } from '@/lib/api';
import { Loader2, Languages } from 'lucide-react';
import { MenuTemplateRenderer } from '@/components/menu/MenuTemplates';
import type { MenuDisplayData } from '@/components/menu/types';

interface MenuData extends MenuDisplayData {
  workspaceName: string;
  slug: string;
}

export default function PublicMenuPage() {
  const { slug } = useParams() as { slug: string };
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnglish, setIsEnglish] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved) {
      setIsEnglish(saved === 'en');
    } else if (!navigator.language.toLowerCase().startsWith('ar')) {
      setIsEnglish(true);
    }
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await publicMenuAPI.getMenu(slug);
        setMenu(res.data?.data?.menu || null);
      } catch {
        setError('Menu not found or not published');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchMenu();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 bg-neutral-950 text-white">
        <div>
          <h1 className="text-2xl font-bold mb-3">
            {isEnglish ? 'Menu Not Available' : 'القائمة غير متاحة'}
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed">
            {isEnglish
              ? 'This menu hasn\'t been published yet. If you\'re the owner, go to your dashboard and publish your menu to make it visible.'
              : 'هذه القائمة لم يتم نشرها بعد. إذا كنت صاحب المطعم، اذهب إلى لوحة التحكم وانشر قائمتك من الزر اعلى الصفحة لتظهر .'}
          </p>
        </div>
      </div>
    );
  }

  const template = menu.templateId || 'noir';
  const langToggle = (
    <button
      type="button"
      onClick={() => setIsEnglish((v) => !v)}
      className="fixed top-6 z-[100] flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 text-white text-xs backdrop-blur-sm border border-white/20"
      style={{ [isEnglish ? 'left' : 'right']: '1rem' }}
    >
      <Languages className="w-3.5 h-3.5" />
      {isEnglish ? 'العربية' : 'English'}
    </button>
  );

  switch (template) {
    case 'noir':
    default:
      return <>{langToggle}<MenuTemplateRenderer menu={menu} isEnglish={isEnglish} /></>;
  }
}
}
