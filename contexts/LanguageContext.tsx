'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  lang: Language;
  isRTL: boolean;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
}

const translations = {
  ar: {
    appName: 'Table Zone',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب؟',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    tables: 'الطاولات',
    settings: 'الإعدادات',
    members: 'الفريق',
    subscription: 'الاشتراك',
    profile: 'الملف الشخصي',
    workspace: 'مساحة العمل',
    startTimer: 'بدء المؤقت',
    stopTimer: 'إيقاف المؤقت',
    free: 'متاح',
    occupied: 'مشغول',
    warning: 'تحذير',
    alert: 'تنبيه',
    note: 'ملاحظة',
    addNote: 'إضافة ملاحظة',
    inviteMember: 'دعوة عضو',
    pending: 'قيد الانتظار',
    active: 'نشط',
    lapsed: 'منتهي',
    subscriptionRequired: 'الاشتراك مطلوب',
    subscriptionRequiredDesc: 'يجب الاشتراك لاستخدام المؤقت',
    viewPlans: 'عرض الخطط',
    bankTransfer: 'تحويل بنكي',
    uploadReceipt: 'رفع الإيصال',
    receiptUploaded: 'تم رفع الإيصال',
    thanksForPurchase: 'شكراً لشرائك',
    subscriptionPending: 'سيتم تفعيل اشتراكك قريباً',
    plan: 'الخطة',
    price: 'السعر',
    duration: 'المدة',
    monthly: 'شهري',
    quarterly: '3 أشهر',
    staffSeats: 'مقاعد الموظفين',
    extraSeatPrice: 'سعر المقعد الإضافي',
    requestSubscription: 'طلب الاشتراك',
    requestExtraSeats: 'طلب مقاعد إضافية',
    workspaceFull: 'مساحة العمل ممتلئة',
    workspaceFullDesc: 'جميع المقاعد مشغولة حالياً',
    owner: 'المالك',
    staff: 'موظف',
    remove: 'إزالة',
    leave: 'مغادرة',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    reject: 'رفض',
    save: 'حفظ',
    delete: 'حذف',
    deleteTableConfirm: 'هل أنت متأكد من حذف هذه الطاولة؟',
    addTable: 'إضافة طاولة',
    tableName: 'اسم الطاولة',
    timerDuration: 'مدة المؤقت (دقيقة)',
    edit: 'تعديل',
    close: 'إغلاق',
    search: 'بحث',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    timezone: 'التوقيت الزمني',
    tableCount: 'عدد الطاولات',
    redAlertMinutes: 'وقت التنبيه (دقيقة)',
    slug: 'الرابط المختصر',
    workspaceName: 'اسم المساحة',
    createWorkspace: 'إنشاء مساحة عمل',
    createWorkspaceDesc: 'أنشئ مساحة عمل مقهاك لبدء إدارة طاولاتك',
    createWorkspaceButton: 'إنشاء المساحة',
    workspaceCreated: 'تم إنشاء مساحة العمل بنجاح',
    noWorkspace: 'ليس لديك مساحة عمل',
    noWorkspaceDesc: 'أنشئ مساحة عملك الآن لتبدأ',
    onboardingTitle: 'مرحباً بك في Table Zone',
    onboardingDesc: 'لنبدأ بإعداد مساحة عملك',
    next: 'التالي',
    back: 'السابق',
    finish: 'إنهاء',
    step: 'خطوة',
    of: 'من',
    timerRunning: 'المؤقت يعمل',
    timerStopped: 'المؤقت متوقف',
    overtime: 'تجاوز الوقت',
    minutesRemaining: 'دقيقة متبقية',
    sendInvite: 'إرسال دعوة',
    invitationSent: 'تم إرسال الدعوة',
    acceptInvite: 'قبول الدعوة',
    joinWorkspace: 'الانضمام إلى',
    expiredInvite: 'انتهت صلاحية الدعوة',
    teamInvitation: 'دعوة فريق',
    invitedToJoin: 'تمت دعوتك للانضمام إلى',
    invitedBy: 'مدعو من قبل',
    welcome: 'مرحباً!',
    joinedWorkspace: 'لقد انضممت إلى',
    redirecting: 'جاري التوجيه...',
    invitationError: 'خطأ في الدعوة',
    invalidOrExpiredInvitation: 'دعوة غير صالحة أو منتهية الصلاحية',
    failedToAcceptInvitation: 'فشل قبول الدعوة',
    goToLogin: 'الذهاب إلى تسجيل الدخول',
    resend: 'إعادة إرسال',
    cancelInvite: 'إلغاء الدعوة',
    timeLeft: 'متبقي',
    ready: 'جاهز',
    start: 'بدء',
    stop: 'إيقاف',
    status: {
      free: 'متاح',
      occupied: 'مشغول',
      warning: 'تحذير',
      alert: 'تنبيه',
    },
  },
  en: {
    appName: 'Table Zone',
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    logout: 'Logout',
    dashboard: 'Dashboard',
    tables: 'Tables',
    settings: 'Settings',
    members: 'Team',
    subscription: 'Subscription',
    profile: 'Profile',
    workspace: 'Workspace',
    startTimer: 'Start Timer',
    stopTimer: 'Stop Timer',
    free: 'Free',
    occupied: 'Occupied',
    warning: 'Warning',
    alert: 'Alert',
    note: 'Note',
    addNote: 'Add Note',
    inviteMember: 'Invite Member',
    pending: 'Pending',
    active: 'Active',
    lapsed: 'Lapsed',
    subscriptionRequired: 'Subscription Required',
    subscriptionRequiredDesc: 'You need a subscription to use the timer',
    viewPlans: 'View Plans',
    bankTransfer: 'Bank Transfer',
    uploadReceipt: 'Upload Receipt',
    receiptUploaded: 'Receipt Uploaded',
    thanksForPurchase: 'Thank You for Your Purchase',
    subscriptionPending: 'Your subscription will be activated shortly',
    plan: 'Plan',
    price: 'Price',
    duration: 'Duration',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    staffSeats: 'Staff Seats',
    extraSeatPrice: 'Extra Seat Price',
    requestSubscription: 'Request Subscription',
    requestExtraSeats: 'Request Extra Seats',
    workspaceFull: 'Workspace Full',
    workspaceFullDesc: 'All seats are currently in use',
    owner: 'Owner',
    staff: 'Staff',
    remove: 'Remove',
    leave: 'Leave',
    cancel: 'Cancel',
    confirm: 'Confirm',
    reject: 'Reject',
    save: 'Save',
    delete: 'Delete',
    deleteTableConfirm: 'Are you sure you want to delete this table?',
    addTable: 'Add Table',
    tableName: 'Table Name',
    timerDuration: 'Timer Duration (min)',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    language: 'Language',
    arabic: 'العربية',
    english: 'English',
    timezone: 'Timezone',
    tableCount: 'Table Count',
    redAlertMinutes: 'Alert Time (minutes)',
    slug: 'Workspace URL',
    workspaceName: 'Workspace Name',
    createWorkspace: 'Create Workspace',
    createWorkspaceDesc: 'Create your coffee shop workspace to start managing tables',
    createWorkspaceButton: 'Create Workspace',
    workspaceCreated: 'Workspace created successfully',
    noWorkspace: 'No workspace found',
    noWorkspaceDesc: 'Create your workspace now to get started',
    onboardingTitle: 'Welcome to Table Zone',
    onboardingDesc: "Let's set up your workspace",
    next: 'Next',
    back: 'Back',
    finish: 'Finish',
    step: 'Step',
    of: 'of',
    timerRunning: 'Timer Running',
    timerStopped: 'Timer Stopped',
    overtime: 'Overtime',
    minutesRemaining: 'minutes remaining',
    sendInvite: 'Send Invite',
    invitationSent: 'Invitation Sent',
    acceptInvite: 'Accept Invitation',
    joinWorkspace: 'Join',
    expiredInvite: 'Invitation Expired',
    teamInvitation: 'Team Invitation',
    invitedToJoin: 'You have been invited to join',
    invitedBy: 'Invited by',
    welcome: 'Welcome!',
    joinedWorkspace: 'You have joined',
    redirecting: 'Redirecting...',
    invitationError: 'Invitation Error',
    invalidOrExpiredInvitation: 'Invalid or expired invitation',
    failedToAcceptInvitation: 'Failed to accept invitation',
    goToLogin: 'Go to Login',
    resend: 'Resend',
    cancelInvite: 'Cancel Invite',
    timeLeft: 'remaining',
    ready: 'Ready',
    start: 'Start',
    stop: 'Stop',
    status: {
      free: 'Free',
      occupied: 'Occupied',
      warning: 'Warning',
      alert: 'Alert',
    },
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language;
    if (saved && (saved === 'ar' || saved === 'en')) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const value = {
    lang,
    isRTL: lang === 'ar',
    setLang,
    t: translations[lang],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
