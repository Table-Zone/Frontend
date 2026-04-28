'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) {
  const { t, isRTL } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-tz-red">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold">{title}</h3>
              </div>
              <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-muted-foreground text-sm mb-6">{message}</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 h-11 rounded-xl"
                disabled={isLoading}
              >
                {cancelLabel || t.cancel}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl bg-tz-red hover:bg-tz-red/90 text-white"
              >
                {isLoading ? t.loading : (confirmLabel || t.delete)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
