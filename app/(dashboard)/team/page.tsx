'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Crown, User, Trash2, Mail, AlertTriangle, RefreshCw, X, Link2, Check, Send } from 'lucide-react';
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

interface PendingInvite {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

export default function TeamPage() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [totalStaffSeats, setTotalStaffSeats] = useState(1);
  const [memberCount, setMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<{ inviteUrl: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchMembers = async () => {
    try {
      const wsRes = await workspaceAPI.getMyWorkspace();
      const ws = wsRes.data.data.workspace;
      setWorkspaceId(ws.id);

      const res = await teamAPI.getMembers(ws.id);
      const data = res.data.data;
      setMembers(data.members || []);
      setPendingInvites(data.pendingInvites || []);
      setTotalStaffSeats(data.totalStaffSeats || 1);
      setMemberCount(data.memberCount || 0);
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

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    setError('');
    try {
      const res = await teamAPI.inviteMember(workspaceId, { email: inviteEmail.trim() });
      const inviteUrl = res.data.data.invitation?.inviteUrl || '';
      setCreatedInvite({ inviteUrl, email: inviteEmail.trim() });
      setInviteEmail('');
      setShowInvite(false);
      setShowShare(true);
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdInvite?.inviteUrl) return;
    try {
      await navigator.clipboard.writeText(createdInvite.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const input = document.createElement('input');
      input.value = createdInvite.inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getWhatsAppShareUrl = () => {
    if (!createdInvite?.inviteUrl) return '#';
    const text = isRTL
      ? `مرحباً، لقد تمت دعوتك للانضمام إلى فريق عمل على Table Zone. اضغط على الرابط للقبول: ${createdInvite.inviteUrl}`
      : `Hello, you have been invited to join a workspace on Table Zone. Click the link to accept: ${createdInvite.inviteUrl}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
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

  const handleCancelInvite = async (invitationId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من إلغاء هذه الدعوة؟' : 'Are you sure you want to cancel this invitation?')) return;
    try {
      await teamAPI.cancelInvite(workspaceId, invitationId);
      fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    try {
      await teamAPI.resendInvite(workspaceId, invitationId);
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

  const seatUsageText = `${memberCount + pendingInvites.length} / ${totalStaffSeats} ${isRTL ? 'مقاعد' : 'seats'}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-tz-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-tz-espresso">{t.members}</h1>
            <p className="text-xs text-muted-foreground">{seatUsageText}</p>
          </div>
        </div>

        <Button
          onClick={() => setShowInvite(true)}
          className="bg-tz-primary hover:bg-tz-primary-dark text-white h-11 px-5"
          disabled={memberCount + pendingInvites.length >= totalStaffSeats}
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
                  <span className="px-2 py-0.5 rounded-full bg-tz-green/10 text-tz-green text-[10px] font-bold">
                    {t.active}
                  </span>
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

          {/* Pending Invites */}
          {pendingInvites.map((invite, index) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (members.length + index) * 0.05 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-dashed border-tz-blue/30 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br from-tz-blue/20 to-tz-blue/10">
                <Mail className="w-5 h-5 text-tz-blue" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm">{invite.email}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-tz-blue/10 text-tz-blue text-[10px] font-bold">
                    {t.pending}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'تنتهي في' : 'Expires'} {new Date(invite.expiresAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleResendInvite(invite.id)}
                  className="p-2 rounded-xl text-tz-primary hover:bg-tz-primary/10 transition-colors"
                  title={t.resend}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleCancelInvite(invite.id)}
                  className="p-2 rounded-xl text-tz-red hover:bg-tz-red/10 transition-colors"
                  title={t.cancelInvite}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {members.length === 0 && pendingInvites.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{isRTL ? 'لا يوجد أعضاء بعد' : 'No members yet'}</p>
          </div>
        )}
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

      {/* Share Invite Modal */}
      <AnimatePresence>
        {showShare && createdInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShare(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-tz-green/10 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-7 h-7 text-tz-green" />
                </div>
                <h2 className="text-lg font-bold text-tz-espresso">{t.inviteCreated}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.sendTo}: <span className="font-medium text-tz-espresso">{createdInvite.email}</span>
                </p>
              </div>

              {/* Invite Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">{t.inviteLink}</label>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 px-4 rounded-xl bg-tz-cream flex items-center text-sm text-muted-foreground truncate">
                    {createdInvite.inviteUrl}
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="h-12 px-4 rounded-xl"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-tz-green" />
                    ) : (
                      <Link2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {copied && (
                  <p className="text-xs text-tz-green mt-1 text-center">{t.linkCopied}</p>
                )}
              </div>

              {/* Share Buttons */}
              <div className="space-y-2">
                <a
                  href={getWhatsAppShareUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {t.shareViaWhatsApp}
                </a>

                <Button
                  variant="outline"
                  onClick={() => {
                    setShowShare(false);
                    setCreatedInvite(null);
                  }}
                  className="w-full h-12 rounded-xl"
                >
                  {t.close}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
