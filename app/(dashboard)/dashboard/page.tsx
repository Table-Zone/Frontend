'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wifi, Plus, LayoutGrid, List, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TableGridView from '@/components/tables/TableGridView';
import TableListView from '@/components/tables/TableListView';
import TableCompactView from '@/components/tables/TableCompactView';
import SubscriptionPopup from '@/components/shared/SubscriptionPopup';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { tableAPI, workspaceAPI } from '@/lib/api';

type DashboardView = 'grid' | 'list' | 'compact';

interface Table {
  id: string;
  name: string;
  status: 'free' | 'occupied' | 'warning' | 'alert';
  timerStartedAt: string | null;
  timerDurationMinutes: number;
  warningThresholdMinutes: number;
  remainingSeconds: number | null;
  note: string | null;
  position: number;
}

interface Workspace {
  id: string;
  name: string;
  subscription: { status: string } | null;
}

const viewOptions: { value: DashboardView; icon: typeof LayoutGrid; labelAr: string; labelEn: string }[] = [
  { value: 'grid', icon: LayoutGrid, labelAr: 'شبكة', labelEn: 'Grid' },
  { value: 'list', icon: List, labelAr: 'قائمة', labelEn: 'List' },
  { value: 'compact', icon: Grip, labelAr: 'مضغوط', labelEn: 'Compact' },
];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workspaceSlug = searchParams.get('workspaceSlug');
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [tables, setTables] = useState<Table[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [dashboardView, setDashboardView] = useState<DashboardView>('grid');

  // Load saved view preference
  useEffect(() => {
    const saved = localStorage.getItem('dashboard_view') as DashboardView;
    if (saved && viewOptions.some((v) => v.value === saved)) {
      setDashboardView(saved);
    }
  }, []);

  const saveView = (view: DashboardView) => {
    setDashboardView(view);
    localStorage.setItem('dashboard_view', view);
  };

  const fetchTables = async () => {
    if (!workspace?.id) return;
    try {
      const res = await tableAPI.getTables(workspace.id);
      setTables(res.data.data.tables);
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const wsRes = await workspaceAPI.getMyWorkspace(workspaceSlug || undefined);
        const ws = wsRes.data.data.workspace;
        setWorkspace(ws);
        // Persist current workspace slug so navigation between pages remembers it
        if (ws.slug) {
          localStorage.setItem('currentWorkspaceSlug', ws.slug);
        }

        const tablesRes = await tableAPI.getTables(ws.id);
        setTables(tablesRes.data.data.tables);
      } catch (error: any) {
        console.error('Failed to load dashboard:', error);
        if (error.response?.status === 404) {
          if (user?.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/create-workspace');
          }
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!workspace?.id) return;

    let socket: any;
    let heartbeat: ReturnType<typeof setInterval>;

    const initSocket = async () => {
      const { io } = await import('socket.io-client');
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: { token: localStorage.getItem('access_token') },
      });

      socket.on('connect', () => {
        setSocketConnected(true);
        socket.emit('join-workspace', { workspaceId: workspace.id });
      });
      socket.on('disconnect', () => setSocketConnected(false));

      socket.on('table:timer:started', () => fetchTables());
      socket.on('table:timer:stopped', () => fetchTables());
      socket.on('table:status:changed', () => fetchTables());
      socket.on('table:updated', () => fetchTables());
      socket.on('table:created', () => fetchTables());
      socket.on('table:deleted', () => fetchTables());
      socket.on('table:warning:triggered', () => fetchTables());
      socket.on('table:alert:triggered', () => fetchTables());

      heartbeat = setInterval(() => socket?.emit('heartbeat'), 60000);
    };

    initSocket();

    return () => {
      clearInterval(heartbeat);
      socket?.disconnect();
    };
  }, [workspace?.id]);

  const handleAddTable = async () => {
    if (!newTableName.trim() || !workspace) return;
    setIsAddingTable(true);
    try {
      await tableAPI.createTable(workspace.id, { name: newTableName.trim() });
      setNewTableName('');
      setShowAddTable(false);
      fetchTables();
    } catch (err) {
      console.error('Failed to add table:', err);
    } finally {
      setIsAddingTable(false);
    }
  };

  const subscriptionActive = workspace?.subscription?.status === 'active';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-tz-primary border-t-transparent" />
      </div>
    );
  }

  const freeCount = tables.filter((t) => t.status === 'free').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const warningCount = tables.filter((t) => t.status === 'warning').length;
  const alertCount = tables.filter((t) => t.status === 'alert').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-tz-espresso">{workspace?.name || t.dashboard}</h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-muted-foreground text-sm">
              {isRTL ? `${tables.length} طاولة` : `${tables.length} tables`}
            </p>
            <div className="flex items-center gap-1.5">
              <Wifi className={`w-3.5 h-3.5 ${socketConnected ? 'text-tz-green' : 'text-tz-red'}`} />
              <span className="text-xs text-muted-foreground">
                {socketConnected ? (isRTL ? 'متصل' : 'Live') : (isRTL ? 'غير متصل' : 'Offline')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-tz-cream dark:bg-gray-800 rounded-xl p-1 gap-0.5">
            {viewOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = dashboardView === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => saveView(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white dark:bg-gray-700 text-tz-espresso dark:text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={isRTL ? opt.labelAr : opt.labelEn}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{isRTL ? opt.labelAr : opt.labelEn}</span>
                </button>
              );
            })}
          </div>

          {!subscriptionActive && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-tz-amber/10 border border-tz-amber/20"
            >
              <AlertTriangle className="w-5 h-5 text-tz-amber shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-tz-amber">
                  {isRTL ? 'الاشتراك غير نشط' : 'Subscription inactive'}
                </p>
                <p className="text-xs text-tz-amber/70">
                  {isRTL ? 'المؤقتات معطلة — اشترك لتفعيلها' : 'Timers disabled — subscribe to activate'}
                </p>
              </div>
              <Button size="sm" className="bg-tz-primary hover:bg-tz-primary-dark text-white shrink-0" onClick={() => setShowSubscriptionPopup(true)}>
                {t.viewPlans}
              </Button>
            </motion.div>
          )}
          <Button
            onClick={() => setShowAddTable(true)}
            className="bg-tz-espresso hover:bg-tz-espresso/90 text-white h-11 px-4 gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.addTable}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: t.free, count: freeCount, color: 'bg-tz-green/10 text-tz-green' },
          { label: t.occupied, count: occupiedCount, color: 'bg-tz-blue/10 text-tz-blue' },
          { label: t.warning, count: warningCount, color: 'bg-tz-amber/10 text-tz-amber' },
          { label: t.alert, count: alertCount, color: 'bg-tz-red/10 text-tz-red' },
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

      {/* Tables View */}
      {dashboardView === 'grid' && (
        <TableGridView
          tables={tables}
          workspaceId={workspace?.id || ''}
          subscriptionActive={subscriptionActive}
          onUpdate={fetchTables}
          onDelete={fetchTables}
        />
      )}
      {dashboardView === 'list' && (
        <TableListView
          tables={tables}
          workspaceId={workspace?.id || ''}
          subscriptionActive={subscriptionActive}
          onUpdate={fetchTables}
          onDelete={fetchTables}
        />
      )}
      {dashboardView === 'compact' && (
        <TableCompactView
          tables={tables}
          workspaceId={workspace?.id || ''}
          subscriptionActive={subscriptionActive}
          onUpdate={fetchTables}
          onDelete={fetchTables}
        />
      )}

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddTable(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-lg font-bold mb-4">{t.addTable}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.tableName}</label>
                  <Input
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder={isRTL ? 'مثال: طاولة 6' : 'e.g. Table 6'}
                    className="h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTable()}
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTable(false)}
                    className="flex-1 h-12 rounded-xl"
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={handleAddTable}
                    disabled={isAddingTable || !newTableName.trim()}
                    className="flex-1 h-12 rounded-xl bg-tz-primary hover:bg-tz-primary-dark text-white"
                  >
                    {isAddingTable ? t.loading : t.addTable}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Popup */}
      <AnimatePresence>
        {showSubscriptionPopup && workspace && (
          <SubscriptionPopup workspaceId={workspace.id} onClose={() => setShowSubscriptionPopup(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
