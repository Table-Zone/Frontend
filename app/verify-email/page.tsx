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

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid or missing verification link');
        return;
      }
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Invalid or expired link');
      }
    };
    verify();
  }, [token]);

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
          <p className="text-muted-foreground mb-6">{message}</p>
          <Button onClick={() => router.push('/login')} className="bg-tz-primary hover:bg-tz-primary-dark text-white h-12 px-8">
            Go to Login
          </Button>
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
