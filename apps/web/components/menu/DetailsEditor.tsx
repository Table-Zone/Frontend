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
  // Labels/values aren't split by language — one field feeds both slots so the
  // public menu shows the same text regardless of the viewer's language.
  const updateLabel = (idx: number, value: string) => {
    setPairs(pairs.map((p, i) => (i === idx ? { ...p, key: value, keyEn: value } : p)));
  };
  const updateValue = (idx: number, value: string) => {
    setPairs(pairs.map((p, i) => (i === idx ? { ...p, value, valueEn: value } : p)));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500">
        {isRTL ? 'التفاصيل' : 'Details'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.keyEn}
            type="button"
            onClick={() => {
              const label = isRTL ? p.key : p.keyEn;
              if (!pairs.find((x) => x.key === label || x.keyEn === label)) {
                setPairs([...pairs, { key: label, keyEn: label, value: '', valueEn: '' }]);
              }
            }}
            className="text-[10px] px-2 py-1 rounded-full border bg-white hover:bg-gray-50 transition-colors"
            style={{ opacity: pairs.find((x) => x.key === (isRTL ? p.key : p.keyEn) || x.keyEn === (isRTL ? p.key : p.keyEn)) ? 0.4 : 1 }}
          >
            + {isRTL ? p.key : p.keyEn}
          </button>
        ))}
      </div>
      {pairs.map((pair, idx) => (
        <div key={`detail-${idx}`} className="p-3 border rounded-lg bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input
              type="text"
              placeholder={isRTL ? 'اسم التفصيل' : 'Label'}
              value={pair.key || pair.keyEn}
              onChange={(e) => updateLabel(idx, e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            />
            <input
              type="text"
              placeholder={isRTL ? 'القيمة' : 'Value'}
              value={pair.value || pair.valueEn}
              onChange={(e) => updateValue(idx, e.target.value)}
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
