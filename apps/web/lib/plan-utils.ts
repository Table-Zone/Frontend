export interface PublicPlan {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  priceSar: number;
  displayPriceSar?: number | null;
  discountPercent?: number;
  baseStaffSeats?: number;
  durationDays: number;
  extraStaffSeatPriceSar?: number;
  features: string[];
  texts?: {
    benefitsAr?: string[];
    benefitsEn?: string[];
  };
  imageUrl?: string | null;
  iconUrl?: string | null;
  sortOrder?: number;
}

export const PERIOD_LABELS: Record<string, { en: string; ar: string }> = {
  monthly: { en: 'Monthly', ar: 'شهري' },
  quarterly: { en: 'Quarterly', ar: '3 أشهر' },
  yearly: { en: 'Yearly', ar: 'سنوي' },
};

const FEATURE_BULLETS: Record<string, { en: string[]; ar: string[] }> = {
  tables: {
    en: ['Smart table timers', 'Track table status', 'Usage time alerts', 'Technical support'],
    ar: ['مؤقتات ذكية للطاولات', 'تتبع حالة الطاولات', 'تنبيهات وقت الاستخدام', 'دعم فني'],
  },
  qrcode: {
    en: ['Digital QR menu', '4 ready-made templates', 'Customize colors & logo', 'Manage products & categories'],
    ar: ['قائمة رقمية بتصميم QR', '4 قوالب تصميم جاهزة', 'تخصيص الألوان والشعار', 'إدارة المنتجات والتصنيفات'],
  },
  menu: {
    en: ['QR menu design', 'Ready-made templates', 'Customize branding', 'Manage products', 'Technical support'],
    ar: ['تصميم قائمة QR', 'قوالب جاهزة', 'تخصيص الهوية', 'إدارة المنتجات', 'دعم فني'],
  },
};

export function extractPeriod(plan: Pick<PublicPlan, 'name' | 'durationDays'>): string {
  const prefix = plan.name.split('-')[0];
  if (prefix && PERIOD_LABELS[prefix]) return prefix;

  if (plan.durationDays <= 31) return 'monthly';
  if (plan.durationDays <= 92) return 'quarterly';
  return 'yearly';
}

export function getPlansForPeriod(plans: PublicPlan[], period: string): PublicPlan[] {
  return plans
    .filter((plan) => extractPeriod(plan) === period)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function getAvailablePeriods(plans: PublicPlan[]): string[] {
  const periods = Array.from(new Set(plans.map((p) => extractPeriod(p))));
  const order = ['monthly', 'quarterly', 'yearly'];
  return order.filter((p) => periods.includes(p)).concat(
    periods.filter((p) => !order.includes(p))
  );
}

export function getPlanBullets(
  plan: Pick<PublicPlan, 'features' | 'descriptionAr' | 'descriptionEn' | 'texts'>,
  isRTL: boolean
): string[] {
  const custom = isRTL ? plan.texts?.benefitsAr : plan.texts?.benefitsEn;
  if (custom && custom.length > 0) {
    return custom;
  }

  const fromFeatures = plan.features.flatMap((f) => {
    const bullets = FEATURE_BULLETS[f];
    return bullets ? (isRTL ? bullets.ar : bullets.en) : [];
  });

  if (fromFeatures.length > 0) {
    return fromFeatures;
  }

  const desc = (isRTL ? plan.descriptionAr : plan.descriptionEn)?.trim();
  if (desc) {
    return desc.split('\n').map((line) => line.trim()).filter(Boolean);
  }

  return plan.features;
}

export function getMostPopularPlan(plans: PublicPlan[]): PublicPlan | null {
  if (plans.length === 0) return null;

  return plans.reduce<PublicPlan | null>((best, plan) => {
    if (!best) return plan;
    if (plan.features.length > best.features.length) return plan;
    if (plan.features.length === best.features.length && plan.priceSar > best.priceSar) return plan;
    return best;
  }, null);
}
