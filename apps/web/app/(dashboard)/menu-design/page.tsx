'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  QrCode, Plus, Loader2, Trash2, Edit2, Save, X, Palette,
  UtensilsCrossed, QrCodeIcon, Eye, Upload, ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { qrMenuAPI, workspaceAPI } from '@/lib/api';
import { QRCodeSVG } from 'qrcode.react';

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
  titleAr: string;
  titleEn: string;
  isPublished: boolean;
  categories: MenuCategory[];
}

export default function MenuDesignPage() {
  const { t, isRTL } = useLanguage();
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'categories' | 'items' | 'qr'>('design');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');

  // Form states
  const [newCategory, setNewCategory] = useState({ name: '', nameEn: '' });
  const [newItem, setNewItem] = useState({
    name: '', nameEn: '', description: '', price: '', categoryId: '',
  });
  const [newItemDetails, setNewItemDetails] = useState<{ key: string; value: string }[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<any>({});
  const [editItemDetails, setEditItemDetails] = useState<{ key: string; value: string }[]>([]);

  // Colors
  const [customPrimary, setCustomPrimary] = useState('');
  const [customAccent, setCustomAccent] = useState('');

  const refreshMenu = useCallback(async () => {
    if (!workspaceId) return;
    const res = await qrMenuAPI.getMenu(workspaceId);
    setMenu(res.data?.menu || null);
  }, [workspaceId]);

  useEffect(() => {
    const init = async () => {
      try {
        const [wsRes, templatesRes] = await Promise.all([
          workspaceAPI.getMyWorkspace(),
          qrMenuAPI.getTemplates(),
        ]);
        const workspace = wsRes.data?.data;
        if (workspace?.id) {
          setWorkspaceId(workspace.id);
          setWorkspaceSlug(workspace.slug);
          const menuRes = await qrMenuAPI.getMenu(workspace.id);
          setMenu(menuRes.data?.menu || null);
          if (menuRes.data?.menu) {
            setCustomPrimary(menuRes.data.menu.primaryColor);
            setCustomAccent(menuRes.data.menu.accentColor);
          }
        }
        setTemplates(templatesRes.data?.templates || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleCreateMenu = async () => {
    if (!workspaceId) return;
    try {
      const res = await qrMenuAPI.createMenu(workspaceId, { templateId: selectedTemplate });
      setMenu(res.data?.menu || null);
      if (res.data?.menu) {
        setCustomPrimary(res.data.menu.primaryColor);
        setCustomAccent(res.data.menu.accentColor);
      }
    } catch {
      alert('Failed to create menu');
    }
  };

  const handleAddCategory = async () => {
    if (!workspaceId || !newCategory.name) return;
    await qrMenuAPI.createCategory(workspaceId, newCategory);
    await refreshMenu();
    setNewCategory({ name: '', nameEn: '' });
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!workspaceId || !confirm('Delete this category and all its items?')) return;
    await qrMenuAPI.deleteCategory(workspaceId, categoryId);
    await refreshMenu();
  };

  const buildDetailsObject = (pairs: { key: string; value: string }[]) => {
    const obj: any = {};
    pairs.forEach((p) => { if (p.key) obj[p.key] = p.value; });
    return obj;
  };

  const parseDetailsPairs = (details?: any): { key: string; value: string }[] => {
    if (!details || typeof details !== 'object') return [];
    return Object.entries(details).map(([k, v]) => ({ key: k, value: String(v) }));
  };

  const handleAddItem = async () => {
    if (!workspaceId || !newItem.name || !newItem.price || !newItem.categoryId) return;
    await qrMenuAPI.createItem(workspaceId, newItem.categoryId, {
      name: newItem.name,
      nameEn: newItem.nameEn || undefined,
      description: newItem.description || undefined,
      price: parseFloat(newItem.price),
      details: buildDetailsObject(newItemDetails),
    });
    await refreshMenu();
    setNewItem({ name: '', nameEn: '', description: '', price: '', categoryId: '' });
    setNewItemDetails([]);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!workspaceId || !confirm('Delete this item?')) return;
    await qrMenuAPI.deleteItem(workspaceId, itemId);
    await refreshMenu();
  };

  const startEditItem = (item: MenuItem) => {
    setEditingItem(item.id);
    setEditItemData({
      name: item.name,
      nameEn: item.nameEn || '',
      description: item.description || '',
      price: item.price,
    });
    setEditItemDetails(parseDetailsPairs(item.details));
  };

  const handleUpdateItem = async (itemId: string) => {
    if (!workspaceId) return;
    await qrMenuAPI.updateItem(workspaceId, itemId, {
      ...editItemData,
      price: parseFloat(editItemData.price),
      details: buildDetailsObject(editItemDetails),
    });
    await refreshMenu();
    setEditingItem(null);
    setEditItemData({});
    setEditItemDetails([]);
  };

  const handlePublishToggle = async () => {
    if (!workspaceId || !menu) return;
    await qrMenuAPI.updateMenu(workspaceId, { isPublished: !menu.isPublished });
    await refreshMenu();
  };

  const handleColorUpdate = async () => {
    if (!workspaceId) return;
    await qrMenuAPI.updateMenu(workspaceId, {
      primaryColor: customPrimary,
      accentColor: customAccent,
    });
    await refreshMenu();
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    await qrMenuAPI.uploadLogo(workspaceId, fd);
    await refreshMenu();
  };

  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('image', e.target.files[0]);
    await qrMenuAPI.uploadBanner(workspaceId, fd);
    await refreshMenu();
  };

  const handleUploadItemImage = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
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

  // Template selection screen
  if (!menu) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-tz-espresso">
            {isRTL ? 'تصميم القائمة' : 'Menu Design'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL
              ? 'اختر تصميماً لقائمتك وابدأ بإضافة منتجاتك'
              : 'Choose a design for your menu and start adding your products'}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                selectedTemplate === template.id
                  ? 'border-tz-primary shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className="h-24 rounded-lg mb-3 flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: template.primaryColor, fontFamily: template.fontFamily }}
              >
                <span style={{ color: template.accentColor }}>
                  {isRTL ? template.nameAr : template.nameEn}
                </span>
              </div>
              <p className="font-medium text-sm">{isRTL ? template.nameAr : template.nameEn}</p>
              <div className="flex gap-2 mt-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.primaryColor }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: template.accentColor }} />
              </div>
            </button>
          ))}
        </div>
        <div className="text-center">
          <Button onClick={handleCreateMenu} className="gap-2">
            <Plus className="w-4 h-4" />
            {isRTL ? 'إنشاء القائمة' : 'Create Menu'}
          </Button>
        </div>
      </div>
    );
  }

  const publicMenuUrl = workspaceSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/menu/${workspaceSlug}`
    : '';

  const DetailsEditor = ({
    pairs,
    setPairs,
  }: {
    pairs: { key: string; value: string }[];
    setPairs: (p: { key: string; value: string }[]) => void;
  }) => (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">{isRTL ? 'التفاصيل (مثال: بروتين، سعرات...)' : 'Details (e.g. Protein, Calories...)'}</p>
      {pairs.map((pair, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            type="text"
            placeholder={isRTL ? 'الاسم' : 'Name'}
            value={pair.key}
            onChange={(e) => {
              const next = [...pairs];
              next[idx].key = e.target.value;
              setPairs(next);
            }}
            className="flex-1 px-2 py-1 border rounded text-sm"
          />
          <input
            type="text"
            placeholder={isRTL ? 'القيمة' : 'Value'}
            value={pair.value}
            onChange={(e) => {
              const next = [...pairs];
              next[idx].value = e.target.value;
              setPairs(next);
            }}
            className="flex-1 px-2 py-1 border rounded text-sm"
          />
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 h-8 w-8"
            onClick={() => setPairs(pairs.filter((_, i) => i !== idx))}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPairs([...pairs, { key: '', value: '' }])}
        className="gap-1"
      >
        <Plus className="w-3 h-3" />
        {isRTL ? 'إضافة تفصيل' : 'Add Detail'}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-tz-espresso">
          {isRTL ? 'تصميم القائمة' : 'Menu Design'}
        </h1>
        <div className="flex gap-2">
          <Button variant={menu.isPublished ? 'default' : 'outline'} onClick={handlePublishToggle}>
            {menu.isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'نشر القائمة' : 'Publish Menu')}
          </Button>
          <Button variant="outline" asChild>
            <a href={publicMenuUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
              <Eye className="w-4 h-4" />
              {isRTL ? 'معاينة' : 'Preview'}
            </a>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-1">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={async () => {
                    if (!workspaceId) return;
                    await qrMenuAPI.updateMenu(workspaceId, { templateId: template.id });
                    await refreshMenu();
                  }}
                  className={`rounded-xl border-2 p-3 text-left transition-all ${
                    menu.templateId === template.id
                      ? 'border-tz-primary shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="h-16 rounded-lg mb-2 flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: template.primaryColor }}
                  >
                    <span style={{ color: template.accentColor }}>
                      {isRTL ? template.nameAr : template.nameEn}
                    </span>
                  </div>
                  <p className="text-xs font-medium">{isRTL ? template.nameAr : template.nameEn}</p>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Logo */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{isRTL ? 'الشعار' : 'Logo'}</label>
                <div className="flex items-center gap-3">
                  {menu.logoUrl ? (
                    <img src={menu.logoUrl} alt="" className="w-16 h-16 rounded-lg object-cover border" />
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
              </div>
              {/* Banner */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600">{isRTL ? 'الصورة الرئيسية' : 'Banner'}</label>
                <div className="flex items-center gap-3">
                  {menu.bannerUrl ? (
                    <img src={menu.bannerUrl} alt="" className="w-16 h-16 rounded-lg object-cover border" />
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
                    await qrMenuAPI.updateMenu(workspaceId, { titleEn: e.target.value });
                    await refreshMenu();
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex gap-2">
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
            <Button onClick={handleAddCategory}><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="space-y-2">
            {menu.categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between bg-white border rounded-xl p-4">
                <div>
                  <p className="font-medium">{cat.name}</p>
                  {cat.nameEn && <p className="text-sm text-gray-500">{cat.nameEn}</p>}
                  <p className="text-xs text-gray-400">{cat.items.length} items</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="text-red-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder={isRTL ? 'اسم المنتج' : 'Product Name'}
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder={isRTL ? 'الوصف' : 'Description'}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
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
            <DetailsEditor pairs={newItemDetails} setPairs={setNewItemDetails} />
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
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editItemData.name}
                              onChange={(e) => setEditItemData({ ...editItemData, name: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              value={editItemData.price}
                              onChange={(e) => setEditItemData({ ...editItemData, price: e.target.value })}
                              className="px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            value={editItemData.description}
                            onChange={(e) => setEditItemData({ ...editItemData, description: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder={isRTL ? 'الوصف' : 'Description'}
                          />
                          <DetailsEditor pairs={editItemDetails} setPairs={setEditItemDetails} />
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
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover border shrink-0" />
                            ) : (
                              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                <ImageIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                              {item.details && Object.keys(item.details).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(item.details).map(([k, v]) => (
                                    <span key={k} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                                      {k}: {String(v)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-sm font-bold text-tz-primary mt-1">{item.price} ريال</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <label className="cursor-pointer">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUploadItemImage(item.id, e)} />
                              <div className="p-2 hover:bg-gray-100 rounded-lg">
                                <Upload className="w-4 h-4 text-gray-500" />
                              </div>
                            </label>
                            <Button variant="ghost" size="icon" onClick={() => startEditItem(item)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500">
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
          <div className="bg-white border rounded-xl p-8 inline-block">
            <div className="mb-4 flex justify-center">
              {publicMenuUrl && (
                <QRCodeSVG
                  value={publicMenuUrl}
                  size={192}
                  level="M"
                  includeMargin
                  imageSettings={menu.logoUrl ? {
                    src: menu.logoUrl,
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

          <div className="space-y-2">
            <p className="font-medium">{isRTL ? 'رابط القائمة العام' : 'Public Menu URL'}</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="text"
                readOnly
                value={publicMenuUrl}
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(publicMenuUrl);
                  alert(isRTL ? 'تم النسخ' : 'Copied!');
                }}
              >
                {isRTL ? 'نسخ' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
