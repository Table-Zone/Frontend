'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authAPI } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [rawError, setRawError] = useState('');
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification link');
        return;
      }
      try {
        console.log('[VerifyEmail] Calling verify with token:', token.slice(0, 8) + '...');
        const res = await authAPI.verifyEmail(token);
        console.log('[VerifyEmail] Success:', res.data);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: any) {
        console.error('[VerifyEmail] Error:', err);
        const statusCode = err.response?.status;
        const errMsg = err.response?.data?.error?.message || err.message || 'Unknown error';
        const errCode = err.response?.data?.error?.code || 'NO_CODE';
        setStatus('error');
        setMessage(errMsg);
        setRawError(`HTTP ${statusCode} | Code: ${errCode}`);
      }
    };
    verify();
  }, [token]);

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendStatus('sending');
    try {
      await authAPI.resendVerification(email.trim());
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center"
    >
      {status === 'loading' && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-tz-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-tz-primary animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso">Verifying your email...</h1>
          <p className="text-sm text-muted-foreground mt-2">Token: {token ? token.slice(0, 12) + '...' : 'none'}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-tz-green/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-tz-green" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso mb-2">Email Verified!</h1>
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => router.push('/login')} className="bg-tz-primary hover:bg-tz-primary-dark text-white h-12 px-8">
            Go to Login
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 rounded-2xl bg-tz-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-tz-red" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso mb-2">Verification Failed</h1>
          <p className="text-muted-foreground mb-2">{message}</p>
          {rawError && <p className="text-xs text-red-500 mb-4 font-mono">{rawError}</p>}
          <div className="space-y-3">
            <Button onClick={() => router.push('/login')} className="bg-tz-primary hover:bg-tz-primary-dark text-white h-12 px-8 w-full">
              Go to Login
            </Button>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Need a new link? Enter your email:</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border rounded-lg mb-2 text-sm"
              />
              <Button
                onClick={handleResend}
                disabled={resendStatus !== 'idle' || !email.trim()}
                variant="outline"
                className="w-full"
              >
                {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Sent!' : 'Resend Verification Email'}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tz-cream via-white to-tz-cream-dark flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-tz-primary/10 flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-tz-primary animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso">Verifying your email...</h1>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
