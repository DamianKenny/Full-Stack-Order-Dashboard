'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription, AlertAction } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="mx-8 mb-4">
      <Alert variant="destructive">
        <AlertCircle size={18} />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        {onRetry && (
          <AlertAction>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-destructive hover:bg-destructive/10"
            >
              Retry
            </Button>
          </AlertAction>
        )}
      </Alert>
    </div>
  );
}