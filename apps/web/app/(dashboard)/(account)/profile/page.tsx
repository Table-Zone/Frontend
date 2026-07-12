'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';

export default function ProfilePage() {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError('');
    setSuccess(false);
    try {
      await authAPI.updateProfile({ name: form.name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const inputIconClass = `absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`;
  const inputPadding = isRTL ? 'pr-10' : 'pl-10';

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
          <User className="w-5 h-5 text-tz-primary" />
        </div>
        <h1 className="text-2xl font-bold text-tz-espresso">{t.profile}</h1>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-tz-red/10 border border-tz-red/20 text-tz-red text-sm flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-tz-green/10 border border-tz-green/20 text-tz-green text-sm"
        >
          {t.success}
        </motion.div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-tz-primary" />
          {isRTL ? 'المعلومات الشخصية' : 'Personal Info'}
        </h2>

        <div className="space-y-4">
          <div className="relative">
            <User className={inputIconClass} />
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t.name}
              className={`${inputPadding} h-12`}
            />
          </div>

          <div className="relative">
            <Mail className={inputIconClass} />
            <Input
              type="email"
              value={form.email}
              disabled
              className={`${inputPadding} h-12 bg-muted`}
            />
          </div>

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t.loading : t.save}
          </Button>
        </div>
      </div>
    </div>
  );
}
