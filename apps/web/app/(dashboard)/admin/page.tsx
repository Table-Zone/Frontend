'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, CreditCard, Check, X, Search, Clock, AlertTriangle,
  Building2, Users, TrendingUp, Ban, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI, getImageUrl } from '@/lib/api';

interface Request {
  id: string;
  workspaceId: string;
  workspaceName: string;
  plan: string;
  priceSar: number;
  status: 'pending' | 'approved' | 'rejected';
  type: string;
  extraSeatsCount: number;
  bankReference: string | null;
  receiptImageUrl: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
}

function getReceiptUrl(relativePath: string | null): string | null {
  if (!relativePath) return null;
  return getImageUrl(relativePath);
}

function isPdfReceipt(url: string): boolean {
  return url.toLowerCase().includes('.pdf');
}

interface Stats {
  totalWorkspaces: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Stats>({
    totalWorkspaces: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; isPdf: boolean } | null>(null);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch subscription requests
      const reqRes = await adminAPI.getPendingRequests(filter === 'all' ? undefined : filter);
      const reqs = reqRes.data.data.requests || [];
      setRequests(reqs);

      // Fetch workspaces count (limit 1, we just need total)
      const wsRes = await adminAPI.getWorkspaces({ limit: 1 });
      const totalWorkspaces = wsRes.data.data.total || 0;

      // Fetch all requests for stats
      const allReqRes = await adminAPI.getPendingRequests();
      const allReqs = allReqRes.data.data.requests || [];

      setStats({
        totalWorkspaces,
        pendingRequests: allReqs.filter((r: Request) => r.status === 'pending').length,
        approvedRequests: allReqs.filter((r: Request) => r.status === 'approved').length,
        rejectedRequests: allReqs.filter((r: Request) => r.status === 'rejected').length,
      });
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(isRTL ? 'غير مصرح — يتطلب صلاحية مدير' : 'Unauthorized — admin access required');
      } else {
        setError(t.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [filter, user]);

  const handleApprove = async (id: string) => {
    const ok = await confirm({
      title: isRTL ? 'تأكيد الطلب' : 'Approve Request',
      message: isRTL ? 'هل أنت متأكد من قبول هذا الطلب؟' : 'Are you sure you want to approve this request?',
      confirmLabel: isRTL ? 'قبول' : 'Approve',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'info',
    });
    if (!ok) return;
    try {
      await adminAPI.approveRequest(id);
      showToast(isRTL ? 'تم قبول الطلب' : 'Request approved', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || t.error, 'error');
    }
  };

  const handleReject = async (id: string) => {
    const ok = await confirm({
      title: isRTL ? 'رفض الطلب' : 'Reject Request',
      message: isRTL ? 'هل أنت متأكد من رفض هذا الطلب؟' : 'Are you sure you want to reject this request?',
      confirmLabel: isRTL ? 'رفض' : 'Reject',
      cancelLabel: isRTL ? 'إلغاء' : 'Cancel',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await adminAPI.rejectRequest(id);
      showToast(isRTL ? 'تم رفض الطلب' : 'Request rejected', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || t.error, 'error');
    }
  };

  const filtered = requests.filter((r) =>
    r.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-tz-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-tz-primary" />
        </div>
        <h1 className="text-2xl font-bold text-tz-espresso">
          {isRTL ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
        </h1>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: isRTL ? 'إجمالي المساحات' : 'Total Workspaces', count: stats.totalWorkspaces, icon: Building2, color: 'bg-tz-blue/10 text-tz-blue' },
          { label: isRTL ? 'طلبات معلقة' : 'Pending Requests', count: stats.pendingRequests, icon: Clock, color: 'bg-tz-amber/10 text-tz-amber' },
          { label: isRTL ? 'مقبولة' : 'Approved', count: stats.approvedRequests, icon: Check, color: 'bg-tz-green/10 text-tz-green' },
          { label: isRTL ? 'مرفوضة' : 'Rejected', count: stats.rejectedRequests, icon: Ban, color: 'bg-tz-red/10 text-tz-red' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-4 ${stat.color} border border-current/10`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="w-5 h-5 opacity-60" />
              <p className="text-2xl font-bold">{stat.count}</p>
            </div>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Subscription Requests Section */}
      <div className="flex items-center gap-3 mb-4">
        <CreditCard className="w-5 h-5 text-tz-primary" />
        <h2 className="text-lg font-bold text-tz-espresso">
          {isRTL ? 'طلبات الاشتراك' : 'Subscription Requests'}
        </h2>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                filter === f
                  ? 'bg-tz-primary text-white shadow-md'
                  : 'bg-white text-muted-foreground hover:bg-tz-cream-dark border border-tz-cream-dark'
              }`}
            >
              {f === 'all' && (isRTL ? 'الكل' : 'All')}
              {f === 'pending' && (isRTL ? 'معلقة' : 'Pending')}
              {f === 'approved' && (isRTL ? 'مقبولة' : 'Approved')}
              {f === 'rejected' && (isRTL ? 'مرفوضة' : 'Rejected')}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} w-5 h-5 text-muted-foreground`} />
          <Input
            placeholder={isRTL ? 'بحث بالمساحة أو البريد...' : 'Search by workspace or email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${isRTL ? 'pr-10' : 'pl-10'} h-11`}
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-tz-cream-dark">
            {isRTL ? 'لا توجد طلبات' : 'No requests found'}
          </div>
        )}
        {filtered.map((req) => (
          <div
            key={req.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-tz-cream-dark"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{req.workspaceName}</h3>
                  <StatusBadge status={req.status} />
                  {req.type === 'extra_seats' && (
                    <span className="px-2 py-0.5 rounded-full bg-tz-blue/10 text-tz-blue text-[10px] font-bold">
                      {isRTL ? `+${req.extraSeatsCount} مقعد` : `+${req.extraSeatsCount} seats`}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{req.userName} · {req.userEmail}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    {req.type === 'extra_seats'
                      ? (isRTL ? `مقاعد إضافية · ${req.priceSar} ر.س` : `Extra Seats · ${req.priceSar} SAR`)
                      : `${req.plan === 'monthly' ? t.monthly : req.plan === 'quarterly' ? t.quarterly : req.plan} · ${req.priceSar} SAR`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(req.id)}
                    className="bg-tz-green hover:bg-tz-green/90 text-white h-9"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {t.confirm}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(req.id)}
                    className="text-tz-red border-tz-red/20 hover:bg-tz-red/10 h-9"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t.reject}
                  </Button>
                </div>
              )}
            </div>

            {req.receiptImageUrl && (() => {
              const receiptUrl = getReceiptUrl(req.receiptImageUrl);
              if (!receiptUrl) return null;
              const isPdf = isPdfReceipt(receiptUrl);
              return (
                <div className="mt-3 pt-3 border-t border-tz-cream-dark flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewingReceipt({ url: receiptUrl, isPdf })}
                    className="flex items-center gap-2 text-sm text-tz-primary hover:underline"
                  >
                    <Receipt className="w-4 h-4 shrink-0" />
                    {isRTL ? 'عرض الإيصال' : 'View Receipt'}
                  </button>
                  {!isPdf && (
                    <button
                      type="button"
                      onClick={() => setViewingReceipt({ url: receiptUrl, isPdf: false })}
                      className="rounded-lg border border-tz-cream-dark overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={receiptUrl}
                        alt={isRTL ? 'معاينة الإيصال' : 'Receipt preview'}
                        className="h-16 w-auto max-w-[120px] object-cover"
                      />
                    </button>
                  )}
                  {isPdf && (
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-tz-cream-dark">
                      PDF
                    </span>
                  )}
                  {req.bankReference && (
                    <span className="text-sm text-muted-foreground">
                      Ref: {req.bankReference}
                    </span>
                  )}
                </div>
              );
            })()}
          </div>
        ))}
      </div>
      {/* Receipt Image Modal */}
      {viewingReceipt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setViewingReceipt(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative bg-white rounded-2xl p-2 max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
            {viewingReceipt.isPdf ? (
              <iframe
                src={viewingReceipt.url}
                title="Receipt PDF"
                className="w-full min-h-[70vh] rounded-xl border-0"
              />
            ) : (
              <img
                src={viewingReceipt.url}
                alt="Receipt"
                className="w-full h-auto rounded-xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <a
              href={viewingReceipt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-tz-primary mt-3 hover:underline"
            >
              {isRTL ? 'فتح في تبويب جديد' : 'Open in new tab'}
            </a>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: 'bg-tz-amber/10 text-tz-amber',
    approved: 'bg-tz-green/10 text-tz-green',
    rejected: 'bg-tz-red/10 text-tz-red',
  };

  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}
