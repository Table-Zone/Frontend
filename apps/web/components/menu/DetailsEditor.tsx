'use client';

import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuDetailPair } from '@/lib/menu-details';

const PRESETS = [
  { key: 'البروتين', keyEn: 'Protein' },
  { key: 'السعرات', keyEn: 'Calories' },
  { key: 'الحجم', keyEn: 'Size' },
  { key: 'الحرارة', keyEn: 'Spicy' },
  { key: 'وقت التحضير', keyEn: 'Prep Time' },
  { key: 'مسببات الحساسية', keyEn: 'Allergens' },
  { key: 'الحصة', keyEn: 'Portion' },
  { key: 'المنشأ', keyEn: 'Origin' },
  { key: 'ملاحظة الشيف', keyEn: 'Chef Note' },
];

interface DetailsEditorProps {
  pairs: MenuDetailPair[];
  setPairs: (pairs: MenuDetailPair[]) => void;
  isRTL: boolean;
}

export function DetailsEditor({ pairs, setPairs, isRTL }: DetailsEditorProps) {
  const updatePair = (idx: number, field: keyof MenuDetailPair, value: string) => {
    const next = pairs.map((p, i) => (i === idx ? { ...p, [field]: value } : p));
    setPairs(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">
        {isRTL ? 'التفاصيل (عربي / إنجليزي)' : 'Details (Arabic / English)'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.keyEn}
            type="button"
            onClick={() => {
              if (!pairs.find((x) => x.keyEn === p.keyEn)) {
                setPairs([...pairs, { key: p.key, keyEn: p.keyEn, value: '', valueEn: '' }]);
              }
            }}
            className="text-[10px] px-2 py-1 rounded-full border bg-white hover:bg-gray-50 transition-colors"
            style={{ opacity: pairs.find((x) => x.keyEn === p.keyEn) ? 0.4 : 1 }}
          >
            + {isRTL ? p.key : p.keyEn}
          </button>
        ))}
      </div>
      {pairs.map((pair, idx) => (
        <div key={`detail-${idx}-${pair.keyEn || pair.key || 'new'}`} className="space-y-2 p-3 border rounded-lg bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              placeholder={isRTL ? 'اسم التفصيل (عربي)' : 'Label (Arabic)'}
              value={pair.key}
              onChange={(e) => updatePair(idx, 'key', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              placeholder={isRTL ? 'اسم التفصيل (إنجليزي)' : 'Label (English)'}
              value={pair.keyEn}
              onChange={(e) => updatePair(idx, 'keyEn', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input
              type="text"
              placeholder={isRTL ? 'القيمة (عربي)' : 'Value (Arabic)'}
              value={pair.value}
              onChange={(e) => updatePair(idx, 'value', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              placeholder={isRTL ? 'القيمة (إنجليزي)' : 'Value (English)'}
              value={pair.valueEn}
              onChange={(e) => updatePair(idx, 'valueEn', e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => setPairs(pairs.filter((_, i) => i !== idx))}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setPairs([...pairs, { key: '', keyEn: '', value: '', valueEn: '' }])}
        className="gap-1"
      >
        <Plus className="w-3 h-3" />
        {isRTL ? 'إضافة تفصيل' : 'Add Detail'}
      </Button>
    </div>
  );
}
