'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings, Clock, Globe, Save, AlertTriangle, Moon, Sun, Monitor, Building2, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/components/shared/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { workspaceAPI } from '@/lib/api';

interface SettingsData {
  name: string;
  slug: string;
  defaultTimerDurationMinutes: number;
  redAlertMinutes: number;
  timezone: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, isRTL, setLang, lang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    name: '',
    slug: '',
    defaultTimerDurationMinutes: 45,
    redAlertMinutes: 60,
    timezone: 'Asia/Riyadh',
  });
  const [workspaceId, setWorkspaceId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const push = usePushNotifications(workspaceId);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (user?.role === 'admin') {
        setIsAdmin(true);
        setIsLoading(false);
        return;
      }
      try {
        const storedSlug = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceSlug') : null;
        const res = await workspaceAPI.getMyWorkspace(storedSlug || undefined);
        const ws = res.data.data.workspace;
        setWorkspaceId(ws.id);
        setSettings({
          name: ws.name,
          slug: ws.slug,
          defaultTimerDurationMinutes: ws.defaultTimerDurationMinutes || 45,
          redAlertMinutes: ws.redAlertMinutes || 60,
          timezone: ws.timezone || 'Asia/Riyadh',
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          router.push('/create-workspace');
          return;
        }
        setError(t.error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [t.error, user]);

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess(false);
    try {
      await workspaceAPI.updateWorkspace({
        name: settings.name,
        defaultTimerDurationMinutes: settings.defaultTimerDurationMinutes,
        redAlertMinutes: settings.redAlertMinutes,
        timezone: settings.timezone,
      });
      setSuccess(true);
      showToast(isRTL ? 'تم حفظ الإعدادات' : 'Settings saved', 'success');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-tz-primary" />
        </div>
        <h1 className="text-2xl font-bold text-tz-espresso">{t.settings}</h1>
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

      <div className="space-y-6">
        {!isAdmin && (
          <>
            {/* Workspace Info */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-tz-primary" />
                {isRTL ? 'معلومات المساحة' : 'Workspace Info'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.workspaceName}</label>
                  <Input
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.slug}</label>
                  <Input
                    value={settings.slug}
                    disabled
                    className="h-12 bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Timer Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-tz-primary" />
                {isRTL ? 'إعدادات المؤقت' : 'Timer Settings'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? 'مدة المؤقت الافتراضية (دقيقة)' : 'Default Timer Duration (minutes)'}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={300}
                    value={settings.defaultTimerDurationMinutes}
                    onChange={(e) => setSettings({ ...settings, defaultTimerDurationMinutes: parseInt(e.target.value) || 45 })}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'تُستخدم للطاولات الجديدة' : 'Used for new tables'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isRTL ? 'دقائق التنبيه الأحمر' : 'Warning Alert Minutes'}
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={settings.redAlertMinutes}
                    onChange={(e) => setSettings({ ...settings, redAlertMinutes: parseInt(e.target.value) || 60 })}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? 'يبدأ التحذير عندما يتبقى هذا الوقت' : 'Warning starts when this much time remains'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-tz-cream-dark dark:border-gray-800">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-tz-primary" />
            {isRTL ? 'التفضيلات' : 'Preferences'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'الإشعارات' : 'Notifications'}
              </label>
              {!push.isSupported ? (
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'الإشعارات غير مدعومة في هذا المتصفح' : 'Push notifications not supported in this browser'}
                </p>
              ) : push.permission === 'denied' ? (
                <p className="text-sm text-tz-red">
                  {isRTL ? 'تم حظر الإشعارات — يرجى السماح من إعدادات المتصفح' : 'Notifications blocked — please allow in browser settings'}
                </p>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl bg-tz-cream dark:bg-gray-800">
                  <div className="flex items-center gap-3">
                    {push.isSubscribed ? (
                      <Bell className="w-5 h-5 text-tz-green" />
                    ) : (
                      <BellOff className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {push.isSubscribed
                          ? (isRTL ? 'الإشعارات مفعلة' : 'Notifications On')
                          : (isRTL ? 'الإشعارات معطلة' : 'Notifications Off')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL
                          ? 'احصل على تنبيهات عندما تقترب الطاولة من الانتهاء'
                          : 'Get alerts when tables are about to expire'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => push.isSubscribed ? push.unsubscribe() : push.subscribe()}
                    disabled={push.isLoading}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      push.isSubscribed
                        ? 'bg-tz-red/10 text-tz-red hover:bg-tz-red/20'
                        : 'bg-tz-primary text-white hover:bg-tz-primary-dark'
                    }`}
                  >
                    {push.isLoading
                      ? t.loading
                      : push.isSubscribed
                        ? (isRTL ? 'إيقاف' : 'Disable')
                        : (isRTL ? 'تفعيل' : 'Enable')}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.language}</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setLang('ar')}
                  className={`flex-1 h-12 rounded-xl font-medium text-sm transition-all ${
                    lang === 'ar'
                      ? 'bg-tz-primary text-white shadow-md'
                      : 'bg-tz-cream text-tz-espresso hover:bg-tz-cream-dark'
                  }`}
                >
                  {t.arabic}
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`flex-1 h-12 rounded-xl font-medium text-sm transition-all ${
                    lang === 'en'
                      ? 'bg-tz-primary text-white shadow-md'
                      : 'bg-tz-cream text-tz-espresso hover:bg-tz-cream-dark'
                  }`}
                >
                  {t.english}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'الوضع' : 'Theme'}
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: isRTL ? 'فاتح' : 'Light', icon: Sun },
                  { value: 'dark', label: isRTL ? 'داكن' : 'Dark', icon: Moon },
                  { value: 'system', label: isRTL ? 'تلقائي' : 'Auto', icon: Monitor },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value as any)}
                    className={`flex-1 h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                      theme === opt.value
                        ? 'bg-tz-primary text-white shadow-md'
                        : 'bg-tz-cream text-tz-espresso hover:bg-tz-cream-dark'
                    }`}
                  >
                    <opt.icon className="w-4 h-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.timezone}</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-tz-primary/20"
              >
                <option value="Asia/Riyadh">{isRTL ? 'الرياض (GMT+3)' : 'Riyadh (GMT+3)'}</option>
                <option value="Asia/Dubai">{isRTL ? 'دبي (GMT+4)' : 'Dubai (GMT+4)'}</option>
                <option value="Asia/Bahrain">{isRTL ? 'البحرين (GMT+3)' : 'Bahrain (GMT+3)'}</option>
                <option value="Asia/Kuwait">{isRTL ? 'الكويت (GMT+3)' : 'Kuwait (GMT+3)'}</option>
              </select>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white text-base"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? t.loading : t.save}
          </Button>
        )}
      </div>
    </div>
  );
}


