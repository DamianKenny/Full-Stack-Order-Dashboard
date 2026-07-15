'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 2600);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed right-6 top-6 z-[60] rounded-lg border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur">
      <p className="text-sm font-medium text-foreground">{message}</p>
    </div>
  );
}
