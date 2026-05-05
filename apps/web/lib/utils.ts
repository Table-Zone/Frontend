import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);
  const mins = Math.floor(absSeconds / 60);
  const secs = absSeconds % 60;
  const sign = isNegative ? '+' : '';
  return `${sign}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatCurrency(amount: number, locale: 'ar' | 'en' = 'ar'): string {
  if (locale === 'ar') {
    return `${amount.toLocaleString('ar-SA')} ر.س`;
  }
  return `${amount.toLocaleString('en-US')} SAR`;
}
