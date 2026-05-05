'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/shared/Toast';
import { History, Pencil, Trash2, Clock, Play, Square, ChevronDown, ChevronUp, ArrowRightLeft } from 'lucide-react';
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

interface TableListViewProps {
  tables: Table[];
  allTables?: Table[];
  workspaceId: string;
  subscriptionActive: boolean;
  onUpdate: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  free: { bg: 'bg-tz-green', text: 'text-tz-green', light: 'bg-tz-green/10', border: 'border-tz-green/20' },
  occupied: { bg: 'bg-tz-blue', text: 'text-tz-blue', light: 'bg-tz-blue/10', border: 'border-tz-blue/20' },
  warning: { bg: 'bg-tz-amber', text: 'text-tz-amber', light: 'bg-tz-amber/10', border: 'border-tz-amber/30' },
  alert: { bg: 'bg-tz-red', text: 'text-tz-red', light: 'bg-tz-red/10', border: 'border-tz-red/30' },
};

function formatTime(totalSeconds: number): { text: string; isOvertime: boolean } {
  const isOvertime = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  const sign = isOvertime ? '+' : '';
  return { text: `${sign}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, isOvertime };
}

function TableListItem({
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
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTransferPicker, setShowTransferPicker] = useState(false);
  const transferPickerRef = useRef<HTMLDivElement>(null);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const noteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(table.note ?? '');
  }, [table.note]);

  useEffect(() => {
    if (table.remainingSeconds === null) {
      setRemainingSeconds(0);
      return;
    }
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
  const { text: timerText } = formatTime(remainingSeconds);
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
    <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-sm border ${cfg.border}`}>
      {/* Main row - always visible */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Status indicator */}
        <div className={`w-2 h-10 rounded-full ${cfg.bg} shrink-0`} />

        {/* Name + position */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-sm font-bold bg-tz-cream dark:bg-gray-800 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-tz-primary/30 w-28"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold break-all whitespace-normal leading-tight">{table.name}</h3>
              <button onClick={() => setIsEditingName(true)} className="p-0.5 rounded hover:bg-tz-cream text-muted-foreground">
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">#{table.position}</p>
        </div>

        {/* Timer */}
        <div className="text-center shrink-0">
          <div className={`text-xl font-extrabold font-mono tracking-tight ${cfg.text}`}>
            {timerText}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {table.timerDurationMinutes} min
          </div>
        </div>

        {/* Start/Stop button */}
        <button
          type="button"
          onClick={isOccupied ? handleStop : handleStart}
          disabled={loading}
          className={`shrink-0 h-10 px-3 rounded-xl flex items-center justify-center gap-1.5 text-white font-bold text-sm shadow-md active:scale-90 transition-all disabled:opacity-60 ${
            isOccupied ? 'bg-gradient-to-br from-tz-red to-[#DC2626]' : 'bg-gradient-to-br from-tz-primary to-[#E87E3A]'
          }`}
        >
          {isOccupied ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          {isOccupied ? t.stop : t.start}
        </button>

        {/* Transfer button (occupied only) */}
        {isOccupied && (
          <div className="relative shrink-0" ref={transferPickerRef}>
            <button
              type="button"
              onClick={() => setShowTransferPicker((v) => !v)}
              disabled={loading}
              className="h-10 px-3 rounded-xl bg-tz-cream dark:bg-gray-800 hover:bg-tz-cream-dark dark:hover:bg-gray-700 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 font-bold text-sm transition-all disabled:opacity-60 active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {t.transfer}
            </button>
            {showTransferPicker && (
              <div className="absolute bottom-12 right-0 z-20 min-w-[160px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 overflow-hidden">
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
        )}

        {/* Expand chevron */}
        <button onClick={() => setExpanded(!expanded)} className="shrink-0 p-2 rounded-lg hover:bg-tz-cream dark:hover:bg-gray-800 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-800 space-y-3">
          {/* Status pill */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.light} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.bg}`} />
              {t.status[displayStatus]}
            </span>
          </div>

          {/* Note */}
          <div className={`rounded-xl px-3 py-2.5 ${note.trim() ? 'bg-tz-primary/5 border border-tz-primary/20' : 'bg-tz-cream dark:bg-gray-800'}`}>
            <input
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder={t.addNote}
              className="bg-transparent w-full focus:outline-none text-sm font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHistory(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-tz-cream dark:hover:bg-gray-800 transition-colors">
              <History className="w-3.5 h-3.5" />
              {isRTL ? 'السجل' : 'History'}
            </button>
            {onDelete && (
              <button onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-tz-red hover:bg-tz-red/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                {t.delete}
              </button>
            )}
          </div>
        </div>
      )}

      {showSubscribe && <SubscriptionPopup workspaceId={workspaceId} onClose={() => setShowSubscribe(false)} />}
      {showHistory && <SessionHistoryModal workspaceId={workspaceId} tableId={table.id} tableName={table.name} onClose={() => setShowHistory(false)} />}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={isRTL ? 'حذف الطاولة' : 'Delete Table'}
        message={isRTL ? `هل أنت متأكد من حذف "${table.name}"؟` : `Delete "${table.name}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={loading}
      />
    </div>
  );
}

export default function TableListView({ tables, allTables, workspaceId, subscriptionActive, onUpdate, onDelete }: TableListViewProps) {
  return (
    <div className="space-y-3">
      {tables.map((table) => (
        <TableListItem
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
