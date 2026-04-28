'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-tz-cream flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-tz-red/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-tz-red" />
            </div>
            <h1 className="text-xl font-bold text-tz-espresso mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-tz-primary hover:bg-tz-primary-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
