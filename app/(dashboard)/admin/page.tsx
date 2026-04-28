'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CreditCard, Check, X, Search, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminAPI } from '@/lib/api';

interface Request {
  id: string;
  workspaceId: string;
  workspaceName: string;
  plan: string;
  priceSar: number;
  status: 'pending' | 'approved' | 'rejected';
  bankReference: string | null;
  receiptImageUrl: string | null;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export default function AdminPage() {
  const { t, isRTL } = useLanguage();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchRequests = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await adminAPI.getPendingRequests(filter === 'all' ? undefined : filter);
      setRequests(res.data.data.requests || []);
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
    fetchRequests();
  }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveRequest(id);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectRequest(id);
      fetchRequests();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t.error);
    }
  };

  const filtered = requests.filter((r) =>
    r.workspaceName.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

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
          {isRTL ? 'إدارة الاشتراكات' : 'Subscription Management'}
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: isRTL ? 'معلقة' : 'Pending', count: pendingCount, color: 'bg-tz-amber/10 text-tz-amber' },
          { label: isRTL ? 'الكل' : 'Total', count: requests.length, color: 'bg-tz-blue/10 text-tz-blue' },
          { label: isRTL ? 'مقبولة' : 'Approved', count: requests.filter((r) => r.status === 'approved').length, color: 'bg-tz-green/10 text-tz-green' },
          { label: isRTL ? 'مرفوضة' : 'Rejected', count: requests.filter((r) => r.status === 'rejected').length, color: 'bg-tz-red/10 text-tz-red' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl p-4 ${stat.color} border border-current/10`}
          >
            <p className="text-2xl font-bold">{stat.count}</p>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
          </motion.div>
        ))}
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
                </div>
                <p className="text-sm text-muted-foreground">{req.userName} · {req.userEmail}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    {req.plan === 'monthly' ? t.monthly : t.quarterly} · {req.priceSar} SAR
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

            {req.receiptImageUrl && (
              <div className="mt-3 pt-3 border-t border-tz-cream-dark">
                <a
                  href={req.receiptImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-tz-primary hover:underline"
                >
                  {isRTL ? 'عرض الإيصال' : 'View Receipt'}
                </a>
                {req.bankReference && (
                  <span className="text-sm text-muted-foreground ml-3">
                    Ref: {req.bankReference}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
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
