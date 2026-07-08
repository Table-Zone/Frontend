'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AdminStatsCardProps {
  label: string;
  count: number | string;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export function AdminStatsCard({ label, count, icon: Icon, color, delay = 0 }: AdminStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-2xl p-4 ${color} border border-current/10`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5 opacity-60" />
        <p className="text-2xl font-bold">{count}</p>
      </div>
      <p className="text-sm font-medium opacity-80">{label}</p>
    </motion.div>
  );
}
