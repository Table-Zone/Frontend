'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

let globalConfirm: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

export function useConfirm() {
  return useCallback((options: ConfirmOptions): Promise<boolean> => {
    if (globalConfirm) {
      return globalConfirm(options);
    }
    return Promise.resolve(false);
  }, []);
}

export function ConfirmDialogProvider() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    resolve: null,
  });

  globalConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, isOpen: true, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state.resolve?.(result);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const variantStyles = {
    danger: 'border-tz-red/20 bg-tz-red/5',
    warning: 'border-tz-amber/20 bg-tz-amber/5',
    info: 'border-tz-blue/20 bg-tz-blue/5',
  };

  const confirmStyles = {
    danger: 'bg-tz-red hover:bg-tz-red/90 text-white',
    warning: 'bg-tz-amber hover:bg-tz-amber/90 text-white',
    info: 'bg-tz-primary hover:bg-tz-primary-dark text-white',
  };

  return (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => handleClose(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border-2 ${variantStyles[state.variant || 'warning']}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-tz-amber/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-tz-amber" />
              </div>
              <h3 className="text-lg font-bold text-tz-espresso">
                {state.title || 'Confirm'}
              </h3>
            </div>

            <p className="text-muted-foreground mb-6">{state.message}</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1 h-12 rounded-xl"
              >
                {state.cancelLabel || 'Cancel'}
              </Button>
              <Button
                onClick={() => handleClose(true)}
                className={`flex-1 h-12 rounded-xl ${confirmStyles[state.variant || 'warning']}`}
              >
                {state.confirmLabel || 'Confirm'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
