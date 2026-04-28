'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, History, User } from 'lucide-react';
import { tableSessionAPI } from '@/lib/api';

interface Session {
  id: string;
  tableId: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  starterName: string | null;
}

interface Props {
  workspaceId: string;
  tableId: string;
  tableName: string;
  onClose: () => void;
}

export default function SessionHistoryModal({ workspaceId, tableId, tableName, onClose }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await tableSessionAPI.getSessions(workspaceId);
        const allSessions = res.data.data.sessions || [];
        setSessions(allSessions.filter((s: Session) => s.tableId === tableId));
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [workspaceId, tableId]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-tz-primary" />
              {tableName} — History
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-tz-cream transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No sessions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl bg-tz-cream flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">
                          {session.endedAt
                            ? new Date(session.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Running'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="w-3 h-3" />
                        {session.starterName || 'Unknown'}
                        <span className="mx-1">·</span>
                        {new Date(session.startedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-tz-primary">
                        {formatDuration(session.durationSeconds)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
