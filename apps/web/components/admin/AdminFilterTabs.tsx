'use client';

interface AdminFilterTabsProps<T extends string> {
  filters: T[];
  active: T;
  onChange: (filter: T) => void;
  labels: Record<T, string>;
}

export function AdminFilterTabs<T extends string>({
  filters,
  active,
  onChange,
  labels,
}: AdminFilterTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
            active === f
              ? 'bg-tz-primary text-white shadow-md'
              : 'bg-white text-muted-foreground hover:bg-tz-cream-dark border border-tz-cream-dark'
          }`}
        >
          {labels[f]}
        </button>
      ))}
    </div>
  );
}
