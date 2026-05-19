'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/shared/Toast';
import { History, Pencil, Trash2, Clock, ArrowRightLeft } from 'lucide-react';
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

interface TableCardProps {
  table: Table;
  allTables?: Table[];
  workspaceId: string;
  defaultTimerDurationMinutes: number;
  subscriptionActive: boolean;
  onUpdate: () => void;
  onDelete?: () => void;
}

const statusConfig = {
  free: {
    gradient: 'bg-gradient-to-br from-tz-green to-[#4CAF7A]',
    pillBg: 'bg-tz-green/10 text-tz-green',
    barGradient: 'bg-gradient-to-r from-tz-green to-[#4CAF7A]',
    timerColor: 'text-tz-green',
    dot: 'bg-tz-green',
  },
  occupied: {
    gradient: 'bg-gradient-to-br from-tz-blue to-[#4A90D9]',
    pillBg: 'bg-tz-blue/10 text-tz-blue',
    barGradient: 'bg-gradient-to-r from-tz-blue to-[#4A90D9]',
    timerColor: 'text-tz-blue',
    dot: 'bg-tz-blue',
  },
  warning: {
    gradient: 'bg-gradient-to-br from-tz-amber to-[#D97706]',
    pillBg: 'bg-tz-amber/10 text-tz-amber',
    barGradient: 'bg-gradient-to-r from-tz-amber to-[#D97706]',
    timerColor: 'text-tz-amber',
    dot: 'bg-tz-amber',
  },
  alert: {
    gradient: 'bg-gradient-to-br from-tz-red to-[#DC2626]',
    pillBg: 'bg-tz-red/10 text-tz-red',
    barGradient: 'bg-gradient-to-r from-tz-red to-[#DC2626]',
    timerColor: 'text-tz-red',
    dot: 'bg-tz-red',
  },
};

