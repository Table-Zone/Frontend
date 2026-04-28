'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, User, Building2, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teamAPI } from '@/lib/api';

interface Invitation {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  role: string;
  expiresAt: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await teamAPI.getInvitation(token);
        setInvitation(res.data.data.invitation);
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Invalid or expired invitation');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  const handleAccept = async () => {
    setIsAccepting(true);
    setError('');
    try {
      await teamAPI.acceptInvitation(token);
      setAccepted(true);
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tz-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tz-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-tz-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-tz-red/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-tz-red" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso mb-2">Invitation Error</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push('/login')} className="bg-tz-primary hover:bg-tz-primary-dark text-white">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-tz-cream flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-tz-green/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-tz-green" />
          </div>
          <h1 className="text-xl font-bold text-tz-espresso mb-2">Welcome!</h1>
          <p className="text-muted-foreground">You have joined {invitation?.workspaceName}. Redirecting...</p>
        </motion.div>
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
          <h1 className="text-2xl font-bold text-tz-espresso">Team Invitation</h1>
          <p className="text-muted-foreground mt-1">You have been invited to join</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-tz-cream">
            <Building2 className="w-5 h-5 text-tz-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Workspace</p>
              <p className="font-bold">{invitation?.workspaceName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-tz-cream">
            <User className="w-5 h-5 text-tz-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Invited by</p>
              <p className="font-bold">{invitation?.inviterName}</p>
            </div>
          </div>
        </div>

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
              Accept Invitation
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
