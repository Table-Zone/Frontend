'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isRTL?: boolean;
}

export function AdminSearchBar({ value, onChange, placeholder, isRTL }: AdminSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`} />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${isRTL ? 'pr-10' : 'pl-10'} h-11`}
      />
    </div>
  );
}