function formatTime(totalSeconds: number): { text: string; isOvertime: boolean } {
  const isOvertime = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  const sign = isOvertime ? '+' : '';
  return {
    text: `${sign}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    isOvertime,
  };
}

export default function TableCard({
  table,
  allTables = [],
  workspaceId,
  defaultTimerDurationMinutes,
  subscriptionActive,
  onUpdate,
  onDelete,
}: TableCardProps) {
  const { t, isRTL } = useLanguage();

  const [remainingSeconds, setRemainingSeconds] = useState(table.remainingSeconds ?? 0);
  const [note, setNote] = useState(table.note ?? '');
  const [name, setName] = useState(table.name);
  const [timerDuration, setTimerDuration] = useState(table.timerDurationMinutes);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTransferPicker, setShowTransferPicker] = useState(false);
  const transferPickerRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const noteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const oneTimeRevertRef = useRef<number | null>(null);
  const prevStatusRef = useRef<Table['status']>(table.status);

  // Compute effective status locally so warning/alert shows immediately
  // without waiting for the backend scheduler (30s tick)
  const effectiveStatus: Table['status'] = (() => {
    if (table.status === 'free') return 'free';
    if (remainingSeconds <= 0) return 'alert';
    if (remainingSeconds <= (table.warningThresholdMinutes || 5) * 60) return 'warning';
    return 'occupied';
  })();

  const displayStatus = table.status === 'free' ? 'free' : effectiveStatus;
  const config = statusConfig[displayStatus];

  useEffect(() => {
    setNote(table.note ?? '');
  }, [table.note]);

  useEffect(() => {
    setTimerDuration(table.timerDurationMinutes);
  }, [table.timerDurationMinutes]);

  useEffect(() => {
    if (table.remainingSeconds === null) {
      setRemainingSeconds(0);
      return;
    }
    setRemainingSeconds(table.remainingSeconds);
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [table.remainingSeconds]);

  const { text: timerText, isOvertime } = formatTime(remainingSeconds);
  const isOccupied = displayStatus === 'occupied' || displayStatus === 'warning' || displayStatus === 'alert';

  const handleStart = async () => {
    console.log('START CLICKED', { subscriptionActive, tableId: table.id });
    if (!subscriptionActive) {
      setShowSubscribe(true);
      return;
    }
    setLoading(true);
    try {
      await tableAPI.startTimer(workspaceId, table.id);
      onUpdate();
    } catch (err) {
      console.error('Start timer failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    console.log('STOP CLICKED', { tableId: table.id });
    setLoading(true);
    try {
      await tableAPI.stopTimer(workspaceId, table.id);
      if (oneTimeRevertRef.current !== null) {
        await tableAPI.updateTimerDuration(workspaceId, table.id, oneTimeRevertRef.current);
        oneTimeRevertRef.current = null;
      }
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleNameSave = async () => {
    setIsEditingName(false);
    if (name.trim() && name !== table.name) {
      try {
        await tableAPI.updateName(workspaceId, table.id, name.trim());
        onUpdate();
      } catch {
        setName(table.name);
      }
    }
  };

  const handleDurationSave = async () => {
    setIsEditingDuration(false);
    if (timerDuration && timerDuration !== table.timerDurationMinutes) {
      oneTimeRevertRef.current = defaultTimerDurationMinutes;
      try {
        await tableAPI.updateTimerDuration(workspaceId, table.id, timerDuration);
        onUpdate();
      } catch {
        setTimerDuration(table.timerDurationMinutes);
        oneTimeRevertRef.current = null;
      }
    }
  };

  const handleNoteChange = (val: string) => {
    setNote(val);
    if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
    noteTimeoutRef.current = setTimeout(async () => {
      try {
        await tableAPI.updateNote(workspaceId, table.id, val);
        onUpdate();
      } catch {
        // silent
      }
    }, 600);
  };

  const handleDeleteClick = () => {
    console.log('DELETE CLICKED', { tableId: table.id });
    if (!onDelete) return;
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    try {
      await tableAPI.deleteTable(workspaceId, table.id);
      showToast(isRTL ? `تم حذف "${table.name}"` : `"${table.name}" deleted`, 'success');
      onDelete?.();
    } catch (err: any) {
      showToast(err.response?.data?.error?.message || (isRTL ? 'فشل حذف الطاولة' : 'Failed to delete table'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('fromTableId', table.id);
    e.dataTransfer.setData('fromTableName', table.name);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    const fromTableId = e.dataTransfer.types.includes('fromtableid');
    if (!fromTableId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fromTableId = e.dataTransfer.getData('fromTableId');
    const fromTableName = e.dataTransfer.getData('fromTableName');
    if (!fromTableId || fromTableId === table.id) return;
    setLoading(true);
    try {
      await tableAPI.transferTimer(workspaceId, fromTableId, table.id);
      showToast(
        isRTL
          ? `تم نقل الجلسة من "${fromTableName}" إلى "${table.name}"`
          : `Session moved from "${fromTableName}" to "${table.name}"`,
        'success'
      );
      onUpdate();
    } catch (err: any) {
      console.error('Transfer (drop) error:', err);
      const msg = err.response?.data?.error?.message;
      showToast(msg || (isRTL ? 'فشل نقل الجلسة' : 'Failed to transfer session'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = table.status;
    if (prevStatus !== 'free' && table.status === 'free' && oneTimeRevertRef.current !== null) {
      const revertTo = oneTimeRevertRef.current;
      oneTimeRevertRef.current = null;
      tableAPI.updateTimerDuration(workspaceId, table.id, revertTo)
        .then(() => onUpdate())
        .catch(() => {});
    }
  }, [table.status]);

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
      console.error('Transfer error:', err);
      const msg = err.response?.data?.error?.message;
      showToast(msg || (isRTL ? 'فشل نقل الجلسة' : 'Failed to transfer session'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-[28px] shadow-sm p-6 transition-all ${
        isOccupied ? 'cursor-grab active:cursor-grabbing' : ''
      } ${isDragOver ? 'ring-2 ring-tz-primary ring-offset-2 scale-[1.02]' : ''}`}
      draggable={isOccupied}
      onDragStart={isOccupied ? handleDragStart : undefined}
      onDragOver={!isOccupied ? handleDragOver : undefined}
      onDragLeave={!isOccupied ? handleDragLeave : undefined}
      onDrop={!isOccupied ? handleDrop : undefined}
    >
      {/* Header */}
      <div className="mb-4">
        {/* Row 1: Name (full width) */}
        <div className="flex items-center gap-1.5 mb-2">
          {isEditingName ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              className="text-base font-bold bg-tz-cream dark:bg-gray-800 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-tz-primary/30 w-full max-w-[200px]"
              autoFocus
            />
          ) : (
            <>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h3 className="text-base font-bold truncate" title={table.name}>{table.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditingName(true); }}
                className="p-1 rounded-md hover:bg-tz-cream text-muted-foreground hover:text-foreground transition-colors shrink-0"
                title={t.edit}
              >
                <Pencil className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
        {/* Row 2: Actions */}
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={() => setShowHistory(true)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-tz-cream hover:text-foreground transition-colors" title="History">
            <History className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button type="button" onClick={handleDeleteClick} className="p-1.5 rounded-lg text-muted-foreground hover:bg-tz-red/10 hover:text-tz-red transition-colors" title={t.delete}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold ${config.pillBg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {t.status[displayStatus]}
          </div>
        </div>
      </div>

      {/* Timer circle */}
      <div className="flex flex-col items-center py-3">
        <div className="w-[140px] h-[140px] rounded-full flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 shadow-inner">
          <div className={`absolute inset-2 rounded-full border-[3px] ${
            displayStatus === 'free' ? 'border-tz-green/20' :
            displayStatus === 'occupied' ? 'border-tz-blue/20' :
            displayStatus === 'warning' ? 'border-tz-amber/20' :
            'border-tz-red/20'
          }`} />
          <div className={`text-[32px] font-extrabold font-mono tracking-tight leading-none ${config.timerColor}`}>
            {timerText}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 font-medium">
            {isOvertime ? t.overtime : isOccupied ? t.timeLeft : t.ready}
          </div>
        </div>
      </div>

      {/* Timer duration editor */}
      {!isOccupied && (
        <div className="flex items-center justify-center mb-3">
          {isEditingDuration ? (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number"
                min={1}
                max={300}
                value={timerDuration}
                onChange={(e) => setTimerDuration(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
                onBlur={handleDurationSave}
                onKeyDown={(e) => e.key === 'Enter' && handleDurationSave()}
                className="w-14 text-center text-sm font-bold bg-tz-cream dark:bg-gray-800 rounded-lg px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-tz-primary/30"
                autoFocus
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDuration(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-tz-cream dark:bg-gray-800 hover:bg-tz-cream-dark dark:hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              {timerDuration} {isRTL ? 'دقيقة' : 'min'}
              <Pencil className="w-3 h-3 opacity-50" />
            </button>
          )}
        </div>
      )}

      {/* Note */}
      <div className="mb-4">
        <div className={`rounded-2xl px-4 py-3.5 min-h-[52px] transition-all ${
          note.trim()
            ? 'bg-tz-primary/5 border-2 border-tz-primary/20 shadow-sm'
            : 'bg-tz-cream dark:bg-gray-800 border-2 border-transparent'
        }`}>
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-tz-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
            <input
              value={note}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder={t.addNote}
              className={`bg-transparent w-full focus:outline-none font-medium leading-relaxed ${
                note.trim()
                  ? 'text-sm text-tz-espresso dark:text-gray-100 placeholder:text-tz-primary/40'
                  : 'text-sm text-muted-foreground placeholder:text-muted-foreground/50'
              }`}
              style={{ fontSize: note.trim() ? '14px' : '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5">
        {!isOccupied ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-br from-tz-primary to-[#E87E3A] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            {t.start}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleStop}
              disabled={loading}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-br from-tz-red to-[#DC2626] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              {t.stop}
            </button>
            <div className="relative" ref={transferPickerRef}>
              <button
                type="button"
                onClick={() => setShowTransferPicker((v) => !v)}
                disabled={loading}
                className="h-12 px-3 rounded-2xl bg-tz-cream dark:bg-gray-800 hover:bg-tz-cream-dark dark:hover:bg-gray-700 text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 font-bold text-sm transition-all disabled:opacity-60 active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4" />
                {t.transfer}
              </button>
              {showTransferPicker && (
                <div className={`absolute bottom-14 ${isRTL ? 'left-0' : 'right-0'} z-20 min-w-[160px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 overflow-hidden`}>
                  <p className="text-[11px] font-semibold text-muted-foreground px-3 pb-1.5 pt-0.5">
                    {t.transferTo}
                  </p>
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
          </>
        )}
      </div>

      {showSubscribe && (
        <div className="fixed inset-0 z-50">
          <SubscriptionPopup workspaceId={workspaceId} onClose={() => setShowSubscribe(false)} />
        </div>
      )}
      {showHistory && (
        <SessionHistoryModal
          workspaceId={workspaceId}
          tableId={table.id}
          tableName={table.name}
          onClose={() => setShowHistory(false)}
        />
      )}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title={isRTL ? 'حذف الطاولة' : 'Delete Table'}
        message={isRTL ? `هل أنت متأكد من حذف "${table.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete "${table.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
        isLoading={loading}
      />
    </div>
  );
}
