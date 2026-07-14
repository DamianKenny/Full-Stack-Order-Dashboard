'use client';

import { useState } from 'react';
import { Order } from '../types/order';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useOrderMutation } from '@/hooks/useOrderMutation';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';

interface OrderDrawerProps {
  order: Order | null;
  onClose: () => void;
  onStatusUpdated: () => void;
}

const statusSteps = ['Placed', 'Pending', 'Shipped', 'Delivered'];

export default function OrderDrawer({ order, onClose, onStatusUpdated }: OrderDrawerProps) {
  const { updateOrderStatus, isSubmitting, error } = useOrderMutation();
  const [localError, setLocalError] = useState<string | null>(null);

  if (!order) return null;

  const currentStepIndex = statusSteps.indexOf(order.status);
  const nextStatus = order.status === 'Pending' ? 'Shipped' : 'Delivered';

  const handleStatusUpdate = async () => {
    setLocalError(null);
    try {
      await updateOrderStatus(order.id, nextStatus);
      onStatusUpdated();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update status');
    }
  };

  return (
    <Sheet open={!!order} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] p-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-14 border-b shrink-0">
          <SheetTitle className="font-mono text-base font-semibold">
            {order.id}
          </SheetTitle>
        </div>

        {/* Error Banner */}
        {(error || localError) && (
          <div className="mx-6 mt-4 px-4 py-2 rounded-lg text-sm bg-destructive-foreground text-destructive border border-destructive/20">
            {localError || error}
          </div>
        )}

        {/* Status Timeline */}
        <div className="flex flex-col px-6 py-6 gap-4">
          {statusSteps.map((step, index) => {
            const isComplete = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step} className="flex gap-3">
                {/* Dot and Line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isComplete
                        ? 'bg-primary'
                        : 'border-2 border-border bg-card'
                    }`}
                  />
                  {index < statusSteps.length - 1 && (
                    <div
                      className={`w-px flex-1 my-1 min-h-[24px] ${
                        isComplete ? 'bg-primary' : 'bg-border'
                      }`}
                    />
                  )}
                </div>

                {/* Label and Timestamp */}
                <div className="flex-1 pb-6">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step}
                  </p>
                  {isComplete && order.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(order.createdAt), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Customer & Items */}
        <div className="px-6 py-5 border-t space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span className="font-medium text-foreground">{order.customerName}</span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Items</p>
            <ul className="space-y-1">
              {order.items.map((item, idx) => (
                <li key={idx} className="text-sm text-foreground flex items-start">
                  <span className="mr-2 text-muted-foreground">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Total */}
        <div className="px-6 py-5 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-lg font-mono font-semibold text-foreground">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
            Close
          </Button>
          {order.status !== 'Delivered' && (
            <Button
              className="flex-1"
              onClick={handleStatusUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : `Mark ${nextStatus}`}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}