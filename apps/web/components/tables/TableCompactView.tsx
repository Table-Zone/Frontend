'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/shared/Toast';
import { History, Pencil, Trash2, Play, Square, ArrowRightLeft } from 'lucide-react';
import SubscriptionPopup from '@/components/shared/SubscriptionPopup';
import SessionHistoryModal from './SessionHistoryModal';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { tableAPI } from '@/lib/api';

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

interface TableCompactViewProps {
  tables: Table[];
  allTables?: Table[];
  workspaceId: string;
  subscriptionActive: boolean;
  onUpdate: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  free: { bg: 'bg-tz-green', text: 'text-tz-green', border: 'border-tz-green/25', gradient: 'from-tz-green to-[#4CAF7A]' },
  occupied: { bg: 'bg-tz-blue', text: 'text-tz-blue', border: 'border-tz-blue/25', gradient: 'from-tz-blue to-[#4A90D9]' },
  warning: { bg: 'bg-tz-amber', text: 'text-tz-amber', border: 'border-tz-amber/35', gradient: 'from-tz-amber to-[#D97706]' },
  alert: { bg: 'bg-tz-red', text: 'text-tz-red', border: 'border-tz-red/35', gradient: 'from-tz-red to-[#DC2626]' },
};

function formatTime(totalSeconds: number): string {
  const isOvertime = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  const sign = isOvertime ? '+' : '';
  return `${sign}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function TableCompactCard({
  table,
  allTables = [],
  workspaceId,
  subscriptionActive,
  onUpdate,
  onDelete,
}: {
  table: Table;
  allTables?: Table[];
  workspaceId: string;
  subscriptionActive: boolean;
  onUpdate: () => void;
  onDelete?: () => void;
}) {
  const { t, isRTL } = useLanguage();

  const [remainingSeconds, setRemainingSeconds] = useState(table.remainingSeconds ?? 0);
  const [note, setNote] = useState(table.note ?? '');
  const [name, setName] = useState(table.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTransferPicker, setShowTransferPicker] = useState(false);
  const transferPickerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [showSubscribe, setShowSubscribe] = useState(false);
  const noteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(table.note ?? '');
  }, [table.note]);

  useEffect(() => {
    if (table.remainingSeconds === null) { setRemainingSeconds(0); return; }
    setRemainingSeconds(table.remainingSeconds);
    const interval = setInterval(() => setRemainingSeconds((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [table.remainingSeconds]);

  const effectiveStatus: Table['status'] = (() => {
    if (table.status === 'free') return 'free';
    if (remainingSeconds <= 0) return 'alert';
    if (remainingSeconds <= (table.warningThresholdMinutes || 5) * 60) return 'warning';
    return 'occupied';
  })();

  const displayStatus = table.status === 'free' ? 'free' : effectiveStatus;
  const cfg = statusConfig[displayStatus];
  const timerText = formatTime(remainingSeconds);
  const isOccupied = displayStatus !== 'free';

  const handleStart = async () => {
    if (!subscriptionActive) { setShowSubscribe(true); return; }
    setLoading(true);
    try { await tableAPI.startTimer(workspaceId, table.id); onUpdate(); } catch { /* silent */ } finally { setLoading(false); }
  };

  const handleStop = async () => {
    setLoading(true);
    try { await tableAPI.stopTimer(workspaceId, table.id); onUpdate(); } finally { setLoading(false); }
  };

  const handleNameSave = async () => {
    setIsEditingName(false);
    if (name.trim() && name !== table.name) {
      try { await tableAPI.updateName(workspaceId, table.id, name.trim()); onUpdate(); } catch { setName(table.name); }
    }
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    noteTimeoutRef.current = setTimeout(async () => {
      try { await tableAPI.updateNote(workspaceId, table.id, val); onUpdate(); } catch { /* silent */ }
    }, 600);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      await tableAPI.deleteTable(workspaceId, table.id);
      showToast(isRTL ? `تم حذف "${table.name}"` : `"${table.name}" deleted`, 'success');
      onDelete?.();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || (isRTL ? 'فشل الحذف' : 'Failed to delete'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showTransferPicker) return;
    const handler = (e: MouseEvent) => {
      if (transferPickerRef.current && !transferPickerRef.current.contains(e.target as Node)) {
        setShowTransferPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTransferPicker]);

  const freeTables = allTables.filter((t) => t.status === 'free' && t.id !== table.id);

  const handleTransferTo = async (targetId: string, targetName: string) => {
    setShowTransferPicker(false);
    setLoading(true);
    try {
      await tableAPI.transferTimer(workspaceId, table.id, targetId);
      showToast(
        isRTL
          ? `تم نقل الجلسة من "${table.name}" إلى "${targetName}"`
          : `Session moved from "${table.name}" to "${targetName}"`,
        'success'
      );
      onUpdate();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message;
      showToast(msg || (isRTL ? 'فشل نقل الجلسة' : 'Failed to transfer session'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border ${cfg.border} p-3 flex flex-col`}>
      {/* Top row: status strip + name + actions */}
      <div className="flex items-start gap-2.5 mb-2.5">
        {/* Color strip */}
        <div className={`w-1.5 h-10 rounded-full ${cfg.bg} shrink-0 mt-0.5`} />

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-xs font-bold bg-tz-cream dark:bg-gray-800 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-tz-primary/30 w-20"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-bold break-all whitespace-normal leading-tight">{table.name}</h3>
              <button onClick={() => setIsEditingName(true)} className="p-0.5 rounded hover:bg-tz-cream text-muted-foreground">
                <Pencil className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
          <p className="text-[9px] text-muted-foreground">#{table.position}</p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setShowHistory(true)} className="p-1.5 rounded-lg hover:bg-tz-cream dark:hover:bg-gray-800 text-muted-foreground">
            <History className="w-3 h-3" />
          </button>
          {onDelete && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-lg hover:bg-tz-red/10 text-muted-foreground hover:text-tz-red">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Timer - big and readable */}
      <div className="flex-1 flex items-center justify-center py-1">
        <span className={`text-2xl font-extrabold font-mono tracking-tight ${cfg.text}`}>
          {timerText}
        </span>
      </div>

      {/* Bottom row: note + button */}
      <div className="mt-2 space-y-2">
        {/* Note input */}
        <input
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder={t.addNote}
          className="w-full bg-tz-cream dark:bg-gray-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-tz-primary/20"
        />

        {/* Start / Stop + Transfer */}
        {isOccupied ? (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleStop}
              disabled={loading}
              className="flex-1 h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-60 bg-gradient-to-br from-tz-red to-[#DC2626]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              {t.stop}
            </button>
            <div className="relative" ref={transferPickerRef}>
              <button
                type="button"
                onClick={() => setShowTransferPicker((v) => !v)}
                disabled={loading}
                className="h-9 px-2.5 rounded-xl bg-tz-cream dark:bg-gray-800 hover:bg-tz-cream-dark dark:hover:bg-gray-700 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 font-bold text-xs transition-all disabled:opacity-60 active:scale-95"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {t.transfer}
              </button>
              {showTransferPicker && (
                <div className="absolute bottom-10 right-0 z-20 min-w-[140px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 overflow-hidden">
                  <p className="text-[11px] font-semibold text-muted-foreground px-3 pb-1.5 pt-0.5">{t.transferTo}</p>
                  {freeTables.length === 0 ? (
                    <p className="text-xs text-muted-foreground px-3 py-2">{t.noFreeTables}</p>
                  ) : (
                    freeTables.map((ft) => (
                      <button
                        key={ft.id}
                        type="button"
                        onClick={() => handleTransferTo(ft.id, ft.name)}
                        className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-tz-cream dark:hover:bg-gray-800 transition-colors"
                      >
                        {ft.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full h-9 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-60 bg-gradient-to-br from-tz-primary to-[#E87E3A]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {t.start}
          </button>
        )}
      </div>

      {showSubscribe && <SubscriptionPopup workspaceId={workspaceId} onClose={() => setShowSubscribe(false)} />}
      {showHistory && <SessionHistoryModal workspaceId={workspaceId} tableId={table.id} tableName={table.name} onClose={() => setShowHistory(false)} />}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={isRTL ? 'حذف الطاولة' : 'Delete Table'}
        message={isRTL ? `حذف "${table.name}"؟` : `Delete "${table.name}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={loading}
      />
    </div>
  );
}

export default function TableCompactView({ tables, allTables, workspaceId, subscriptionActive, onUpdate, onDelete }: TableCompactViewProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {tables.map((table) => (
        <TableCompactCard
          key={table.id}
          table={table}
          allTables={allTables ?? tables}
          workspaceId={workspaceId}
          subscriptionActive={subscriptionActive}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
