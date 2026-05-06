'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, User, Building2, Check, AlertTriangle, Loader2, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teamAPI, userAPI } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface Invitation {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  email: string;
  role: string;
  expiresAt: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useLanguage();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [autoAcceptAttempted, setAutoAcceptAttempted] = useState(false);

  // Check login status and load invitation
  useEffect(() => {
    const load = async () => {
      // Check if user is logged in
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      let loggedIn = false;

      if (accessToken) {
        try {
          await userAPI.getMe();
          loggedIn = true;
        } catch {
          // Token invalid, clear it
          localStorage.removeItem('access_token');
          document.cookie = 'access_token=; path=/; max-age=0';
        }
      }

      setIsLoggedIn(loggedIn);

      // Load invitation details
      try {
        const res = await teamAPI.getInvitation(token);
        setInvitation(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || t.invalidOrExpiredInvitation);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token, t]);

  // Auto-accept if returning from login with pending token
  useEffect(() => {
    if (
      isLoggedIn === true &&
      !autoAcceptAttempted &&
      !accepted &&
      !isAccepting &&
      invitation &&
      !error
    ) {
      const pendingToken = localStorage.getItem('pendingInviteToken');
      const fromAuth = searchParams.get('from') === 'auth';

      if (pendingToken === token || fromAuth) {
        setAutoAcceptAttempted(true);
        localStorage.removeItem('pendingInviteToken');
        handleAccept();
      }
    }
  }, [isLoggedIn, autoAcceptAttempted, accepted, isAccepting, invitation, error, token, searchParams]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError('');
    try {
      console.log('[Invite] Accepting invitation...', token);
      const res = await teamAPI.acceptInvitation(token);
      console.log('[Invite] Accept response:', res.data);
      const workspaceSlug = res.data?.data?.workspace?.slug;
      setAccepted(true);
      setTimeout(() => {
        if (workspaceSlug) {
          router.push(`/dashboard?workspaceSlug=${encodeURIComponent(workspaceSlug)}`);
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      console.error('[Invite] Accept error:', err);
      const status = err.response?.status;
      const msg = err.response?.data?.error?.message;

      if (status === 401) {
        // Token expired or invalid — clear and show login option
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; path=/; max-age=0';
        setIsLoggedIn(false);
        setError(isRTL ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.' : 'Session expired. Please log in again.');
      } else if (status === 404) {
        setError(msg || (isRTL ? 'الدعوة غير موجودة' : 'Invitation not found'));
      } else if (status === 409 || status === 422) {
        setError(msg || t.failedToAcceptInvitation);
      } else if (status >= 500) {
        setError(isRTL ? 'خطأ في الخادم. يرجى المحاولة لاحقاً.' : 'Server error. Please try again later.');
      } else {
        setError(msg || t.failedToAcceptInvitation);
      }
    } finally {
      setIsAccepting(false);
    }
  };

  const goToLogin = () => {
    localStorage.setItem('pendingInviteToken', token);
    router.push(`/login?redirect=${encodeURIComponent(`/invite/${token}?from=auth`)}`);
  };

  const goToRegister = () => {
    localStorage.setItem('pendingInviteToken', token);
    router.push(`/register?redirect=${encodeURIComponent(`/invite/${token}?from=auth`)}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tz-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-tz-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-tz-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-tz-red" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso mb-2">{t.invitationError}</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/login')} className="bg-tz-primary hover:bg-tz-primary-dark text-white">
            {t.goToLogin}
          </Button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-tz-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-tz-green/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-tz-green" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso mb-2">{t.welcome}</h1>
          <p className="text-muted-foreground">
            {t.joinedWorkspace} {invitation?.workspaceName}. {t.redirecting}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-tz-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-tz-primary" />
          </div>
          <h1 className="text-2xl font-bold text-tz-espresso">{t.teamInvitation}</h1>
          <p className="text-muted-foreground mt-1">{t.invitedToJoin}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-tz-cream">
            <Building2 className="w-5 h-5 text-tz-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t.workspace}</p>
              <p className="font-bold truncate">{invitation?.workspaceName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-tz-cream">
            <User className="w-5 h-5 text-tz-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t.invitedBy}</p>
              <p className="font-bold truncate">{invitation?.inviterName}</p>
            </div>
          </div>
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

        {isLoggedIn === false ? (
          // Not logged in — show login/register buttons
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center mb-4">
              {isRTL
                ? 'يجب تسجيل الدخول لقبول هذه الدعوة'
                : 'You need to log in to accept this invitation'}
            </p>
            <Button
              onClick={goToLogin}
              className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white font-bold"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.login}
            </Button>
            <Button
              onClick={goToRegister}
              variant="outline"
              className="w-full h-12 rounded-xl font-bold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {t.register}
            </Button>
          </div>
        ) : isLoggedIn === true ? (
          // Logged in — show accept button
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full h-12 bg-tz-primary hover:bg-tz-primary-dark text-white font-bold"
          >
            {isAccepting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {t.acceptInvite}
              </>
            )}
          </Button>
        ) : (
          // Checking login status
          <div className="flex justify-center py-3">
            <Loader2 className="w-5 h-5 animate-spin text-tz-primary" />
          </div>
        )}
      </motion.div>
    </div>
  );
}
