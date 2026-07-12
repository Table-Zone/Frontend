'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/shared/Toast';
import { useConfirm } from '@/components/shared/ConfirmDialog';
import { adminAPI } from '@/lib/api';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminFilterTabs } from '@/components/admin/AdminFilterTabs';

interface Dashboard {
  totalRevenue: number;
  currentBalance: number;
  totalPayments: number;
  totalExpenses: number;
  totalExpensesAmount: number;
  netProfit: number;
}

interface Transaction {
  id: string;
  type: string;
  amountSar: number;
  status: string;
  description?: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
}

export default function FinancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chart, setChart] = useState<Array<{ period: string; revenue: number; expenses: number }>>([]);
  const [topServices, setTopServices] = useState<Array<{ type: string; revenue: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [txFilter, setTxFilter] = useState<'all' | 'subscription' | 'extra_seats' | 'expense'>('all');
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [expenseDialog, setExpenseDialog] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ name: '', amountSar: 0, reason: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, txRes, reportRes] = await Promise.all([
        adminAPI.getFinanceDashboard(),
        adminAPI.getFinanceTransactions({
          type: txFilter === 'all' ? undefined : txFilter,
          limit: 50,
        }),
        adminAPI.getFinanceReports(reportPeriod),
      ]);
      setDashboard(dashRes.data.data.dashboard);
      setTransactions(txRes.data.data.transactions || []);
      setChart(reportRes.data.data.reports?.chart || []);
      setTopServices(reportRes.data.data.reports?.topServices || []);
    } catch {
      showToast(isRTL ? 'فشل التحميل' : 'Failed to load', 'error');
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
  }, [txFilter, reportPeriod, user]);

  const handleCreateExpense = async () => {
    setIsSaving(true);
    try {
      await adminAPI.createExpense(expenseForm);
      showToast(isRTL ? 'تم تسجيل المصروف' : 'Expense recorded', 'success');
      setExpenseDialog(false);
      setExpenseForm({ name: '', amountSar: 0, reason: '' });
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || 'Error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const maxChartValue = Math.max(...chart.map((c) => Math.max(c.revenue, c.expenses)), 1);

  const txFilterLabels = {
    all: isRTL ? 'الكل' : 'All',
    subscription: isRTL ? 'اشتراكات' : 'Subscriptions',
    extra_seats: isRTL ? 'مقاعد' : 'Seats',
    expense: isRTL ? 'مصروفات' : 'Expenses',
  };

  const periodLabels = {
    daily: isRTL ? 'يومي' : 'Daily',
    weekly: isRTL ? 'أسبوعي' : 'Weekly',
    monthly: isRTL ? 'شهري' : 'Monthly',
    yearly: isRTL ? 'سنوي' : 'Yearly',
  };

  return (
    <div>
      <AdminPageHeader
        title={isRTL ? 'الإدارة المالية' : 'Financial Management'}
        icon={Wallet}
        action={
          <Button onClick={() => setExpenseDialog(true)}>
            <Plus className="w-4 h-4 me-2" />
            {isRTL ? 'إضافة مصروف' : 'Add Expense'}
          </Button>
        }
      />

      {dashboard && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <AdminStatsCard label={isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'} count={`${dashboard.totalRevenue.toFixed(0)} SAR`} icon={TrendingUp} color="bg-tz-green/10 text-tz-green" />
          <AdminStatsCard label={isRTL ? 'الرصيد الحالي' : 'Balance'} count={`${dashboard.currentBalance.toFixed(0)} SAR`} icon={Wallet} color="bg-tz-blue/10 text-tz-blue" delay={0.1} />
          <AdminStatsCard label={isRTL ? 'المدفوعات' : 'Payments'} count={dashboard.totalPayments} icon={TrendingUp} color="bg-tz-primary/10 text-tz-primary" delay={0.2} />
          <AdminStatsCard label={isRTL ? 'المصروفات' : 'Expenses'} count={`${dashboard.totalExpensesAmount.toFixed(0)} SAR`} icon={TrendingDown} color="bg-tz-red/10 text-tz-red" delay={0.3} />
          <AdminStatsCard label={isRTL ? 'صافي الأرباح' : 'Net Profit'} count={`${dashboard.netProfit.toFixed(0)} SAR`} icon={Wallet} color="bg-tz-amber/10 text-tz-amber" delay={0.4} />
        </div>
      )}

      {/* Reports Chart */}
      <div className="bg-white rounded-2xl border border-tz-cream-dark p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{isRTL ? 'التقارير' : 'Reports'}</h2>
          <AdminFilterTabs
            filters={['daily', 'weekly', 'monthly', 'yearly'] as const}
            active={reportPeriod}
            onChange={setReportPeriod}
            labels={periodLabels}
          />
        </div>
        {chart.length > 0 ? (
          <div className="flex items-end gap-2 h-40 overflow-x-auto pb-2">
            {chart.map((item) => (
              <div key={item.period} className="flex flex-col items-center gap-1 min-w-[40px]">
                <div className="flex gap-0.5 items-end h-32">
                  <div
                    className="w-3 bg-tz-green rounded-t"
                    style={{ height: `${(item.revenue / maxChartValue) * 100}%`, minHeight: item.revenue > 0 ? 4 : 0 }}
                    title={`Revenue: ${item.revenue}`}
                  />
                  <div
                    className="w-3 bg-tz-red rounded-t"
                    style={{ height: `${(item.expenses / maxChartValue) * 100}%`, minHeight: item.expenses > 0 ? 4 : 0 }}
                    title={`Expenses: ${item.expenses}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground rotate-0 truncate max-w-[50px]">{item.period}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">{isRTL ? 'لا توجد بيانات' : 'No data'}</p>
        )}
        <div className="flex gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-tz-green rounded" />{isRTL ? 'إيرادات' : 'Revenue'}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-tz-red rounded" />{isRTL ? 'مصروفات' : 'Expenses'}</span>
        </div>
      </div>

      {/* Top Services */}
      {topServices.length > 0 && (
        <div className="bg-white rounded-2xl border border-tz-cream-dark p-6 mb-8">
          <h2 className="font-bold text-lg mb-4">{isRTL ? 'أكثر الخدمات إيرادًا' : 'Top Revenue Services'}</h2>
          <div className="space-y-2">
            {topServices.map((s) => (
              <div key={s.type} className="flex justify-between items-center">
                <span className="capitalize">{s.type.replace('_', ' ')}</span>
                <span className="font-semibold text-tz-green">{s.revenue.toFixed(0)} SAR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions */}
      <h2 className="font-bold text-lg mb-4">{isRTL ? 'العمليات المالية' : 'Transactions'}</h2>
      <div className="mb-4">
        <AdminFilterTabs filters={['all', 'subscription', 'extra_seats', 'expense'] as const} active={txFilter} onChange={setTxFilter} labels={txFilterLabels} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-tz-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <motion.div key={tx.id} className="bg-white rounded-2xl border border-tz-cream-dark p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={tx.type === 'expense' ? 'alert' : 'free'}>{tx.type}</Badge>
                  <span className="font-medium">{tx.description || tx.type}</span>
                </div>
                {tx.userName && <p className="text-sm text-muted-foreground">{tx.userName} ({tx.userEmail})</p>}
                <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString(isRTL ? 'ar-SA' : 'en-US')}</p>
              </div>
              <span className={`font-bold text-lg ${tx.type === 'expense' ? 'text-tz-red' : 'text-tz-green'}`}>
                {tx.type === 'expense' ? '-' : '+'}{tx.amountSar.toFixed(0)} SAR
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إضافة مصروف' : 'Add Expense'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Input placeholder={isRTL ? 'اسم المصروف' : 'Expense name'} value={expenseForm.name} onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })} />
            <Input type="number" placeholder={isRTL ? 'القيمة' : 'Amount'} value={expenseForm.amountSar} onChange={(e) => setExpenseForm({ ...expenseForm, amountSar: parseFloat(e.target.value) || 0 })} />
            <Input placeholder={isRTL ? 'السبب' : 'Reason'} value={expenseForm.reason} onChange={(e) => setExpenseForm({ ...expenseForm, reason: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialog(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleCreateExpense} disabled={isSaving}>{isRTL ? 'حفظ' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
