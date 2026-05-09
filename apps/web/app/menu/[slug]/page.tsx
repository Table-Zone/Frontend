'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { publicMenuAPI } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  details?: any;
  timeOfDay?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  nameEn?: string;
  items: MenuItem[];
}

interface MenuData {
  workspaceName: string;
  slug: string;
  templateId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  bannerUrl?: string;
  titleAr: string;
  titleEn: string;
  categories: MenuCategory[];
}

export default function PublicMenuPage() {
  const { slug } = useParams() as { slug: string };
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await publicMenuAPI.getMenu(slug);
        setMenu(res.data?.menu || null);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B5E3C' }} />
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-gray-500">{error || 'This menu is not available.'}</p>
        </div>
      </div>
    );
  }

  const isRTL = true; // Default to Arabic for public menus
  const fontFamily = menu.fontFamily || 'Tajawal';

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily }} dir="rtl">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: menu.primaryColor }}>
            {menu.workspaceName}
          </span>
          <span className="text-sm text-gray-500">
            {menu.titleAr}
          </span>
        </div>
      </nav>

      {/* Banner */}
      {menu.bannerUrl ? (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img
            src={menu.bannerUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="w-full h-32 md:h-48 flex items-center justify-center"
          style={{ backgroundColor: menu.primaryColor }}
        >
          <h1 className="text-3xl font-bold text-white">{menu.titleAr}</h1>
        </div>
      )}

      {/* Categories */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {menu.categories.map((category) => (
          <div key={category.id}>
            <h2
              className="text-xl font-bold mb-4 pb-2 border-b-2"
              style={{ color: menu.primaryColor, borderColor: menu.accentColor }}
            >
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex gap-4"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-lg shrink-0 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: menu.accentColor }}
                    >
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                    {item.details && Object.keys(item.details).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(item.details).map(([key, value]) => (
                          <span
                            key={key}
                            className="text-xs px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: menu.accentColor + '20',
                              color: menu.primaryColor,
                            }}
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="font-bold mt-2" style={{ color: menu.primaryColor }}>
                      {item.price} ريال
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-400">
        Powered by Table Zone
      </footer>
    </div>
  );
}
