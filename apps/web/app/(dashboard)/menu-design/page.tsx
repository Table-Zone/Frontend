'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  QrCode, Plus, Loader2, Trash2, Edit2, Save, X, Palette,
  UtensilsCrossed, QrCodeIcon, Eye, Upload, ImageIcon,
  ArrowUp, ArrowDown, FileImage,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { qrMenuAPI, workspaceAPI, getImageUrl } from '@/lib/api';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import SubscriptionPopup from '@/components/shared/SubscriptionPopup';
import { DetailsEditor } from '@/components/menu/DetailsEditor';
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
  isPublished: boolean;
  categories: MenuCategory[];
}

function TemplateMiniPreview({ template, small }: { template: any; small?: boolean }) {
  const h = small ? 'h-16' : 'h-28';
  const scale = small ? 'scale-[0.55]' : 'scale-[0.85]';
  const origin = small ? 'origin-top-left' : 'origin-top-left';

  const noir = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        <div className="w-full px-3 pt-2">
          <div className="w-6 h-6 rounded-full mx-auto mb-1 border" style={{ borderColor: template.accentColor + '60' }} />
          <div className="h-px w-10 mx-auto mb-1" style={{ backgroundColor: template.accentColor + '40' }} />
          <div className="space-y-1">
            <div className="flex justify-between text-[8px]" style={{ color: template.accentColor }}><span>Item</span><span>10$</span></div>
            <div className="flex justify-between text-[8px]" style={{ color: template.accentColor + '80' }}><span>Item</span><span>15$</span></div>
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

  const taker = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        <div className="w-full px-3 pt-2">
          <div className="flex gap-1 mb-1">
            <div className="h-2.5 w-8 rounded-full" style={{ backgroundColor: template.accentColor }} />
            <div className="h-2.5 w-8 rounded-full" style={{ backgroundColor: template.accentColor + '20' }} />
          </div>
          <div className="grid grid-cols-3 gap-1">
            <div className="aspect-square rounded" style={{ backgroundColor: template.accentColor + '15' }} />
            <div className="aspect-square rounded" style={{ backgroundColor: template.accentColor + '15' }} />
            <div className="aspect-square rounded" style={{ backgroundColor: template.accentColor + '15' }} />
          </div>
        </div>
      </div>
    </div>
  );

  const bistro = (
    <div className={`${h} w-full relative overflow-hidden`} style={{ backgroundColor: template.primaryColor }}>
      <div className={`absolute top-0 left-0 w-[180px] ${origin} ${scale}`}>
        <div className="w-full px-3 pt-2">
          <div className="text-center mb-1">
            <div className="h-1 w-10 mx-auto rounded" style={{ backgroundColor: template.accentColor + '30' }} />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[8px]" style={{ color: template.accentColor }}>Item</span>
              <div className="flex-1 border-b" style={{ borderStyle: 'dotted', borderColor: template.accentColor + '30' }} />
              <span className="text-[8px]" style={{ color: template.accentColor + '80' }}>12$</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[8px]" style={{ color: template.accentColor }}>Item</span>
              <div className="flex-1 border-b" style={{ borderStyle: 'dotted', borderColor: template.accentColor + '30' }} />
              <span className="text-[8px]" style={{ color: template.accentColor + '80' }}>18$</span>
            </div>
          </div>
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
    case 'taker':
      return taker;
    case 'bistro':
      return bistro;
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
  const [activeTab, setActiveTab] = useState<'design' | 'categories' | 'items' | 'qr'>('design');

  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', nameEn: '' });
  const [newItem, setNewItem] = useState({
    name: '', nameEn: '', description: '', descriptionEn: '', price: '', categoryId: '',
  });
  const [newItemDetails, setNewItemDetails] = useState<MenuDetailPair[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<any>({});
  const [editItemDetails, setEditItemDetails] = useState<MenuDetailPair[]>([]);

  // Colors
  const [customPrimary, setCustomPrimary] = useState('');
  const [customAccent, setCustomAccent] = useState('');

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
          const hasQr = workspace.subscription?.features?.includes('qrcode') ?? false;
          setSubscriptionActive(hasQr);
          const menuRes = await qrMenuAPI.getMenu(workspace.id);
          const realMenu = menuRes.data?.data?.menu || null;
          if (realMenu) {
            setMenu(realMenu);
            setCustomPrimary(realMenu.primaryColor);
            setCustomAccent(realMenu.accentColor);
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
    if (!workspaceId || !newItem.name || !newItem.price || !newItem.categoryId) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.createItem(workspaceId, newItem.categoryId, {
      name: newItem.name,
      nameEn: newItem.nameEn || undefined,
      description: newItem.description || undefined,
      descriptionEn: newItem.descriptionEn || undefined,
      price: parseFloat(newItem.price),
      details: buildDetailsPayload(newItemDetails),
    });
    await refreshMenu();
    setNewItem({ name: '', nameEn: '', description: '', descriptionEn: '', price: '', categoryId: '' });
    setNewItemDetails([]);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!workspaceId || !confirm('Delete this item?')) return;
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    await qrMenuAPI.deleteItem(workspaceId, itemId);
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
        <h1 className="text-xl sm:text-2xl font-bold text-tz-espresso">
          {isRTL ? 'تصميم القائمة' : 'Menu Design'}
        </h1>
        <div className="flex gap-2">
          <Button variant={menu.isPublished ? 'default' : 'outline'} onClick={handlePublishToggle}>
            {menu.isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'نشر القائمة' : 'Publish Menu')}
          </Button>
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
          { key: 'qr', label: isRTL ? 'QR Code' : 'QR Code', icon: QrCodeIcon },
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
        <div className="space-y-6">
          {/* Templates */}
          <div className="space-y-2">
            <h3 className="font-medium">{isRTL ? 'القالب' : 'Template'}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={async () => {
                    if (!workspaceId) return;
                    if (!subscriptionActive) { setShowSubscribe(true); return; }
                    await qrMenuAPI.updateMenu(workspaceId, { templateId: template.id });
                    await refreshMenu();
                  }}
                  className={`rounded-xl border-2 overflow-hidden text-left transition-all relative ${
                    menu.templateId === template.id
                      ? 'border-tz-primary shadow-md ring-2 ring-tz-primary/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <TemplateMiniPreview template={template} small />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{isRTL ? template.nameAr : template.nameEn}</p>
                  </div>
                  {menu.templateId === template.id && (
                    <div className={`absolute top-1.5 w-5 h-5 bg-tz-primary rounded-full flex items-center justify-center ${isRTL ? 'left-1.5' : 'right-1.5'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium">{isRTL ? 'الألوان المخصصة' : 'Custom Colors'}</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">{isRTL ? 'اللون الرئيسي' : 'Primary'}</label>
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-500">{customPrimary}</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">{isRTL ? 'لون التباين' : 'Accent'}</label>
                <input
                  type="color"
                  value={customAccent}
                  onChange={(e) => setCustomAccent(e.target.value)}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-500">{customAccent}</span>
              </div>
              <Button size="sm" onClick={handleColorUpdate}>{isRTL ? 'حفظ الألوان' : 'Save Colors'}</Button>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h3 className="font-medium">{isRTL ? 'الصور' : 'Images'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Logo */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{isRTL ? 'الشعار' : 'Logo'}</label>
                <div className="flex items-center gap-3">
                  {menu.logoUrl ? (
                    <div className="relative group">
                      <img src={getImageUrl(menu.logoUrl)} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title={isRTL ? 'حذف' : 'Remove'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
                    <div className="flex items-center gap-1 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      {isRTL ? 'رفع' : 'Upload'}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-400">{isRTL ? 'الحجم المثالي: 400 × 400 بكسل (مربع)' : 'Best size: 400 × 400px (square)'}</p>
              </div>
              {/* Banner */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{isRTL ? 'بانر العلوي' : 'Banner'}</label>
                <div className="flex items-center gap-3">
                  {menu.bannerUrl ? (
                    <div className="relative group">
                      <img src={getImageUrl(menu.bannerUrl)} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                      <button
                        onClick={handleRemoveBanner}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title={isRTL ? 'حذف' : 'Remove'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadBanner} />
                    <div className="flex items-center gap-1 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      {isRTL ? 'رفع' : 'Upload'}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-400">{isRTL ? 'الحجم المثالي: 1200 × 600 بكسل (عرضي). يظهر في أعلى القائمة.' : 'Best size: 1200 × 600px (landscape). Appears at top of menu.'}</p>
              </div>
              {/* Background */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{isRTL ? 'خلفية الصفحة' : 'Background'}</label>
                <div className="flex items-center gap-3">
                  {menu.backgroundUrl ? (
                    <div className="relative group">
                      <img src={getImageUrl(menu.backgroundUrl)} alt="" className="w-16 h-16 rounded-lg object-cover border" />
                      <button
                        onClick={handleRemoveBackground}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        title={isRTL ? 'حذف' : 'Remove'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadBackground} />
                    <div className="flex items-center gap-1 px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      {isRTL ? 'رفع' : 'Upload'}
                    </div>
                  </label>
                </div>
                <p className="text-xs text-gray-400">{isRTL ? 'اختياري. يغطي كامل الصفحة خلف القائمة.' : 'Optional. Full page backdrop behind menu.'}</p>
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="font-medium">{isRTL ? 'إعدادات عامة' : 'General Settings'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  defaultValue={menu.titleAr}
                  onBlur={async (e) => {
                    if (!workspaceId) return;
                    if (!subscriptionActive) { setShowSubscribe(true); return; }
                    await qrMenuAPI.updateMenu(workspaceId, { titleAr: e.target.value });
                    await refreshMenu();
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">{isRTL ? 'العنوان (English)' : 'Title (English)'}</label>
                <input
                  type="text"
                  defaultValue={menu.titleEn}
                  onBlur={async (e) => {
                    if (!workspaceId) return;
                    if (!subscriptionActive) { setShowSubscribe(true); return; }
                    await qrMenuAPI.updateMenu(workspaceId, { titleEn: e.target.value });
                    await refreshMenu();
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview Button */}
          <div className="flex justify-center pt-2">
            <Button variant="outline" asChild size="lg" className="gap-2">
              <a href={publicMenuUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="w-5 h-5" />
                {isRTL ? 'معاينة القائمة' : 'Preview Menu'}
              </a>
            </Button>
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
            <input
              type="text"
              placeholder={isRTL ? 'Name (English)' : 'Name (English)'}
              value={newCategory.nameEn}
              onChange={(e) => setNewCategory({ ...newCategory, nameEn: e.target.value })}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <Button onClick={handleAddCategory} className="self-start sm:self-auto shrink-0"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {menu.categories.map((cat, idx) => (
              <div key={cat.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-xl p-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-tz-primary/10 text-tz-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    {cat.nameEn && <p className="text-sm text-gray-500">{cat.nameEn}</p>}
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
              <input
                type="text"
                placeholder={isRTL ? 'اسم المنتج (عربي)' : 'Product Name (Arabic)'}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder={isRTL ? 'اسم المنتج (إنجليزي)' : 'Product Name (English)'}
                value={newItem.nameEn}
                onChange={(e) => setNewItem({ ...newItem, nameEn: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder={isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder={isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                value={newItem.descriptionEn}
                onChange={(e) => setNewItem({ ...newItem, descriptionEn: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder={isRTL ? 'السعر' : 'Price'}
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <select
                value={newItem.categoryId}
                onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">{isRTL ? 'اختر التصنيف' : 'Select Category'}</option>
                {menu.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <DetailsEditor pairs={newItemDetails} setPairs={setNewItemDetails} isRTL={isRTL} />
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
                    <div key={item.id} className="bg-white border rounded-xl p-4">
                      {editingItem === item.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editItemData.name}
                              onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
                            />
                            <input
                              type="text"
                              value={editItemData.nameEn}
                              onChange={(e) => setEditItemData({ ...editItemData, nameEn: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
                            />
                            <input
                              type="number"
                              value={editItemData.price}
                              onChange={(e) => setEditItemData({ ...editItemData, price: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'السعر' : 'Price'}
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editItemData.description}
                              onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                            />
                            <input
                              type="text"
                              value={editItemData.descriptionEn}
                              onChange={(e) => setEditItemData({ ...editItemData, descriptionEn: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                              placeholder={isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                            />
                          </div>
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
                              {item.nameEn && <p className="text-sm text-gray-500">{item.nameEn}</p>}
                              {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                              {item.descriptionEn && <p className="text-sm text-gray-400">{item.descriptionEn}</p>}
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

      {showSubscribe && workspaceId && (
        <SubscriptionPopup workspaceId={workspaceId} onClose={() => setShowSubscribe(false)} />
      )}
    </div>
  );
}
