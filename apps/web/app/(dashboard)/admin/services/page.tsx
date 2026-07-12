'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, Plus, Pencil, Trash2, Eye, EyeOff, Upload, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI, getImageUrl } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-muted-foreground -mb-2">
      {children}
    </p>
  );
}

const PRODUCT_FEATURES = [
  { key: 'tables', labelAr: 'إدارة الطاولات', labelEn: 'Table management' },
  { key: 'qrcode', labelAr: 'قائمة QR', labelEn: 'QR Menu' },
] as const;

function featureLabel(key: string, isRTL: boolean) {
  const feature = PRODUCT_FEATURES.find((f) => f.key === key);
  if (feature) return isRTL ? feature.labelAr : feature.labelEn;
  return key;
}

function BenefitsList({
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  addLabel: string;
}) {
  const updateItem = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={placeholder}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
            <X className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, ''])}
      >
        <Plus className="w-4 h-4 me-2" />
        {addLabel}
      </Button>
    </div>
  );
}

interface ServiceTexts {
  benefitsAr: string[];
  benefitsEn: string[];
}

interface Service {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  priceSar: number;
  displayPriceSar: number | null;
  discountPercent: number;
  durationDays: number;
  baseStaffSeats: number;
  extraStaffSeatPriceSar: number;
  features: string[];
  texts: ServiceTexts;
  imageUrl: string | null;
  iconUrl: string | null;
  isActive: boolean;
  isVisible: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: '',
  labelAr: '',
  labelEn: '',
  descriptionAr: '',
  descriptionEn: '',
  priceSar: 0,
  displayPriceSar: 0,
  discountPercent: 0,
  durationDays: 30,
  baseStaffSeats: 1,
  extraStaffSeatPriceSar: 50,
  features: [] as string[],
  benefitsAr: [''],
  benefitsEn: [''],
  imageUrl: '',
  iconUrl: '',
  isActive: true,
  isVisible: true,
};

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingIcon, setPendingIcon] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await adminAPI.getServices();
      setServices(res.data.data.services || []);
    } catch {
      showToast(isRTL ? 'فشل التحميل' : 'Failed to load', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchServices();
  }, [user]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setPendingImage(null);
    setPendingIcon(null);
    setImagePreview(null);
    setIconPreview(null);
    setDialogOpen(true);
  };

  const openEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      labelAr: service.labelAr,
      labelEn: service.labelEn,
      descriptionAr: service.descriptionAr,
      descriptionEn: service.descriptionEn,
      priceSar: service.priceSar,
      displayPriceSar: service.displayPriceSar || 0,
      discountPercent: service.discountPercent,
      durationDays: service.durationDays,
      baseStaffSeats: service.baseStaffSeats,
      extraStaffSeatPriceSar: service.extraStaffSeatPriceSar,
      features: service.features,
      benefitsAr: service.texts?.benefitsAr?.length ? service.texts.benefitsAr : [''],
      benefitsEn: service.texts?.benefitsEn?.length ? service.texts.benefitsEn : [''],
      imageUrl: service.imageUrl || '',
      iconUrl: service.iconUrl || '',
      isActive: service.isActive,
      isVisible: service.isVisible,
    });
    setPendingImage(null);
    setPendingIcon(null);
    setImagePreview(service.imageUrl ? getImageUrl(service.imageUrl) : null);
    setIconPreview(service.iconUrl ? getImageUrl(service.iconUrl) : null);
    setDialogOpen(true);
  };

  const uploadPendingFiles = async (serviceId: string) => {
    if (pendingImage) {
      const fd = new FormData();
      fd.append('image', pendingImage);
      await adminAPI.uploadServiceImage(serviceId, fd);
    }
    if (pendingIcon) {
      const fd = new FormData();
      fd.append('image', pendingIcon);
      await adminAPI.uploadServiceIcon(serviceId, fd);
    }
  };

  const handleImageSelect = async (file: File | null) => {
    if (!file) return;
    setPendingImage(file);
    setImagePreview(URL.createObjectURL(file));
    if (editingId) {
      const fd = new FormData();
      fd.append('image', file);
      try {
        await adminAPI.uploadServiceImage(editingId, fd);
        setPendingImage(null);
        showToast(isRTL ? 'تم رفع الصورة' : 'Image uploaded', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.error?.message || 'Error', 'error');
      }
    }
  };

  const handleIconSelect = async (file: File | null) => {
    if (!file) return;
    setPendingIcon(file);
    setIconPreview(URL.createObjectURL(file));
    if (editingId) {
      const fd = new FormData();
      fd.append('image', file);
      try {
        await adminAPI.uploadServiceIcon(editingId, fd);
        setPendingIcon(null);
        showToast(isRTL ? 'تم رفع الأيقونة' : 'Icon uploaded', 'success');
      } catch (err: any) {
        showToast(err.response?.data?.error?.message || 'Error', 'error');
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        displayPriceSar: form.displayPriceSar || undefined,
        features: form.features,
        texts: {
          benefitsAr: form.benefitsAr.map((s) => s.trim()).filter(Boolean),
          benefitsEn: form.benefitsEn.map((s) => s.trim()).filter(Boolean),
        },
      };
      const { benefitsAr, benefitsEn, ...savePayload } = payload;
      if (editingId) {
        const { name, ...updateData } = savePayload;
        await adminAPI.updateService(editingId, updateData);
        await uploadPendingFiles(editingId);
      } else {
        const res = await adminAPI.createService(savePayload);
        const newId = res.data.data.service?.id;
        if (newId) await uploadPendingFiles(newId);
      }
      showToast(isRTL ? 'تم الحفظ' : 'Saved', 'success');
      setDialogOpen(false);
      fetchServices();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (service: Service) => {
    try {
      await adminAPI.updateService(service.id, { isVisible: !service.isVisible });
      fetchServices();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      await adminAPI.updateService(service.id, { isActive: !service.isActive });
      fetchServices();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  const toggleFeature = (key: string) => {
    const has = form.features.includes(key);
    const next = has
      ? form.features.filter((f) => f !== key)
      : [...form.features, key];
    setForm({ ...form, features: next });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: isRTL ? 'حذف الخدمة' : 'Delete Service',
      message: isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
      confirmLabel: isRTL ? 'حذف' : 'Delete',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.deleteService(id);
      showToast(isRTL ? 'تم الحذف' : 'Deleted', 'success');
      fetchServices();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={isRTL ? 'إدارة الخدمات' : 'Services Management'}
        icon={Package}
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 me-2" />
            {isRTL ? 'إضافة خدمة' : 'Add Service'}
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <motion.div
              key={service.id}
              className="bg-white rounded-2xl border border-tz-cream-dark p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex gap-3">
                  {(service.imageUrl || service.iconUrl) && (
                    <div className="flex gap-2 shrink-0">
                      {service.imageUrl && (
                        <img
                          src={getImageUrl(service.imageUrl)}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border"
                        />
                      )}
                      {service.iconUrl && (
                        <img
                          src={getImageUrl(service.iconUrl)}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border"
                        />
                      )}
                    </div>
                  )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{isRTL ? service.labelAr : service.labelEn}</p>
                    {!service.isActive && <Badge variant="secondary">{isRTL ? 'معطلة' : 'Disabled'}</Badge>}
                    {!service.isVisible && <Badge variant="outline">{isRTL ? 'مخفية' : 'Hidden'}</Badge>}
                    {service.discountPercent > 0 && <Badge variant="warning">-{service.discountPercent}%</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{service.name}</p>
                  <p className="text-sm mt-1">
                    <span className="font-bold text-tz-primary">{service.priceSar} SAR</span>
                    {service.displayPriceSar && (
                      <span className="line-through text-muted-foreground ms-2">{service.displayPriceSar} SAR</span>
                    )}
                    <span className="text-muted-foreground ms-2">/ {service.durationDays} {isRTL ? 'يوم' : 'days'}</span>
                  </p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {service.features.length === 0 ? (
                      <Badge variant="outline">{isRTL ? 'بدون صلاحيات' : 'No access'}</Badge>
                    ) : (
                      service.features.map((f) => (
                        <Badge key={f} variant="outline">{featureLabel(f, isRTL)}</Badge>
                      ))
                    )}
                  </div>
                  {(service.texts?.benefitsAr?.length || service.texts?.benefitsEn?.length) ? (
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {(isRTL ? service.texts.benefitsAr : service.texts.benefitsEn).slice(0, 3).map((benefit) => (
                        <li key={benefit}>• {benefit}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => toggleVisibility(service)}>
                    {service.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(service)}>
                    {service.isActive ? (isRTL ? 'تعطيل' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => openEdit(service)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? (isRTL ? 'تعديل خدمة' : 'Edit Service') : (isRTL ? 'إضافة خدمة' : 'Add Service')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {!editingId && (
              <>
                <Input placeholder={isRTL ? 'المعرف (monthly-tables)' : 'Slug (monthly-tables)'} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <FieldHint>
                  {isRTL
                    ? 'ابدأ المعرف بـ monthly- أو quarterly- ليظهر في الصفحة الرئيسية ضمن الفترة المناسبة'
                    : 'Start slug with monthly- or quarterly- to show on the homepage under the matching period'}
                </FieldHint>
              </>
            )}
            <Input placeholder={isRTL ? 'الاسم بالعربي' : 'Arabic name'} value={form.labelAr} onChange={(e) => setForm({ ...form, labelAr: e.target.value })} />
            <Input placeholder={isRTL ? 'الاسم بالإنجليزي' : 'English name'} value={form.labelEn} onChange={(e) => setForm({ ...form, labelEn: e.target.value })} />
            <Input placeholder={isRTL ? 'الوصف بالعربي' : 'Arabic description'} value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
            <Input placeholder={isRTL ? 'الوصف بالإنجليزي' : 'English description'} value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'السعر النهائي للخدمة (بالريال)' : 'Final price for this service (SAR)'}</FieldHint>
              <Input type="number" placeholder={isRTL ? 'السعر' : 'Price'} value={form.priceSar} onChange={(e) => setForm({ ...form, priceSar: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'السعر قبل الخصم (يظهر مشطوب — اختياري)' : 'Original price (shown as crossed out — optional)'}</FieldHint>
              <Input type="number" placeholder={isRTL ? 'سعر العرض' : 'Display price'} value={form.displayPriceSar} onChange={(e) => setForm({ ...form, displayPriceSar: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'نسبة الخصم من 0 إلى 100' : 'Discount percentage (0–100)'}</FieldHint>
              <Input type="number" placeholder={isRTL ? 'نسبة الخصم %' : 'Discount %'} value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'مدة الاشتراك بالأيام (مثال: 30 أو 90)' : 'Subscription duration in days (e.g., 30 or 90)'}</FieldHint>
              <Input type="number" placeholder={isRTL ? 'المدة (أيام)' : 'Duration (days)'} value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) || 30 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'عدد مقاعد الموظفين الأساسية' : 'Base staff seats included'}</FieldHint>
                <Input type="number" min={1} value={form.baseStaffSeats} onChange={(e) => setForm({ ...form, baseStaffSeats: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'سعر المقعد الإضافي (ريال)' : 'Extra seat price (SAR)'}</FieldHint>
                <Input type="number" min={0} value={form.extraStaffSeatPriceSar} onChange={(e) => setForm({ ...form, extraStaffSeatPriceSar: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'صورة الخدمة' : 'Service image'}</FieldHint>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-tz-cream-dark rounded-xl p-4 cursor-pointer hover:bg-tz-cream/50 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-full h-24 object-cover rounded-lg" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{isRTL ? 'اضغط لرفع صورة' : 'Click to upload'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleImageSelect(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              <div className="space-y-2">
                <FieldHint>{isRTL ? 'أيقونة الخدمة' : 'Service icon'}</FieldHint>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-tz-cream-dark rounded-xl p-4 cursor-pointer hover:bg-tz-cream/50 transition-colors">
                  {iconPreview ? (
                    <img src={iconPreview} alt="" className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{isRTL ? 'اضغط لرفع أيقونة' : 'Click to upload icon'}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleIconSelect(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <FieldHint>
                {isRTL
                  ? 'صلاحيات المنتج — اختر واحداً أو أكثر بأي تركيبة'
                  : 'Product access — select one or more in any combination'}
              </FieldHint>
              <div className="grid sm:grid-cols-2 gap-2">
                {PRODUCT_FEATURES.map((feature) => {
                  const checked = form.features.includes(feature.key);
                  return (
                    <label
                      key={feature.key}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        checked ? 'border-tz-primary bg-tz-primary/5' : 'border-tz-cream-dark hover:bg-tz-cream/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFeature(feature.key)}
                        className="rounded border-tz-cream-dark"
                      />
                      <span className="text-sm font-medium">
                        {isRTL ? feature.labelAr : feature.labelEn}
                      </span>
                    </label>
                  );
                })}
              </div>
              {form.features.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'التركيبة المختارة:' : 'Selected:'}{' '}
                  {form.features.map((f) => featureLabel(f, isRTL)).join(' + ')}
                </p>
              )}
            </div>
            <div className="space-y-3 border-t border-tz-cream-dark pt-3">
              <FieldHint>{isRTL ? 'مزايا العرض (تظهر في الصفحة الرئيسية وصفحة الاشتراك)' : 'Display benefits (shown on homepage and subscription page)'}</FieldHint>
              <div className="space-y-2">
                <p className="text-sm font-medium">{isRTL ? 'بالعربي' : 'Arabic'}</p>
                <BenefitsList
                  items={form.benefitsAr}
                  onChange={(benefitsAr) => setForm({ ...form, benefitsAr })}
                  placeholder={isRTL ? 'مثال: مؤقتات ذكية للطاولات' : 'e.g. Smart table timers'}
                  addLabel={isRTL ? 'إضافة ميزة' : 'Add benefit'}
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{isRTL ? 'بالإنجليزي' : 'English'}</p>
                <BenefitsList
                  items={form.benefitsEn}
                  onChange={(benefitsEn) => setForm({ ...form, benefitsEn })}
                  placeholder={isRTL ? 'مثال: Smart table timers' : 'e.g. Smart table timers'}
                  addLabel={isRTL ? 'إضافة ميزة' : 'Add benefit'}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isRTL ? 'حفظ' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
