'use client';

import { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  icon: LucideIcon;
  description?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, icon: Icon, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-tz-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-tz-espresso">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
