'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="mx-8 mb-4 px-4 py-3 rounded-lg border flex items-center justify-between"
      style={{
        backgroundColor: 'var(--error-fill)',
        borderColor: 'var(--error-text)',
      }}
    >
      <div className="flex items-center gap-3">
        <AlertCircle size={18} style={{ color: 'var(--error-text)' }} />
        <p className="text-sm" style={{ color: 'var(--error-text)' }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium underline"
          style={{ color: 'var(--error-text)' }}
        >
          Retry
        </button>
      )}
    </div>
  );
}