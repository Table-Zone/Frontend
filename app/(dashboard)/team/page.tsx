'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Crown, User, Trash2, Mail, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { teamAPI, workspaceAPI } from '@/lib/api';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'staff';
  status: 'active' | 'pending';
  joinedAt: string;
}

export default function TeamPage() {
  const { t, isRTL } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  const fetchMembers = async () => {
    try {
      const wsRes = await workspaceAPI.getMyWorkspace();
      const ws = wsRes.data.data.workspace;
      setWorkspaceId(ws.id);

      const res = await teamAPI.getMembers(ws.id);
      setMembers(res.data.data.members);
    } catch (err) {
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setError('');
    try {
      await teamAPI.inviteMember(workspaceId, { email: inviteEmail.trim() });
      setInviteEmail('');
      setShowInvite(false);
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من إزالة هذا العضو؟' : 'Are you sure you want to remove this member?')) return;
    try {
      await teamAPI.removeMember(workspaceId, memberId);
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-tz-primary" />
          </div>
          <h1 className="text-2xl font-bold text-tz-espresso">{t.members}</h1>
        </div>

        <Button
          onClick={() => setShowInvite(true)}
          className="bg-tz-primary hover:bg-tz-primary-dark text-white h-11 px-5"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t.inviteMember}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 rounded-xl bg-tz-red/10 border border-tz-red/20 text-tz-red text-sm flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Members List */}
      <div className="space-y-3">
        <AnimatePresence>
          {members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-tz-cream-dark flex items-center gap-4"
            >
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                member.role === 'owner'
                  ? 'bg-gradient-to-br from-tz-amber to-[#D97706]'
                  : 'bg-gradient-to-br from-tz-blue to-[#4A90D9]'
              }`}>
                {member.role === 'owner' ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{member.name}</h3>
                  {member.role === 'owner' && (
                    <span className="px-2 py-0.5 rounded-full bg-tz-amber/10 text-tz-amber text-[10px] font-bold">
                      {t.owner}
                    </span>
                  )}
                  {member.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded-full bg-tz-blue/10 text-tz-blue text-[10px] font-bold">
                      {t.pending}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>

              {/* Actions */}
              {member.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(member.id)}
                  className="p-2 rounded-xl text-tz-red hover:bg-tz-red/10 transition-colors"
                  title={t.remove}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-tz-primary" />
                {t.inviteMember}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.email}</label>
                  <Input
                    type="email"
                    placeholder="colleague@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowInvite(false)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleInvite}
                    disabled={isInviting || !inviteEmail.trim()}
                    className="flex-1 h-12 rounded-xl bg-tz-primary hover:bg-tz-primary-dark text-white"
                  >
                    {isInviting ? t.loading : t.sendInvite}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
