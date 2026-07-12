'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  QrCode, Plus, Loader2, Trash2, Edit2, Save, X, Palette,
  UtensilsCrossed, QrCodeIcon, Eye, EyeOff, Upload, ImageIcon,
  ArrowUp, ArrowDown, FileImage, Tag, Settings,
  Instagram, MapPin, Music2, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { qrMenuAPI, workspaceAPI, getImageUrl } from '@/lib/api';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import SubscriptionPopup from '@/components/shared/SubscriptionPopup';
import { DetailsEditor } from '@/components/menu/DetailsEditor';
import QRStickersTab from '@/components/menu/QRStickersTab';
import {
  MenuDetailPair,
  parseDetailsPairs,
  buildDetailsPayload,
  formatDetailLabel,
  formatDetailValue,
} from '@/lib/menu-details';

interface Template {
  id: string;
  nameAr: string;
  nameEn: string;
  previewImage: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

interface MenuItem {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  price: number;
  imageUrl?: string;
  details?: any;
  timeOfDay?: string;
  isAvailable: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
  nameEn?: string;
  imageUrl?: string;
  displayStyle?: string; // auto | grid | list (Theme 1 layout)
  sortOrder: number;
  items: MenuItem[];
}

interface MenuData {
  id: string;
  templateId: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  bannerUrl?: string;
  backgroundUrl?: string;
  titleAr: string;
  titleEn: string;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  googleMapsUrl?: string | null;
  isPublished: boolean;
  categories: MenuCategory[];
}

const QUICK_PALETTES = [
  { id: 'flame',    label: 'Flame',    labelAr: 'نار',    primary: '#C75B12', accent: '#f5f0eb', colors: ['#C75B12', '#2C1810', '#f5f0eb'] },
  { id: 'midnight', label: 'Midnight', labelAr: 'ليل',    primary: '#d4af37', accent: '#080512', colors: ['#d4af37', '#080512', '#f0ede8'] },
  { id: 'forest',   label: 'Forest',   labelAr: 'غابة',   primary: '#16a34a', accent: '#052e16', colors: ['#16a34a', '#052e16', '#f0faf4'] },
  { id: 'ocean',    label: 'Ocean',    labelAr: 'محيط',   primary: '#2563eb', accent: '#0a1e38', colors: ['#2563eb', '#0a1e38', '#f0f9ff'] },
  { id: 'rose',     label: 'Rose',     labelAr: 'وردة',   primary: '#e11d48', accent: '#1e0812', colors: ['#e11d48', '#1e0812', '#fff1f2'] },
];

const FONT_OPTIONS = [
  { id: 'sans',    label: 'Modern',  labelAr: 'عصري',    cssFamily: "'Inter', sans-serif",                fontFamily: 'sans',    sample: 'Grilled Salmon' },
  { id: 'serif',   label: 'Classic', labelAr: 'كلاسيكي', cssFamily: "'Playfair Display', Georgia, serif",  fontFamily: 'serif',   sample: 'Grilled Salmon' },
  { id: 'minimal', label: 'Minimal', labelAr: 'بسيط',    cssFamily: "'DM Sans', sans-serif",              fontFamily: 'minimal',  sample: 'Grilled Salmon' },
  { id: 'arabic',  label: 'Arabic',  labelAr: 'عربي',    cssFamily: "'Cairo', sans-serif",                fontFamily: 'arabic',   sample: 'سمك مشوي' },
];

function TemplateMiniPreview({ template, small }: { template: any; small?: boolean }) {
  const h = small ? 'h-16' : 'h-28';
  const scale = small ? 'scale-[0.55]' : 'scale-[0.85]';
  const origin = small ? 'origin-top-left' : 'origin-top-left';

  const noir = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        <div className="w-full">
          {/* nav pills */}
          <div className="flex gap-1 justify-center py-1.5">
            <div className="px-2 py-0.5 rounded-full text-[6px] font-bold" style={{ backgroundColor: template.accentColor, color: '#2A2014' }}>A</div>
            <div className="px-2 py-0.5 rounded-full text-[6px]" style={{ color: template.accentColor }}>B</div>
            <div className="px-2 py-0.5 rounded-full text-[6px]" style={{ color: template.accentColor }}>C</div>
          </div>
          {/* champagne card grid */}
          <div className="grid grid-cols-2 gap-1 px-3 pt-1">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-md overflow-hidden bg-white border" style={{ borderColor: template.accentColor + '30' }}>
                <div className="h-5" style={{ backgroundColor: template.accentColor + '33' }} />
                <div className="flex justify-between items-center px-1 py-0.5">
                  <div className="h-1 w-5 rounded" style={{ backgroundColor: template.accentColor + '99' }} />
                  <div className="text-[6px] font-bold" style={{ color: template.accentColor }}>10</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const editorial = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        <div className="w-full px-3 pt-2">
          <div className="flex gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: template.accentColor + '30' }} />
            <div className="flex-1">
              <div className="h-1.5 w-12 rounded mb-0.5" style={{ backgroundColor: template.accentColor }} />
              <div className="h-1 w-8 rounded" style={{ backgroundColor: template.accentColor + '40' }} />
            </div>
          </div>
          <div className="h-px w-full mb-1" style={{ backgroundColor: template.accentColor + '20' }} />
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: template.accentColor + '30' }} />
            <div className="flex-1">
              <div className="h-1.5 w-12 rounded mb-0.5" style={{ backgroundColor: template.accentColor }} />
              <div className="h-1 w-8 rounded" style={{ backgroundColor: template.accentColor + '40' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const poster = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        <div className="w-full px-3 pt-2 text-center">
          <div className="text-[14px] font-black tracking-tighter" style={{ color: template.accentColor }}>MENU</div>
          <div className="grid grid-cols-2 gap-x-3 mt-1">
            <div className="text-left">
              <div className="h-1 w-8 rounded mb-0.5" style={{ backgroundColor: template.accentColor }} />
              <div className="h-0.5 w-10 rounded mb-0.5" style={{ backgroundColor: template.accentColor + '50' }} />
              <div className="h-0.5 w-10 rounded" style={{ backgroundColor: template.accentColor + '50' }} />
            </div>
            <div className="text-left">
              <div className="h-1 w-8 rounded mb-0.5" style={{ backgroundColor: template.accentColor }} />
              <div className="h-0.5 w-10 rounded mb-0.5" style={{ backgroundColor: template.accentColor + '50' }} />
              <div className="h-0.5 w-10 rounded" style={{ backgroundColor: template.accentColor + '50' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const bakery = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        {/* Hero bar */}
        <div className="w-full h-8 relative" style={{ backgroundColor: template.accentColor + '30' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 rounded-full border-2" style={{ backgroundColor: template.accentColor, borderColor: template.primaryColor }} />
        </div>
        {/* Title */}
        <div className="text-center mt-5 mb-1.5 px-1">
          <div className="h-1.5 w-12 rounded mx-auto" style={{ backgroundColor: '#f0ede4' }} />
        </div>
        {/* Category pills */}
        <div className="flex gap-1 px-2 mb-1.5">
          <div className="h-2 w-6 rounded-full" style={{ backgroundColor: '#988264' }} />
          <div className="h-2 w-6 rounded-full opacity-40" style={{ backgroundColor: '#988264' }} />
          <div className="h-2 w-6 rounded-full opacity-40" style={{ backgroundColor: '#988264' }} />
        </div>
        {/* Cards */}
        <div className="px-2 space-y-1">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-1 rounded-lg overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
              <div className="w-7 h-7 shrink-0" style={{ backgroundColor: '#988264' + '30' }} />
              <div className="flex-1 py-1 pr-1 flex flex-col justify-between">
                <div className="h-1 w-10 rounded" style={{ backgroundColor: '#33333330' }} />
                <div className="h-1.5 w-7 rounded" style={{ backgroundColor: '#988264' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  switch (template.id) {
    case 'noir':
    case 'default':
      return noir;
    case 'editorial':
      return editorial;
    case 'poster':
      return poster;
    case 'bakery':
      return bakery;
    default:
      return noir;
  }
}

export default function MenuDesignPage() {
  const { t, isRTL } = useLanguage();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'design' | 'categories' | 'items' | 'qr' | 'stickers'>('design');

  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', nameEn: '' });
  const [newItem, setNewItem] = useState({
    name: '', nameEn: '', description: '', descriptionEn: '', price: '', categoryId: '',
  });
  const [newItemErrors, setNewItemErrors] = useState<{ name?: string; price?: string; categoryId?: string }>({});
  const [newItemDetails, setNewItemDetails] = useState<MenuDetailPair[]>([]);
  const [newItemImage, setNewItemImage] = useState<File | null>(null);
  const [newItemImagePreview, setNewItemImagePreview] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<any>({});
  const [editItemDetails, setEditItemDetails] = useState<MenuDetailPair[]>([]);

  // Colors
  const [customPrimary, setCustomPrimary] = useState('');
  const [customAccent, setCustomAccent] = useState('');

  // Social links
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [savingSocial, setSavingSocial] = useState(false);

  // Typography
  const [selFont, setSelFont] = useState('sans');

  // QR download ref
  const qrCanvasRef = useRef<HTMLDivElement>(null);

  const downloadQRCodePNG = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${workspaceSlug || 'menu'}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  const refreshMenu = useCallback(async () => {
    if (!workspaceId) return;
    const res = await qrMenuAPI.getMenu(workspaceId);
    setMenu(res.data?.data?.menu || null);
  }, [workspaceId]);

  useEffect(() => {
    const init = async () => {
      try {
        const [wsRes, templatesRes] = await Promise.all([
          workspaceAPI.getMyWorkspace(),
          qrMenuAPI.getTemplates(),
        ]);
        const workspace = wsRes.data?.data?.workspace;
        if (workspace?.id) {
          setWorkspaceId(workspace.id);
          setWorkspaceSlug(workspace.slug);
          setWorkspaceName(workspace.name || workspace.slug || '');
          const status = workspace.subscription?.status;
          const hasQr = workspace.subscription?.features?.includes('qrcode') ?? false;
          const isUsable = (status === 'active' || status === 'trial') && hasQr;
          setSubscriptionActive(isUsable);
          const menuRes = await qrMenuAPI.getMenu(workspace.id);
          const realMenu = menuRes.data?.data?.menu || null;
          if (realMenu) {
            setMenu(realMenu);
            setCustomPrimary(realMenu.primaryColor);
            setCustomAccent(realMenu.accentColor);
            if (realMenu.fontFamily) setSelFont(realMenu.fontFamily);
            setInstagramUrl(realMenu.instagramUrl || '');
            setTiktokUrl(realMenu.tiktokUrl || '');
            setGoogleMapsUrl(realMenu.googleMapsUrl || '');
          }
        }
        setTemplates(templatesRes.data?.data?.templates || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleAddCategory = async () => {
    if (!workspaceId || !newCategory.name) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.createCategory(workspaceId, newCategory);
    await refreshMenu();
    setNewCategory({ name: '', nameEn: '' });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!workspaceId || !confirm('Delete this category and all its items?')) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.deleteCategory(workspaceId, categoryId);
    await refreshMenu();
  };

  const handleAddItem = async () => {
    const errors: { name?: string; price?: string; categoryId?: string } = {};
    if (!newItem.name) errors.name = isRTL ? 'يجب إدخال اسم المنتج' : 'Enter a product name';
    if (!newItem.price) errors.price = isRTL ? 'السعر مطلوب' : 'Price is required';
    if (!newItem.categoryId) errors.categoryId = isRTL ? 'يجب اختيار التصنيف' : 'Please select a category';
    if (Object.keys(errors).length > 0) { setNewItemErrors(errors); return; }
    setNewItemErrors({});
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    const createRes = await qrMenuAPI.createItem(workspaceId, newItem.categoryId, {
      name: newItem.name,
      description: newItem.description || undefined,
      price: parseFloat(newItem.price),
      details: buildDetailsPayload(newItemDetails),
    });
    const createdItemId = createRes.data?.data?.item?.id;
    if (newItemImage && createdItemId) {
      const fd = new FormData();
      fd.append('image', newItemImage);
      await qrMenuAPI.uploadItemImage(createdItemId, fd);
    }
    await refreshMenu();
    setNewItem({ name: '', nameEn: '', description: '', descriptionEn: '', price: '', categoryId: '' });
    setNewItemDetails([]);
    setNewItemImage(null);
    setNewItemImagePreview(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!workspaceId || !confirm('Delete this item?')) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.deleteItem(workspaceId, itemId);
    await refreshMenu();
  };

  const handleToggleItemVisibility = async (item: MenuItem) => {
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateItem(workspaceId, item.id, { isAvailable: !item.isAvailable });
    await refreshMenu();
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item.id);
    setEditItemData({
      name: item.name,
      nameEn: item.nameEn || '',
      description: item.description || '',
      descriptionEn: item.descriptionEn || '',
      price: item.price,
    });
    setEditItemDetails(parseDetailsPairs(item.details));
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateItem(workspaceId, itemId, {
      ...editItemData,
      price: parseFloat(editItemData.price),
      details: buildDetailsPayload(editItemDetails),
    });
    await refreshMenu();
    setEditingItem(null);
    setEditItemData({});
    setEditItemDetails([]);
  };

  const handlePublishToggle = async () => {
    if (!workspaceId || !menu) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, { isPublished: !menu.isPublished });
    await refreshMenu();
  };

  const handleColorUpdate = async () => {
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, {
      primaryColor: customPrimary,
      accentColor: customAccent,
    });
    await refreshMenu();
  };

  const handleSocialUpdate = async () => {
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    setSavingSocial(true);
    try {
      await qrMenuAPI.updateMenu(workspaceId, {
        instagramUrl: instagramUrl.trim() || null,
        tiktokUrl: tiktokUrl.trim() || null,
        googleMapsUrl: googleMapsUrl.trim() || null,
      });
      await refreshMenu();
    } finally {
      setSavingSocial(false);
    }
  };

  const handlePaletteSelect = async (palette: typeof QUICK_PALETTES[0]) => {
    setCustomPrimary(palette.primary);
    setCustomAccent(palette.accent);
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, {
      primaryColor: palette.primary,
      accentColor: palette.accent,
    });
    await refreshMenu();
  };

  const handleFontSelect = async (font: typeof FONT_OPTIONS[0]) => {
    setSelFont(font.id);
    if (!workspaceId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, { fontFamily: font.fontFamily });
    await refreshMenu();
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.files?.[0]) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    await qrMenuAPI.uploadLogo(workspaceId, fd);
    await refreshMenu();
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.files?.[0]) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    await qrMenuAPI.uploadBanner(workspaceId, fd);
    await refreshMenu();
  };

  const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.files?.[0]) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    await qrMenuAPI.uploadBackground(workspaceId, fd);
    await refreshMenu();
  };

  const handleRemoveLogo = async () => {
    if (!workspaceId || !menu?.logoUrl) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, { logoUrl: null });
    await refreshMenu();
  };

  const handleRemoveBanner = async () => {
    if (!workspaceId || !menu?.bannerUrl) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, { bannerUrl: null });
    await refreshMenu();
  };

  const handleRemoveBackground = async () => {
    if (!workspaceId || !menu?.backgroundUrl) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.updateMenu(workspaceId, { backgroundUrl: null });
    await refreshMenu();
  };

  const handleUploadItemImage = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    await qrMenuAPI.uploadItemImage(itemId, fd);
    await refreshMenu();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">{isRTL ? 'تعذر تحميل القائمة' : 'Failed to load menu'}</p>
      </div>
    );
  }

  const publicMenuUrl = workspaceSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${workspaceSlug}`
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-tz-espresso">
            {isRTL ? 'QR منيو' : 'QR Menu'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isRTL ? 'صمّم قائمتك وشارك رابط QR مع زبائنك' : 'Design your menu and share the QR link with customers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            menu.isPublished
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-gray-100 border-gray-200 text-gray-500'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${menu.isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
            {menu.isPublished ? (isRTL ? 'مرئية' : 'Visible') : (isRTL ? 'مخفية' : 'Hidden')}
          </div>
        </div>
      </div>

      {/* Preview banner for non-subscribers */}
      {!subscriptionActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="font-medium text-amber-800">
              {isRTL ? 'هذه قائمتك الافتراضية — اشترك لتعديلها وتخصيصها' : 'This is your default menu — subscribe to edit and customize'}
            </p>
            <p className="text-sm text-amber-600">
              {isRTL ? 'يمكنك تصفح القائمة لكن التعديل يتطلب الاشتراك' : 'You can browse the menu but editing requires a subscription'}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowSubscribe(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            {isRTL ? 'الاشتراك الآن' : 'Subscribe Now'}
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
        {[
          { key: 'design', label: isRTL ? 'التصميم' : 'Design', icon: Palette },
          { key: 'categories', label: isRTL ? 'التصنيفات' : 'Categories', icon: UtensilsCrossed },
          { key: 'items', label: isRTL ? 'المنتجات' : 'Items', icon: Plus },
          { key: 'qr', label: 'QR Code', icon: QrCodeIcon },
          { key: 'stickers', label: isRTL ? 'ملصقات الباركود' : 'QR Stickers', icon: Tag },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-tz-primary text-tz-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="space-y-4">

          {/* Template Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4 text-tz-primary" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{isRTL ? 'القالب' : 'Template'}</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {templates.map((template, index) => (
                <button
                  key={template.id}
                  onClick={async () => {
                    if (!workspaceId) return;
                    if (!subscriptionActive) { setShowSubscribe(true); return; }
                    await qrMenuAPI.updateMenu(workspaceId, { templateId: template.id });
                    await refreshMenu();
                  }}
                  className={`flex-shrink-0 w-40 rounded-xl border-2 overflow-hidden text-left transition-all relative hover:-translate-y-0.5 ${
                    menu.templateId === template.id
                      ? 'border-tz-primary shadow-md ring-2 ring-tz-primary/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <TemplateMiniPreview template={template} />
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-900 truncate">{isRTL ? `قالب ${index + 1}` : `Theme ${index + 1}`}</p>
                  </div>
                  {menu.templateId === template.id && (
                    <div className="absolute top-2 left-2 w-5 h-5 bg-tz-primary rounded-full flex items-center justify-center shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}

              {/* Request a custom menu — opens WhatsApp */}
              <a
                href={`https://wa.me/966501549458?text=${encodeURIComponent(
                  isRTL ? 'مرحباً، أرغب في طلب تصميم قائمة خاصة بي' : "Hi, I'd like to request my own custom menu",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 w-40 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden flex flex-col items-center justify-center text-center p-4 transition-all hover:-translate-y-0.5 hover:border-tz-primary hover:shadow-sm bg-gray-50/50"
              >
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-900 leading-snug">
                  {isRTL ? 'ما اعجبك ولا قالب هنا؟' : 'Request your own menu'}
                </p>
                <p className="text-[10px] text-gray-500 mt-1 leading-snug">
                  {isRTL ? 'لا تشيل هم ! تواصل معنا وبنوفر لك تصميم على رغبتك' : 'Chat with us on WhatsApp'}
                </p>
              </a>
            </div>
          </div>

          {/* Brand Colors Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <span className="text-base font-black text-tz-primary leading-none">◈</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{isRTL ? 'ألوان العلامة التجارية' : 'Brand Colors'}</h3>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: isRTL ? 'اللون الرئيسي' : 'Primary', val: customPrimary, set: setCustomPrimary },
                { label: isRTL ? 'لون التباين' : 'Accent',  val: customAccent,  set: setCustomAccent  },
              ].map((col, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{col.label}</span>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors">
                    <div className="relative w-6 h-6 shrink-0">
                      <div className="w-6 h-6 rounded-md border border-black/10" style={{ backgroundColor: col.val }} />
                      <input type="color" value={col.val} onChange={(e) => col.set(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full border-none" />
                    </div>
                    <input
                      type="text"
                      value={col.val.toUpperCase()}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) col.set(v.toLowerCase());
                      }}
                      onBlur={(e) => {
                        if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) col.set(col.val);
                      }}
                      maxLength={7}
                      className="w-20 text-xs font-mono text-gray-600 bg-transparent outline-none border-none"
                      spellCheck={false}
                    />
                  </div>
                </div>
              ))}
              <Button size="sm" onClick={handleColorUpdate}>{isRTL ? 'حفظ الألوان' : 'Save Colors'}</Button>
            </div>
          </div>

          {/* Featured Categories Section (Template 1 only) */}
          {(menu.templateId === 'noir' || menu.templateId === 'default') && menu.categories.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                  <span className="text-base font-black text-tz-primary leading-none">★</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{isRTL ? 'التصنيفات المميزة' : 'Featured Categories'}</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                {isRTL
                  ? 'اختر التصنيفات التي تريد إبرازها كبطاقات صور كبيرة في القائمة. التصنيفات غير المحددة تظهر كقائمة بسيطة بأسطر منقّطة.'
                  : 'Pick the categories you want to highlight as large photo cards on the menu. Unchecked categories appear as a simple dotted list.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {menu.categories.map((cat) => {
                  // Reflect what the menu actually shows: explicit grid/list wins,
                  // otherwise the auto heuristic (grid if >= half the items have photos).
                  const featured =
                    cat.displayStyle === 'grid'
                      ? true
                      : cat.displayStyle === 'list'
                      ? false
                      : (() => {
                          const items = cat.items.filter((i) => i.isAvailable !== false);
                          const withImg = items.filter((i) => i.imageUrl).length;
                          return items.length > 0 && withImg >= Math.ceil(items.length / 2);
                        })();
                  return (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer transition-colors ${
                        featured ? 'border-tz-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={featured}
                        className="w-4 h-4 accent-tz-primary cursor-pointer"
                        onChange={async (e) => {
                          if (!workspaceId) return;
                          if (!subscriptionActive) { setShowSubscribe(true); return; }
                          await qrMenuAPI.updateCategory(workspaceId, cat.id, { displayStyle: e.target.checked ? 'grid' : 'list' });
                          await refreshMenu();
                        }}
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Social Links Section (all templates) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Share2 className="w-4 h-4 text-tz-primary" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{isRTL ? 'روابط التواصل والموقع' : 'Social & Location Links'}</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              {isRTL
                ? 'روابط اختيارية تظهر كأيقونات في تذييل القائمة وعلى الملصقات. اترك الحقل فارغاً لإخفاء الأيقونة.'
                : 'Optional links shown as icons in the menu footer and on the stickers. Leave a field empty to hide its icon.'}
            </p>
            <div className="space-y-3">
              {[
                { icon: <Instagram className="w-4 h-4 text-gray-500" />, label: 'Instagram', val: instagramUrl, set: setInstagramUrl, ph: 'https://instagram.com/...' },
                { icon: <Music2 className="w-4 h-4 text-gray-500" />, label: 'TikTok', val: tiktokUrl, set: setTiktokUrl, ph: 'https://tiktok.com/@...' },
                { icon: <MapPin className="w-4 h-4 text-gray-500" />, label: isRTL ? 'خرائط جوجل' : 'Google Maps', val: googleMapsUrl, set: setGoogleMapsUrl, ph: 'https://maps.google.com/...' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-32 shrink-0">
                    {f.icon}
                    <span className="text-sm text-gray-700">{f.label}</span>
                  </div>
                  <input
                    type="url"
                    dir="ltr"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="flex-1 min-w-0 text-sm px-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:border-tz-primary/50 transition-colors"
                  />
                </div>
              ))}
              <Button size="sm" onClick={handleSocialUpdate} disabled={savingSocial}>
                {savingSocial ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الروابط' : 'Save Links')}
              </Button>
            </div>
          </div>

          {/* Images & Media Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-tz-primary" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{isRTL ? 'الصور والوسائط' : 'Images & Media'}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Logo */}
              <div className="group border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 text-center bg-gray-50/50 hover:border-tz-primary/40 hover:bg-orange-50/20 transition-all cursor-pointer">
                {menu.logoUrl ? (
                  <div className="relative">
                    <img src={getImageUrl(menu.logoUrl)} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                    <button onClick={handleRemoveLogo} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-tz-primary/40 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400 group-hover:text-tz-primary transition-colors" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{isRTL ? 'الشعار' : 'Logo'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">400 × 400 px</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                  <div className="px-4 py-1.5 border border-gray-200 bg-white rounded-full text-xs text-gray-600 hover:border-tz-primary/40 font-medium transition-colors">
                    {isRTL ? 'رفع' : 'Upload'}
                  </div>
                </label>
              </div>
              {/* Banner */}
              <div className="group border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 text-center bg-gray-50/50 hover:border-tz-primary/40 hover:bg-orange-50/20 transition-all cursor-pointer">
                {menu.bannerUrl ? (
                  <div className="relative">
                    <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                    <button onClick={handleRemoveBanner} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-tz-primary/40 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400 group-hover:text-tz-primary transition-colors" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{isRTL ? 'البانر العلوي' : 'Banner'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">1200 × 600 px</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadBanner} />
                  <div className="px-4 py-1.5 border border-gray-200 bg-white rounded-full text-xs text-gray-600 hover:border-tz-primary/40 font-medium transition-colors">
                    {isRTL ? 'رفع' : 'Upload'}
                  </div>
                </label>
              </div>
              {/* Background */}
              <div className="group border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 text-center bg-gray-50/50 hover:border-tz-primary/40 hover:bg-orange-50/20 transition-all cursor-pointer">
                {menu.backgroundUrl ? (
                  <div className="relative">
                    <img src={getImageUrl(menu.backgroundUrl)} alt="" className="w-14 h-14 rounded-xl object-cover border border-gray-200" />
                    <button onClick={handleRemoveBackground} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-tz-primary/40 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400 group-hover:text-tz-primary transition-colors" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{isRTL ? 'خلفية الصفحة' : 'Background'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{isRTL ? 'اختياري' : 'Optional'}</p>
                </div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleUploadBackground} />
                  <div className="px-4 py-1.5 border border-gray-200 bg-white rounded-full text-xs text-gray-600 hover:border-tz-primary/40 font-medium transition-colors">
                    {isRTL ? 'رفع' : 'Upload'}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4 text-tz-primary" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">{isRTL ? 'إعدادات عامة' : 'General Settings'}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
                </label>
                <input
                  type="text"
                  defaultValue={menu.titleAr}
                  onBlur={async (e) => {
                    if (!workspaceId) return;
                    if (!subscriptionActive) { setShowSubscribe(true); return; }
                    await qrMenuAPI.updateMenu(workspaceId, { titleAr: e.target.value });
                    await refreshMenu();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-tz-primary focus:ring-2 focus:ring-tz-primary/10 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {isRTL ? 'العنوان (English)' : 'Title (English)'}
                </label>
                <input
                  type="text"
                  defaultValue={menu.titleEn}
                  onBlur={async (e) => {
                    if (!workspaceId) return;
                    if (!subscriptionActive) { setShowSubscribe(true); return; }
                    await qrMenuAPI.updateMenu(workspaceId, { titleEn: e.target.value });
                    await refreshMenu();
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-tz-primary focus:ring-2 focus:ring-tz-primary/10 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col items-center gap-4 pt-2 pb-6">
            {!menu.isPublished && (
              <div className="relative inline-block rotate-[-1.2deg]">
                <div className="bg-yellow-200 px-4 py-3 rounded shadow-md border border-yellow-300 max-w-xs text-center"
                  style={{ boxShadow: '2px 3px 8px rgba(0,0,0,0.15)' }}>
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 shadow-sm border border-red-500" />
                  <p className="text-sm font-medium text-yellow-900 mt-1">
                    {isRTL
                      ? '📌 القائمة مخفية حالياً — فعّل الرؤية حتى يتمكن العملاء من الوصول إليها'
                      : '📌 Menu is hidden — enable visibility so customers can access it'}
                  </p>
                </div>
              </div>
            )}
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                size="lg"
                variant={menu.isPublished ? 'outline' : 'default'}
                onClick={handlePublishToggle}
                className="gap-2 min-w-[160px]"
              >
                {menu.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {menu.isPublished
                  ? (isRTL ? 'إخفاء القائمة' : 'Hide Menu')
                  : (isRTL ? 'إظهار القائمة' : 'Show Menu')}
              </Button>
              <Button variant="outline" asChild size="lg" className="gap-2">
                <a href={publicMenuUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4" />
                  {isRTL ? 'معاينة القائمة' : 'Preview Menu'}
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={isRTL ? 'اسم التصنيف' : 'Category Name'}
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <Button onClick={handleAddCategory} className="self-start sm:self-auto shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {menu.categories.map((cat, idx) => (
              <div key={cat.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-xl p-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-tz-primary/10 text-tz-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  {/* Category image thumbnail */}
                  <label className="relative cursor-pointer shrink-0 group" title={isRTL ? 'تحميل صورة التصنيف' : 'Upload category image'}>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group-hover:border-tz-primary flex items-center justify-center bg-gray-50 transition-colors">
                      {cat.imageUrl ? (
                        <img src={getImageUrl(cat.imageUrl)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-400 group-hover:text-tz-primary" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !workspaceId) return;
                        if (!subscriptionActive) { setShowSubscribe(true); return; }
                        const fd = new FormData();
                        fd.append('image', file);
                        await qrMenuAPI.uploadCategoryImage(cat.id, fd);
                        await refreshMenu();
                      }}
                    />
                  </label>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.items.length} items</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    disabled={idx === 0}
                    onClick={async () => {
                      if (!workspaceId || !menu || idx === 0) return;
                      if (!subscriptionActive) { setShowSubscribe(true); return; }
                      const reordered = [...menu.categories];
                      const [moved] = reordered.splice(idx, 1);
                      reordered.splice(idx - 1, 0, moved);
                      await Promise.all(
                        reordered.map((c, i) => qrMenuAPI.updateCategory(workspaceId, c.id, { sortOrder: i }))
                      );
                      await refreshMenu();
                    }}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    disabled={idx === menu.categories.length - 1}
                    onClick={async () => {
                      if (!workspaceId || !menu || idx === menu.categories.length - 1) return;
                      if (!subscriptionActive) { setShowSubscribe(true); return; }
                      const reordered = [...menu.categories];
                      const [moved] = reordered.splice(idx, 1);
                      reordered.splice(idx + 1, 0, moved);
                      await Promise.all(
                        reordered.map((c, i) => qrMenuAPI.updateCategory(workspaceId, c.id, { sortOrder: i }))
                      );
                      await refreshMenu();
                    }}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 h-9 w-9 sm:h-8 sm:w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium">{isRTL ? 'إضافة منتج' : 'Add Product'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <input
                  type="text"
                  placeholder={isRTL ? 'اسم المنتج' : 'Product Name'}
                  value={newItem.name}
                  onChange={(e) => { setNewItem({ ...newItem, name: e.target.value }); setNewItemErrors((p) => ({ ...p, name: undefined })); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${newItemErrors.name ? 'border-red-500' : ''}`}
                />
                {newItemErrors.name && (
                  <p className="text-red-500 text-xs">{newItemErrors.name}</p>
                )}
              </div>
              <input
                type="text"
                placeholder={isRTL ? 'الوصف' : 'Description'}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm sm:col-span-2"
              />
              <div className="space-y-1">
                <input
                  type="number"
                  placeholder={isRTL ? 'السعر' : 'Price'}
                  value={newItem.price}
                  onChange={(e) => { setNewItem({ ...newItem, price: e.target.value }); setNewItemErrors((p) => ({ ...p, price: undefined })); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${newItemErrors.price ? 'border-red-500' : ''}`}
                />
                {newItemErrors.price && <p className="text-red-500 text-xs">{newItemErrors.price}</p>}
              </div>
              <div className="space-y-1">
                <select
                  value={newItem.categoryId}
                  onChange={(e) => { setNewItem({ ...newItem, categoryId: e.target.value }); setNewItemErrors((p) => ({ ...p, categoryId: undefined })); }}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${newItemErrors.categoryId ? 'border-red-500' : ''}`}
                >
                  <option value="">{isRTL ? 'اختر التصنيف' : 'Select Category'}</option>
                  {menu.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {newItemErrors.categoryId && <p className="text-red-500 text-xs">{newItemErrors.categoryId}</p>}
              </div>
            </div>
            <DetailsEditor pairs={newItemDetails} setPairs={setNewItemDetails} isRTL={isRTL} />
            <div className="flex items-center gap-3">
              {newItemImagePreview ? (
                <div className="relative group shrink-0">
                  <img src={newItemImagePreview} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                  <button
                    type="button"
                    onClick={() => { setNewItemImage(null); setNewItemImagePreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-dashed border-gray-300">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setNewItemImage(file);
                    setNewItemImagePreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
                <div className="flex items-center gap-1.5 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50 text-gray-600">
                  <Upload className="w-4 h-4" />
                  {isRTL ? 'إضافة صورة (اختياري)' : 'Add Image (optional)'}
                </div>
              </label>
            </div>
            <Button onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              {isRTL ? 'إضافة منتج' : 'Add Product'}
            </Button>
          </div>

          <div className="space-y-4">
            {menu.categories.map((cat) => (
              <div key={cat.id}>
                <h3 className="font-medium text-lg mb-2">{cat.name}</h3>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className={`bg-white border rounded-xl p-4 transition-opacity ${!item.isAvailable ? 'opacity-50' : ''}`}>
                      {editingItem === item.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editItemData.name}
                              onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'الاسم' : 'Name'}
                            />
                            <input
                              type="number"
                              value={editItemData.price}
                              onChange={(e) => setEditItemData({ ...editItemData, price: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'السعر' : 'Price'}
                            />
                          </div>
                          <input
                            type="text"
                            value={editItemData.description}
                            onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder={isRTL ? 'الوصف' : 'Description'}
                          />
                          <DetailsEditor pairs={editItemDetails} setPairs={setEditItemDetails} isRTL={isRTL} />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleUpdateItem(item.id)}>
                              <Save className="w-3 h-3 mr-1" /> {isRTL ? 'حفظ' : 'Save'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setEditingItem(null); setEditItemData({}); setEditItemDetails([]); }}>
                              <X className="w-3 h-3 mr-1" /> {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex gap-3 w-full sm:w-auto">
                            {item.imageUrl ? (
                              <img src={getImageUrl(item.imageUrl)} alt="" className="w-14 h-14 rounded-lg object-cover border shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                              {parseDetailsPairs(item.details).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {parseDetailsPairs(item.details).map((pair, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                      {formatDetailLabel(pair, false)}: {formatDetailValue(pair, false)}
                                      {pair.keyEn && pair.keyEn !== pair.key && (
                                        <span className="text-gray-400"> / {formatDetailLabel(pair, true)}: {formatDetailValue(pair, true)}</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm font-bold text-tz-primary mt-1">{item.price} ريال</p>
                            </div>
                          </div>
                          <div className="flex gap-1 self-end sm:self-auto shrink-0">
                            <label className="cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadItemImage(item.id, e)} />
                              <Upload className="w-4 h-4 text-gray-500" />
                            </label>
                            <Button variant="ghost" size="icon" onClick={() => startEditItem(item)} className="h-9 w-9 sm:h-8 sm:w-8">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleToggleItemVisibility(item)} className={`h-9 w-9 sm:h-8 sm:w-8 ${item.isAvailable ? 'text-gray-400 hover:text-gray-600' : 'text-amber-500 hover:text-amber-600'}`} title={item.isAvailable ? 'Hide item' : 'Show item'}>
                              {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500 h-9 w-9 sm:h-8 sm:w-8">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Code Tab */}
      {activeTab === 'qr' && (
        <div className="text-center space-y-6">
          {/* Hidden high-res canvas for downloads */}
          <div ref={qrCanvasRef} className="absolute -left-[9999px] top-0">
            {publicMenuUrl && (
              <QRCodeCanvas
                value={publicMenuUrl}
                size={2048}
                level="M"
                includeMargin
                imageSettings={menu.logoUrl ? {
                  src: getImageUrl(menu.logoUrl),
                  height: 320,
                  width: 320,
                  excavate: true,
                } : undefined}
              />
            )}
          </div>

          <div className="bg-white border rounded-xl p-4 sm:p-8 inline-block max-w-full">
            <div className="mb-4 flex justify-center">
              {publicMenuUrl && (
                <QRCodeSVG
                  value={publicMenuUrl}
                  size={192}
                  level="M"
                  includeMargin
                  imageSettings={menu.logoUrl ? {
                    src: getImageUrl(menu.logoUrl),
                    height: 30,
                    width: 30,
                    excavate: true,
                  } : undefined}
                />
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{isRTL ? 'امسح الكود لعرض القائمة' : 'Scan to view menu'}</p>
            <p className="text-xs text-gray-400 break-all">{publicMenuUrl}</p>
          </div>

          {/* Download buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={downloadQRCodePNG} className="gap-2">
              <FileImage className="w-4 h-4" />
              {isRTL ? 'تحميل PNG' : 'Download PNG'}
            </Button>

          </div>

          <div className="space-y-2">
            <p className="font-medium">{isRTL ? 'رابط القائمة العام' : 'Public Menu URL'}</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                readOnly
                value={publicMenuUrl}
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50 min-w-0"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(publicMenuUrl);
                  alert(isRTL ? 'تم النسخ' : 'Copied!');
                }}
                className="w-full sm:w-auto"
              >
                {isRTL ? 'نسخ' : 'Copy'}
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* Stickers Tab */}
      {activeTab === 'stickers' && (
        <QRStickersTab
          publicMenuUrl={publicMenuUrl}
          isRTL={isRTL}
          workspaceName={workspaceName}
          instagramUrl={menu?.instagramUrl || undefined}
          tiktokUrl={menu?.tiktokUrl || undefined}
          googleMapsUrl={menu?.googleMapsUrl || undefined}
        />
      )}

      {showSubscribe && workspaceId && (
        <SubscriptionPopup workspaceId={workspaceId} onClose={() => setShowSubscribe(false)} />
      )}
    </div>
  );
}
